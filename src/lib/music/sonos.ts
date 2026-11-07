/**
 * Sonos lokale besturing (UPnP/SOAP over het thuisnetwerk, poort 1400).
 *
 * Waarom lokaal en niet via Spotify: Sonos meldt zich bij de Spotify Web API als
 * "restricted" → play/pauze/skip geven 403 (D-014). De Sonos speelt onze
 * Spotify-muziek wél af, maar de BESTURING loopt rechtstreeks naar de speaker.
 *
 * Draait server-side (Mac nu, straks de Pi — beide op hetzelfde netwerk als de
 * Sonos). Geen cloud, geen sleutel. Bij falen: discrete niet-beschikbaar-status.
 */

import net from "node:net";
import os from "node:os";
import type { MusicState, Sourced } from "@/lib/adapters/types";
import { searchPlaylist } from "./spotify";

export const sonosConfig = {
  /** IP van de doel-speaker. DHCP kan dit wijzigen → overschrijfbaar via env. */
  speakerIp: process.env.SONOS_SPEAKER_IP ?? "192.168.0.247",
  /** Kamernaam voor weergave. */
  room: process.env.SONOS_ROOM ?? "Sonos Roam",
  /** Naam van de Sonos-favoriet die play() start (bv. de ochtend-playlist). */
  morningFavorite: process.env.SONOS_MORNING_FAVORITE ?? "",
  /** Spotify-account op de Sonos (uit live metadata afgeleid: sid=9, sn=2). */
  spotifySn: process.env.SONOS_SPOTIFY_SN ?? "2",
  spotifyServiceType: process.env.SONOS_SPOTIFY_SERVICE_TYPE ?? "2311",
} as const;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function xmlUnescape(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function pick(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1] : null;
}

type SonosService = "AVTransport" | "RenderingControl" | "ContentDirectory";

function servicePath(service: SonosService): string {
  if (service === "ContentDirectory") return "/MediaServer/ContentDirectory/Control";
  return `/MediaRenderer/${service}/Control`;
}

/* --- Speaker vinden op naam (robuust tegen gewijzigd DHCP-IP) --- */

/** Laatst bekende IP van de doel-speaker (begint bij de geconfigureerde waarde). */
let resolvedIp: string = sonosConfig.speakerIp;
let discovering: Promise<string> | null = null;

/** Eigen /24-subnet(ten) afleiden uit de netwerkinterfaces van de server. */
function localSubnets(): string[] {
  const out: string[] = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family === "IPv4" && !a.internal) {
        out.push(a.address.split(".").slice(0, 3).join(".") + ".");
      }
    }
  }
  return out.length ? out : ["192.168.0."];
}

/** Snelle TCP-check of poort 1400 open staat (Sonos). */
function portOpen(ip: string, timeout = 400): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    const done = (ok: boolean) => {
      sock.destroy();
      resolve(ok);
    };
    sock.setTimeout(timeout);
    sock.once("connect", () => done(true));
    sock.once("timeout", () => done(false));
    sock.once("error", () => done(false));
    sock.connect(1400, ip);
  });
}

/** Leest de kamernaam van een Sonos op `ip`, of null. */
async function roomNameAt(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`http://${ip}:1400/xml/device_description.xml`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    return pick(await res.text(), "roomName");
  } catch {
    return null;
  }
}

/** Scant het netwerk en geeft het IP van de doel-speaker (op naam) terug. */
async function discover(): Promise<string> {
  const want = sonosConfig.room.trim().toLowerCase();
  for (const base of localSubnets()) {
    const checks = await Promise.all(
      Array.from({ length: 254 }, (_, i) => portOpen(`${base}${i + 1}`).then((ok) => (ok ? `${base}${i + 1}` : null))),
    );
    const hits = checks.filter((x): x is string => x !== null);
    for (const ip of hits) {
      const room = await roomNameAt(ip);
      // Alleen de doel-speaker op exacte naam — nooit zomaar een andere speaker.
      if (room && room.trim().toLowerCase() === want) {
        resolvedIp = ip;
        return ip;
      }
    }
  }
  throw new Error(`Sonos "${sonosConfig.room}" niet gevonden op het netwerk`);
}

/** Dedupe: meerdere gelijktijdige calls delen één netwerkscan. */
function discoverOnce(): Promise<string> {
  if (!discovering) discovering = discover().finally(() => (discovering = null));
  return discovering;
}

async function doSoap(ip: string, service: SonosService, action: string, inner: string): Promise<string> {
  const stype = `urn:schemas-upnp-org:service:${service}:1`;
  const body =
    `<?xml version="1.0"?>` +
    `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">` +
    `<s:Body><u:${action} xmlns:u="${stype}">${inner}</u:${action}></s:Body></s:Envelope>`;
  const res = await fetch(`http://${ip}:1400${servicePath(service)}`, {
    method: "POST",
    headers: {
      "Content-Type": 'text/xml; charset="utf-8"',
      SOAPACTION: `"${stype}#${action}"`,
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Sonos ${action} HTTP ${res.status}`);
  return res.text();
}

async function soap(service: SonosService, action: string, inner: string): Promise<string> {
  try {
    return await doSoap(resolvedIp, service, action, inner);
  } catch {
    // Mogelijk gewijzigd IP → zoek de speaker opnieuw en probeer één keer.
    const ip = await discoverOnce();
    return doSoap(ip, service, action, inner);
  }
}

/* --- Status --- */
export async function getState(): Promise<Sourced<MusicState>> {
  try {
    const [transport, volume, position, media] = await Promise.all([
      soap("AVTransport", "GetTransportInfo", "<InstanceID>0</InstanceID>"),
      soap("RenderingControl", "GetVolume", "<InstanceID>0</InstanceID><Channel>Master</Channel>"),
      soap("AVTransport", "GetPositionInfo", "<InstanceID>0</InstanceID>"),
      soap("AVTransport", "GetMediaInfo", "<InstanceID>0</InstanceID>"),
    ]);

    const state = pick(transport, "CurrentTransportState") ?? "";
    const vol = Number(pick(volume, "CurrentVolume") ?? "0");

    // Huidig nummer uit de (geëscapete) track-metadata halen.
    const trackMeta = xmlUnescape(pick(position, "TrackMetaData") ?? "");
    const trackTitle = pick(trackMeta, "dc:title");
    // Bij radio is de track-titel vaak een stream-URL → val terug op de
    // bron-naam (bv. de favoriet "JOE België") uit de media-metadata.
    const mediaMeta = xmlUnescape(pick(media, "CurrentURIMetaData") ?? "");
    const mediaTitle = pick(mediaMeta, "dc:title");
    const looksLikeUrl = (s: string | null) =>
      !s || /[?/]|\.(aac|mp3|m3u8|flac|wav)\b/i.test(s);
    const title = (!looksLikeUrl(trackTitle) ? trackTitle : mediaTitle) ?? "—";

    return {
      source: "live",
      fetchedAt: Date.now(),
      data: {
        speaker: sonosConfig.room,
        playlist: title,
        volumePct: vol,
        playing: state === "PLAYING" || state === "TRANSITIONING",
      },
    };
  } catch {
    return { source: "live", fetchedAt: Date.now(), data: null };
  }
}

/* --- Favorieten (de kiesbare muzieklijsten) --- */

/** Haalt de ruwe <item>-blokken van de Sonos-favorieten (FV:2) op. */
async function browseFavoriteItems(): Promise<string[]> {
  const browse =
    "<ObjectID>FV:2</ObjectID><BrowseFlag>BrowseDirectChildren</BrowseFlag>" +
    "<Filter>*</Filter><StartingIndex>0</StartingIndex>" +
    "<RequestedCount>100</RequestedCount><SortCriteria></SortCriteria>";
  const res = await soap("ContentDirectory", "Browse", browse);
  const didl = xmlUnescape(pick(res, "Result") ?? "");
  return didl.match(/<item[\s\S]*?<\/item>/g) ?? [];
}

/** Namen van alle Sonos-favorieten (de lijstjes die je kunt kiezen). */
export async function listFavorites(): Promise<string[]> {
  try {
    const items = await browseFavoriteItems();
    return items.map((it) => (pick(it, "dc:title") ?? "").trim()).filter(Boolean);
  } catch {
    return [];
  }
}

/* --- Besturing --- */

/** Zoekt een Sonos-favoriet op naam en start die (SetAVTransportURI + Play). */
export async function playFavorite(name: string): Promise<boolean> {
  const items = await browseFavoriteItems();
  const wanted = name.trim().toLowerCase();
  const item = items.find((it) => (pick(it, "dc:title") ?? "").trim().toLowerCase() === wanted);
  if (!item) return false;

  const uri = pick(item, "res") ?? "";
  if (!uri) return false;
  // De afspeel-metadata zit in <r:resMD> van de favoriet.
  const resMd = item.match(/<r:resMD>([\s\S]*?)<\/r:resMD>/);
  const metadata = resMd ? xmlUnescape(resMd[1]) : "";

  await soap(
    "AVTransport",
    "SetAVTransportURI",
    `<InstanceID>0</InstanceID><CurrentURI>${xmlEscape(uri)}</CurrentURI>` +
      `<CurrentURIMetaData>${xmlEscape(metadata)}</CurrentURIMetaData>`,
  );
  await soap("AVTransport", "Play", "<InstanceID>0</InstanceID><Speed>1</Speed>");
  return true;
}

/* --- Spotify-genre rechtstreeks afspelen (Optie B) --- */

/** Muziekvoorkeuren (gedeeld server-side): genre-stijl + achtergrondvolume. */
export const musicPrefs: { style: string; volume: number } = {
  style: "mix",
  // Veilig standaard-achtergrondvolume, zodat Start nooit stil is (ook als de
  // app de instelling nog niet heeft doorgestuurd). Door de app overschreven.
  volume: 50,
};
export function setMusicPrefs(partial: { style?: string; volume?: number }) {
  if (partial.style) musicPrefs.style = partial.style;
  // Volume 0 negeren als "nog niet ingesteld" zou te ver gaan; respecteer de
  // waarde, maar de default blijft 30 tot de app iets anders stuurt.
  if (typeof partial.volume === "number") musicPrefs.volume = partial.volume;
}

/** Zoekterm per muziekstijl (terugval als de vaste lijsten falen). */
const STYLE_QUERY: Record<string, string> = {
  mix: "ochtend chill",
  jazz: "jazz chill",
  lounge: "lounge chill",
  "rustige-pop": "rustige pop",
  instrumentaal: "instrumental rustig",
  "jaren-70": "jaren 70 hits",
  "jaren-80": "jaren 80 hits",
  "franse-chansons": "franse chansons",
};

/**
 * Vaste, geverifieerde GEBRUIKERS-playlists per stijl (geen Spotify-editorial,
 * want die kan de Sonos niet laden — foutcode 800). Primaire bron; Spotify-zoeken
 * is onbetrouwbaar/leeg geworden en dient enkel als terugval. Meerdere per stijl
 * voor afwisseling en robuustheid.
 */
const STYLE_PLAYLISTS: Record<string, string[]> = {
  mix: ["0BowkHRthvLStdF5yxrPQ9", "0Vfh7Hiif45z9LdmyX1gVF"],
  jazz: ["53EkqPvkRRESegNS1fmaKi", "0Vfh7Hiif45z9LdmyX1gVF"],
  lounge: ["0erLbMzXD0U9xJUPlOeKrX", "32HiyEXKoCYkxazhRNs1Mn"],
  "rustige-pop": ["7oY1SGh06NiidddC9fjrLb"],
  instrumentaal: ["79SoVXe6nheiF41UDAiW6U"],
  // Geverifieerde publieke gebruikerslijsten (geen Spotify-editorial → laden op Sonos).
  "jaren-70": ["6kvrWkDlcqsTtACFXt8tF0", "5AM2XcKizz2Sn1fRZDr9Pp"],
  "jaren-80": ["1y2WMKnxWDualAaqRgHOXf", "6hcp5O7CD7vThKh0ufd9rE", "70N5mgNl3QBQB09zXoa72h"],
  "franse-chansons": ["2YZqxTb785xMqAJTkiz9oA", "0Gxir6hi6MrXcmOlSe1Crt", "4lqzpjx7tGLHPf8UHenfpG"],
};

/** UUID van de speaker (voor de wachtrij-URI). Gebruikt het actuele IP. */
async function fetchUuid(ip: string): Promise<string> {
  const res = await fetch(`http://${ip}:1400/xml/device_description.xml`, {
    signal: AbortSignal.timeout(5000),
  });
  const udn = pick(await res.text(), "UDN") ?? "";
  const uuid = udn.replace(/^uuid:/, "");
  if (!uuid) throw new Error("Sonos UUID niet gevonden");
  return uuid;
}
async function getDeviceUuid(): Promise<string> {
  try {
    return await fetchUuid(resolvedIp);
  } catch {
    return fetchUuid(await discoverOnce());
  }
}

/**
 * Speelt een Spotify-playlist RECHTSTREEKS op de Sonos (zonder favoriet) via de
 * wachtrij: leegmaken → playlist toevoegen (SMAPI-container) → wachtrij afspelen.
 * Formaat afgeleid uit live Sonos-metadata: sid=9, sn=2, servicetype 2311.
 */
export async function playSpotifyPlaylist(playlistId: string): Promise<boolean> {
  const enc = `spotify%3aplaylist%3a${playlistId}`;
  const container = `x-rincon-cpcontainer:1006206c${enc}?sid=9&flags=8300&sn=${sonosConfig.spotifySn}`;
  const st = sonosConfig.spotifyServiceType;
  const meta =
    `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" ` +
    `xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" ` +
    `xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/" ` +
    `xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">` +
    `<item id="1006206c${enc}" parentID="10fe2664" restricted="true">` +
    `<dc:title>Playlist</dc:title><upnp:class>object.container.playlistContainer</upnp:class>` +
    `<desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">` +
    `SA_RINCON${st}_X_#Svc${st}-0-Token</desc></item></DIDL-Lite>`;

  const uuid = await getDeviceUuid();
  await soap("AVTransport", "RemoveAllTracksFromQueue", "<InstanceID>0</InstanceID>");
  const added = await soap(
    "AVTransport",
    "AddURIToQueue",
    `<InstanceID>0</InstanceID><EnqueuedURI>${xmlEscape(container)}</EnqueuedURI>` +
      `<EnqueuedURIMetaData>${xmlEscape(meta)}</EnqueuedURIMetaData>` +
      `<DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext>`,
  );
  // Niets toegevoegd? Dan niet "spelen" op een lege wachtrij (geen geluid).
  const num = Number(pick(added, "NumTracksAdded") ?? "0");
  if (num < 1) return false;

  await soap(
    "AVTransport",
    "SetAVTransportURI",
    `<InstanceID>0</InstanceID><CurrentURI>x-rincon-queue:${uuid}#0</CurrentURI><CurrentURIMetaData></CurrentURIMetaData>`,
  );
  await soap("AVTransport", "Play", "<InstanceID>0</InstanceID><Speed>1</Speed>");
  return true;
}

/** Echte genres waaruit "mix" per dag zelf kiest (mix zelf uitgesloten). */
const MIX_GENRES = ["jazz", "lounge", "rustige-pop", "instrumentaal"];

/** Dagindex (zelfde regel als de workout-afwisseling): UTC-dag sinds epoch. */
function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000);
}

/**
 * Speelt muziek voor de gekozen stijl en laat de APP per dag zelf een keuze maken:
 * - "mix" → per dag een ander echt genre (jazz/lounge/rustige-pop/instrumentaal);
 * - binnen een genre → per dag een andere playlist uit de lijst (afwisseling).
 * Eerst de vaste, geverifieerde playlists; faalt dat, dan een Spotify-zoekresultaat.
 */
export async function playGenre(style: string, day = dayIndex()): Promise<boolean> {
  // Bij "mix" kiest de app zelf per dag een genre; anders blijft het gekozen genre.
  const effective = style === "mix" ? MIX_GENRES[day % MIX_GENRES.length] : style;

  const ids = STYLE_PLAYLISTS[effective] ?? STYLE_PLAYLISTS.mix;
  // Per dag op een andere playlist beginnen → elke ochtend iets anders.
  const shift = ids.length > 0 ? day % ids.length : 0;
  const rotated = [...ids.slice(shift), ...ids.slice(0, shift)];

  for (const id of rotated) {
    try {
      if (await playSpotifyPlaylist(id)) return true;
    } catch {
      /* probeer de volgende */
    }
  }
  // Terugval: live zoeken (kan leeg zijn door Spotify-beperkingen).
  try {
    const found = await searchPlaylist(STYLE_QUERY[effective] ?? STYLE_QUERY.mix);
    if (found && (await playSpotifyPlaylist(found.id))) return true;
  } catch {
    /* geen terugval beschikbaar */
  }
  return false;
}

/**
 * Start muziek: zoekt op Spotify een playlist bij de gekozen stijl (instellingen)
 * en speelt die rechtstreeks op de Sonos. Lukt dat niet, dan hervatten we gewoon.
 * Daarna wordt het ingestelde achtergrondvolume toegepast (indien bekend).
 */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Generatie-teller om een lopende fade te annuleren zodra er een nieuwere
 * muziekactie komt (pauze/stop/nieuwe start). Elke fade onthoudt zijn generatie
 * en stopt zodra die niet meer de actuele is.
 */
let fadeGen = 0;
/** Fade-in-duur en aantal stappen (≈1 s per stap). */
const FADE_MS = 25_000;
const FADE_STEPS = 25;

/** Bouwt het volume geleidelijk op van 0 naar `target` (achtergrond, annuleerbaar). */
async function fadeInVolume(target: number): Promise<void> {
  const myGen = ++fadeGen;
  const safe = Math.max(0, Math.min(100, Math.round(target)));
  if (safe <= 0) {
    try {
      await setVolume(0);
    } catch {
      /* niet kritisch */
    }
    return;
  }
  for (let i = 1; i <= FADE_STEPS; i++) {
    await sleep(FADE_MS / FADE_STEPS);
    if (myGen !== fadeGen) return; // nieuwere actie → fade afbreken
    try {
      await setVolume(Math.round((safe * i) / FADE_STEPS));
    } catch {
      /* volume instellen niet kritisch */
    }
  }
}

export async function play(): Promise<void> {
  const target = musicPrefs.volume ?? 50;
  // Begin op stil zodat de start niet hard binnenkomt.
  try {
    await setVolume(0);
  } catch {
    /* niet kritisch */
  }
  let started = false;
  try {
    started = await playGenre(musicPrefs.style);
  } catch {
    started = false;
  }
  if (!started) {
    await soap("AVTransport", "Play", "<InstanceID>0</InstanceID><Speed>1</Speed>");
  }
  // Zacht opbouwen naar het ingestelde volume (op de achtergrond; blokkeert niet).
  void fadeInVolume(target);
}

export async function pause(): Promise<void> {
  fadeGen++; // lopende fade annuleren
  await soap("AVTransport", "Pause", "<InstanceID>0</InstanceID>");
}

export async function setVolume(pct: number): Promise<void> {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  await soap(
    "RenderingControl",
    "SetVolume",
    `<InstanceID>0</InstanceID><Channel>Master</Channel><DesiredVolume>${clamped}</DesiredVolume>`,
  );
}

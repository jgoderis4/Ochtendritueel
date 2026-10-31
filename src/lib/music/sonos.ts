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

async function soap(service: SonosService, action: string, inner: string): Promise<string> {
  const stype = `urn:schemas-upnp-org:service:${service}:1`;
  const body =
    `<?xml version="1.0"?>` +
    `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">` +
    `<s:Body><u:${action} xmlns:u="${stype}">${inner}</u:${action}></s:Body></s:Envelope>`;
  const res = await fetch(`http://${sonosConfig.speakerIp}:1400${servicePath(service)}`, {
    method: "POST",
    headers: {
      "Content-Type": 'text/xml; charset="utf-8"',
      SOAPACTION: `"${stype}#${action}"`,
    },
    body,
    cache: "no-store",
    // Snel falen als de speaker niet bereikbaar is.
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Sonos ${action} HTTP ${res.status}`);
  return res.text();
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

/** Zoekterm per muziekstijl (instellingen) → waarmee we Spotify doorzoeken. */
const STYLE_QUERY: Record<string, string> = {
  mix: "ochtend chill",
  jazz: "jazz chill",
  lounge: "lounge chill",
  "rustige-pop": "rustige pop",
  instrumentaal: "instrumental rustig",
};

/** UUID van de speaker (voor de wachtrij-URI), eenmalig opgehaald en gecachet. */
let cachedUuid: string | null = null;
async function getDeviceUuid(): Promise<string> {
  if (cachedUuid) return cachedUuid;
  const res = await fetch(`http://${sonosConfig.speakerIp}:1400/xml/device_description.xml`, {
    signal: AbortSignal.timeout(5000),
  });
  const xml = await res.text();
  const udn = pick(xml, "UDN") ?? "";
  cachedUuid = udn.replace(/^uuid:/, "");
  if (!cachedUuid) throw new Error("Sonos UUID niet gevonden");
  return cachedUuid;
}

/**
 * Speelt een Spotify-playlist RECHTSTREEKS op de Sonos (zonder favoriet) via de
 * wachtrij: leegmaken → playlist toevoegen (SMAPI-container) → wachtrij afspelen.
 * Formaat afgeleid uit live Sonos-metadata: sid=9, sn=2, servicetype 2311.
 */
export async function playSpotifyPlaylist(playlistId: string): Promise<void> {
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
  await soap(
    "AVTransport",
    "AddURIToQueue",
    `<InstanceID>0</InstanceID><EnqueuedURI>${xmlEscape(container)}</EnqueuedURI>` +
      `<EnqueuedURIMetaData>${xmlEscape(meta)}</EnqueuedURIMetaData>` +
      `<DesiredFirstTrackNumberEnqueued>0</DesiredFirstTrackNumberEnqueued><EnqueueAsNext>1</EnqueueAsNext>`,
  );
  await soap(
    "AVTransport",
    "SetAVTransportURI",
    `<InstanceID>0</InstanceID><CurrentURI>x-rincon-queue:${uuid}#0</CurrentURI><CurrentURIMetaData></CurrentURIMetaData>`,
  );
  await soap("AVTransport", "Play", "<InstanceID>0</InstanceID><Speed>1</Speed>");
}

/** Zoekt op Spotify een playlist voor de gekozen stijl en speelt die af. */
export async function playGenre(style: string): Promise<boolean> {
  const query = STYLE_QUERY[style] ?? STYLE_QUERY.mix;
  const found = await searchPlaylist(query);
  if (!found) return false;
  await playSpotifyPlaylist(found.id);
  return true;
}

/**
 * Start muziek: zoekt op Spotify een playlist bij de gekozen stijl (instellingen)
 * en speelt die rechtstreeks op de Sonos. Lukt dat niet, dan hervatten we gewoon.
 * Daarna wordt het ingestelde achtergrondvolume toegepast (indien bekend).
 */
export async function play(): Promise<void> {
  let started = false;
  try {
    started = await playGenre(musicPrefs.style);
  } catch {
    started = false;
  }
  if (!started) {
    await soap("AVTransport", "Play", "<InstanceID>0</InstanceID><Speed>1</Speed>");
  }
  if (musicPrefs.volume != null) {
    try {
      await setVolume(musicPrefs.volume);
    } catch {
      /* volume instellen niet kritisch */
    }
  }
}

export async function pause(): Promise<void> {
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

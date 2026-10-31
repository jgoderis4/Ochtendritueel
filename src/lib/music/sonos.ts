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

export const sonosConfig = {
  /** IP van de doel-speaker. DHCP kan dit wijzigen → overschrijfbaar via env. */
  speakerIp: process.env.SONOS_SPEAKER_IP ?? "192.168.0.247",
  /** Kamernaam voor weergave. */
  room: process.env.SONOS_ROOM ?? "Sonos Roam",
  /** Naam van de Sonos-favoriet die play() start (bv. de ochtend-playlist). */
  morningFavorite: process.env.SONOS_MORNING_FAVORITE ?? "",
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

/** Woorden die op een rustige/ochtend-playlist wijzen (NL + EN). */
const CALM_KEYWORDS = [
  "rustig", "kalm", "ochtend", "morning", "calm", "chill", "chillout",
  "acoustic", "akoestisch", "piano", "klassiek", "classical", "ambient",
  "relax", "zen", "soft", "easy", "koffie", "coffee",
];

/**
 * Kiest automatisch de ochtendlijst: eerst de expliciet ingestelde favoriet,
 * anders de eerste favoriet met een "rustige" naam. null = geen geschikte keuze.
 */
export async function pickMorningFavorite(): Promise<string | null> {
  const names = await listFavorites();
  if (names.length === 0) return null;

  const configured = sonosConfig.morningFavorite.trim().toLowerCase();
  if (configured) {
    const match = names.find((n) => n.toLowerCase() === configured);
    if (match) return match;
  }
  const calm = names.find((n) => CALM_KEYWORDS.some((k) => n.toLowerCase().includes(k)));
  return calm ?? null;
}

/**
 * Start muziek: automatisch de rustige ochtendlijst (ingesteld of op naam
 * herkend), anders gewoon hervatten wat er klaarstaat.
 */
export async function play(): Promise<void> {
  const morning = await pickMorningFavorite();
  if (morning) {
    const ok = await playFavorite(morning);
    if (ok) return;
    // Favoriet niet gevonden → val terug op hervatten.
  }
  await soap("AVTransport", "Play", "<InstanceID>0</InstanceID><Speed>1</Speed>");
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

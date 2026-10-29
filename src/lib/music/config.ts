/**
 * Spotify-configuratie voor de muziek-adapter.
 * Muziek wordt gestuurd naar een Spotify Connect-toestel (de Sonos); Spotify maakt
 * zelf geen geluid, het bestuurt alleen een bestaand toestel.
 *
 * Secrets (client secret, refresh token) komen UITSLUITEND uit .env.local,
 * server-side. Nooit in de browser, nooit in git (.env* is gitignored).
 */

/** Redirect-URI moet EXACT matchen met de Spotify-app. Geen localhost (geweigerd). */
export const SPOTIFY_REDIRECT_URI = "http://127.0.0.1:3000/api/music/callback";

/** Rechten die de app vraagt bij de eenmalige login. */
export const SPOTIFY_SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "playlist-read-private",
].join(" ");

export const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
export const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
export const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export const spotifyConfig = {
  clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
  refreshToken: process.env.SPOTIFY_REFRESH_TOKEN ?? "",
  /** Doel-toestel (bv. de Sonos). Leeg = huidig actief toestel. */
  deviceName: process.env.SPOTIFY_DEVICE_NAME ?? "",
  /** Playlist die play() start wanneer er nog niets speelt. */
  defaultPlaylistUri: process.env.SPOTIFY_DEFAULT_PLAYLIST_URI ?? "",
} as const;

/** Is de koppeling volledig geconfigureerd (login gedaan)? */
export function spotifyConfigured(): boolean {
  return Boolean(
    spotifyConfig.clientId && spotifyConfig.clientSecret && spotifyConfig.refreshToken,
  );
}

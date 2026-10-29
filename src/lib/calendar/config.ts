/**
 * Outlook/Microsoft Graph-configuratie voor de agenda-adapter.
 *
 * PRIVACY (D-005): deze koppeling leidt UITSLUITEND een bestemming af voor de
 * verkeerstegel. Nooit afspraaktitel, deelnemers of andere details — niet in de
 * UI, niet in logs. Alleen de locatie van een afspraak (= waar je heen moet).
 *
 * Secrets (client secret, refresh token) komen UITSLUITEND uit .env.local,
 * server-side. Nooit in de browser, nooit in git (.env* is gitignored).
 */

/** Redirect-URI moet EXACT matchen met de Azure-app-registratie. */
export const MS_REDIRECT_URI = "http://localhost:3000/api/calendar/callback";

/**
 * Tenant: `common` werkt voor werk-/schoolaccounts én persoonlijke accounts.
 * offline_access = nodig voor een refresh token; Calendars.Read = agenda lezen.
 */
export const MS_TENANT = "common";
export const MS_SCOPES = ["offline_access", "Calendars.Read"].join(" ");

export const MS_AUTHORIZE_URL = `https://login.microsoftonline.com/${MS_TENANT}/oauth2/v2.0/authorize`;
export const MS_TOKEN_URL = `https://login.microsoftonline.com/${MS_TENANT}/oauth2/v2.0/token`;
export const MS_GRAPH_BASE = "https://graph.microsoft.com/v1.0";

/** Tijdzone voor de dag-afbakening van de agenda. */
export const CALENDAR_TIMEZONE = "Europe/Brussels";

export const calendarConfig = {
  clientId: process.env.MS_CLIENT_ID ?? "",
  clientSecret: process.env.MS_CLIENT_SECRET ?? "",
  refreshToken: process.env.MS_REFRESH_TOKEN ?? "",
} as const;

/** Is de koppeling volledig geconfigureerd (login gedaan)? */
export function calendarConfigured(): boolean {
  return Boolean(
    calendarConfig.clientId && calendarConfig.clientSecret && calendarConfig.refreshToken,
  );
}

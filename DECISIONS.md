# Beslissingen

Elke beslissing met datum, status en reden. Open punten uit [PRD.md](./PRD.md) §10 staan onderaan.

## D-001 · Stijlrichting "Aura Ochtend Dashboard"
**Datum:** 2026-10-28 · **Status:** beslist

We volgen het uitgewerkte Stitch-design-system in
`stitch_project_visualisatie_tool/aura_ochtend_dashboard/DESIGN.md`: diepe midnight/slate
ondergrond (`#0B0F17` / `#111827`), dawn-amber accent `#F59E0B`, coastal-blue `#38BDF8`
(weer/kust) en emerald `#34D399` (vlot verkeer/voltooid). Typografie Plus Jakarta Sans
(cijfers/koppen) + Inter (body/labels). 10-foot UI, leesbaar vanuit bed op 3–4 m.
**Reden:** het design is al volledig uitgewerkt én er bestaan drie afgewerkte TV-schermen
die exact deze taal volgen (PRD §6). Geen reden om opnieuw te ontwerpen.

## D-002 · Architectuur — één Next.js-webapp met `/tv` + `/app`
**Datum:** 2026-10-28 · **Status:** beslist (door gebruiker bevestigd)

TypeScript · Next.js (App Router) · Tailwind. Twee oppervlakken in één codebase:
- `/tv` — het dashboard (browser op tv of los kastje à la Chromecast/Fire TV).
- `/app` — de smartphone-bediening (responsive web; later eventueel PWA).
Beide delen de **routine-kern** (de 30-min tijdlijn/fase) zodat tv en telefoon synchroon lopen.
**Reden:** PRD §7; sluit aan bij `partner-onboarding` (ook Next.js). Eén codebase houdt het
gedeelde routine-model en de regels op één plaats.

## D-003 · Externe bronnen achter adapters, gemockt in v1
**Datum:** 2026-10-28 · **Status:** beslist

Alle externe koppelingen (weer, verkeer, nieuws, afvalkalender, Sonos, Spotify, Outlook,
tv-aansturing) zitten achter adapter-interfaces. In v1 is **mock** de enige modus, met
duidelijk gemarkeerde voorbeelddata.
**Reden:** PRD §5/§7. Zo kan het prototype nu gebouwd worden zonder op rechten/hardware te
wachten, en zonder later te herschrijven. Geen schijn van werkende integraties.

## D-004 · Placeholderdata altijd zichtbaar als voorbeeld
**Datum:** 2026-10-28 · **Status:** beslist

Zolang een bron mock is, toont de UI dat expliciet (zoals in het design: "voorbeelddata").
Bij ontbrekende/verouderde data een discrete status i.p.v. verzonnen waarden.
**Reden:** briefing-eis "doe niet alsof voorbeelddata actueel zijn" + §9 betrouwbaarheid.

## D-005 · Privacy — Outlook toont nooit afspraakdetails
**Datum:** 2026-10-28 · **Status:** beslist (harde regel)

De Outlook-adapter levert uitsluitend een afgeleide **bestemming + vertrektijd** voor de
verkeerstegel. Afspraaktitel, deelnemers of andere details komen **nooit** op het dashboard.
**Reden:** expliciete privacy-eis uit de briefing (§4.3 / §13).

## D-006 · Routine-timing als vaste 30-minuten tijdlijn
**Datum:** 2026-10-28 · **Status:** beslist

1 min welkom → dashboard → workout automatisch @10 min (tenzij overgeslagen/eerder gestart)
→ dashboard tot → einde uiterlijk @30 min. Muziek speelt van start tot einde. Starttijden
standaard werkdag 07:00, weekend + Belgische feestdag 08:00, allemaal instelbaar.
**Reden:** kerngedrag uit de briefing (§2) en PRD §4.

## D-007 · TV live gekoppeld aan gedeelde routine-store
**Datum:** 2026-10-28 · **Status:** beslist

De TV-schermen (`/tv`) leiden hun beeld live af van een **gedeelde routine-store**
(`src/lib/routine/store.ts`): `localStorage` + `BroadcastChannel` + `storage`-event.
`/tv` is een auto-runtime die op de huidige fase automatisch het juiste scherm toont
(standby → welkom → dashboard → workout → afgerond); de klokken/countdowns lopen live via
`useRoutine()` met een mount-gate tegen hydration-mismatch. De app (`/app`) gebruikt
dezelfde store, dus start/pauze/stop/overslaan zijn meteen op de TV zichtbaar.

**Sync-reikwijdte v1:** binnen **dezelfde browser/hetzelfde toestel** (meerdere
tabs/vensters). Echte **cross-device** sync (telefoon ↔ aparte tv-kast) vraagt een
server/websocket en komt later; enkel `store.ts` hoeft dan vervangen te worden — de UI
leidt af via `useRoutine()` en verandert niet.
**Reden:** PRD §7 ("v1 mag lokaal/in-memory", koppellaag bewust abstract) + §11 Stap 4
(TV en telefoon synchroon); geen schijn van cross-device sync wekken (D-004-geest).

## D-008 · Afvalkalender is de eerste echte bron (Recycle!/Fost Plus)
**Datum:** 2026-10-28 · **Status:** beslist

De afval-adapter is live via de officiële, auth-vrije Fost Plus-API
(`https://api.fostplus.be/recyclecms/public/v1`, header `x-consumer: recycleapp.be`).
Geverifieerd voor Oostduinkerke (postcode 8670, zipcodeId `8670-38014`) +
Guldenzandstraat (streetId `.../straatnaam-60585`). De call draait server-side (geen
CORS); client-componenten gaan via de eigen route `/api/waste`. Resultaat 1 uur gecachet.
Bij falen een discrete "niet beschikbaar"-status, nooit verzonnen data (§9).
`getAdapters()` is nu "mixed": alleen afval live, de rest blijft mock (D-003/D-004).
**Geverifieerd tegen IVVO:** Guldenzandstraat = Oostduinkerke **zone 3** (IVVO zone-Excel
Koksijde 2026); de hele straat is één zone → huisnummer niet zone-bepalend (1 volstaat).
De API-data matcht de IVVO zone-3 PDF, inclusief feestdag-vervangronde (PMD 11/11 → za
14/11), die de adapter correct afhandelt via `exception.replacedBy`. IVVO zelf biedt enkel
PDF's per zone (geen API), dus de gestructureerde, live Fost Plus-API blijft de bron.
**Reden:** PRD §11 Stap 5 (databronnen verifiëren, beginnen met de afvalkalender) +
§8 ("officiële bron Koksijde … nooit verzinnen").

## D-009 · Raspberry Pi als always-on runtime voor de tv
**Datum:** 2026-10-29 · **Status:** beslist (richting; uitwerking volgt)

Een kleine always-on Raspberry Pi achter de Thomson-tv wordt het kastje dat:
1. de Aura-webapp in **kioskmodus** toont (volledig scherm, Chromium);
2. de tv via **HDMI-CEC** (libcec) op tijd **aan/uit** zet (kan niet vanuit de webapp zelf
   op Google TV — zie O-1);
3. de **routine op tijd start** (scheduler/cron op de Pi).
Hiermee zijn O-1 (auto aan/uit), O-2 (triggering) en O-3 (runtime) in één opzet opgelost.
De webapp blijft onveranderd werken; dit is een deployment-/opstellingskeuze, geen
codewijziging. Uitwerking (image, autostart, CEC-scripts, scheduler) is een latere stap.
**Reden:** betrouwbaar automatisch wekken + tonen zonder afhankelijk te zijn van de
beperkingen van Google TV; gebruiker akkoord met een Pi.

**Gekozen model:** Raspberry Pi **Zero 2 W** (goedkoopste optie die én kiosk én HDMI-CEC
kan; ~€23 board). Aansluiting op de Thomson:
- **mini-HDMI → HDMI** kabel/adapter naar een HDMI-ingang van de tv (beeld + CEC);
- **micro-USB "PWR IN"** → 5V USB-voeding (de buitenste van de twee micro-USB-poorten);
- **microSD** (16 GB+) met Raspberry Pi OS + autostart Chromium-kiosk op de Aura-URL;
- WiFi ingebouwd (internet voor de live bronnen).

Boodschappenlijst naast het board (~€15): microSD 16 GB (~€6), 5V micro-USB-voeding
(~€8), mini-HDMI→HDMI kabel/adapter (~€5), optioneel behuizing (~€5). Setup kan
"headless" via WiFi/SSH (geen muis/toetsenbord nodig). Uitwerking (image flashen,
autostart-kioskscript, `cec-utils`-scripts voor aan/uit, cron voor de routine) volgt
wanneer de Pi er is.

## D-010 · Weer live via Open-Meteo (tweede echte bron)
**Datum:** 2026-10-29 · **Status:** beslist

De weer-adapter is live via Open-Meteo (`api.open-meteo.com/v1/forecast`, **geen API-sleutel**,
gratis). Twee locaties: Oostduinkerke (kust, incl. zonsop/-ondergang) en Gistel (bestemming).
WMO-weercode → NL-omschrijving, windrichting → NL-kompas, snelheid → Beaufort; regenkans en
dagmaximum uit de daily-forecast. Server-side (geen CORS); client via `/api/weather`. 15 min
gecachet. Bij falen een discrete status, nooit verzonnen data (§9). `getAdapters()` levert nu
afval + weer live, de rest mock (D-003/D-004). UI toont per tegel eerlijk "Live"/"Voorbeelddata".
**Reden:** PRD §11 Stap 5 + §8 (open weer-API, 2 locaties, zon ODK).

## D-011 · Nieuws live via openbare RSS/Atom (derde echte bron)
**Datum:** 2026-10-29 · **Status:** beslist

De nieuws-adapter is live via openbare feeds (geen login): **VRT NWS**
(`vrt.be/vrtnws/nl.rss.articles.xml`, Atom), **De Tijd** (`tijd.be/rss/nieuws.xml`, RSS)
en **Sporza** (`sporza.be/nl.rss.xml`, Atom). Lichte eigen parser (geen extra dependency)
voor beide formaten; kop + 1–2-zin samenvatting + onderwerp, getoond zonder volledige
artikels. De Tijd-abonnement is **niet** nodig (RSS is publiek; account enkel voor volledige
betaalmuur-artikels, die we niet tonen). Server-side (geen CORS); client via `/api/news`;
15 min gecachet. Falen alle feeds → discrete status, nooit verzonnen nieuws (§9).
`getAdapters()` levert nu afval + weer + nieuws live.
**Reden:** PRD §8 (RSS HLN/De Tijd/regionaal/Sporza, NL-koppen + korte samenvatting).

## D-012 · Verkeer live via OSRM (sleutelvrij), TomTom optioneel
**Datum:** 2026-10-29 · **Status:** beslist

De verkeer-adapter geeft de echte reistijd + afstand Oostduinkerke → Gistel. Standaard via
**OSRM** (`router.project-osrm.org`, sleutelvrij): basisreistijd **zonder** live verkeer,
eerlijk zo gelabeld (`trafficAware: false`, flow "onbekend"). Zet je `TOMTOM_API_KEY`, dan
gebruikt de adapter **TomTom** mét live verkeer (vertraging → flow vlot/druk/stilstaand,
`trafficAware: true`), met automatische terugval op OSRM. Server-side (geen CORS); client via
`/api/traffic`; 5 min gecachet. Bij falen discrete status, nooit verzonnen data (§9).
De UI toont bij `trafficAware: false` "Reistijd zonder live verkeer" i.p.v. een nep
vertrektijd/flow. `getAdapters()` levert nu afval + weer + nieuws + verkeer live; nog mock:
muziek (Sonos/Spotify), agenda (Outlook), tv.
**Reden:** PRD §8 (routing-API, vertrektijd-advies) zonder nu een account te vereisen; live
verkeer blijft mogelijk via een gratis TomTom-sleutel.

---

## Open punten (beslissing later)

- **O-1 · TV-merk/model** — Thomson smart-tv (merk bevestigd; exact model/OS nog te
  bevestigen). Thomson draait doorgaans **Google TV (Android)**. Gevolg: een gewone app
  (ook onze webapp) mag géén HDMI-CEC sturen (systeem-afgeschermd), dus automatisch tv
  aan/uit lukt niet vanuit de app. Betrouwbaar alternatief: een klein always-on kastje
  (bv. Raspberry Pi) via HDMI dat de webapp in kiosk toont én de tv via HDMI-CEC aan/uit
  zet — lost samen O-2 (triggering) en O-3 (runtime) op. Dashboard tonen op de tv zelf kan
  via een sideloaded kiosk-browser (bv. TV Bro / Fully Kiosk), maar is meer gefriemel.
- **O-2 · Hosting/triggering** — ✅ richting bepaald (D-009): Raspberry Pi start de routine
  op tijd (scheduler/cron). Uitwerking volgt.
- **O-3 · TV-runtime** — ✅ richting bepaald (D-009): extern kastje = Raspberry Pi in kiosk
  via HDMI; niet rechtstreeks op de Google TV. Uitwerking volgt.
- **O-4 · Smartphone-app-design** — nog te ontwerpen; stijl afgeleid van Aura (voorkeur) of apart.
- **O-5 · Afvalkalender** — ✅ opgelost (D-008): live via Fost Plus, geverifieerd als
  IVVO zone 3 voor Guldenzandstraat 8670 (hele straat = één zone, huisnummer irrelevant).
- **O-6 · Outlook-toegang** — beleid/rechten werkaccount nog te controleren.
- **O-7 · Budget** — pas bespreken nadat opties/haalbaarheid in kaart zijn (PRD §10).

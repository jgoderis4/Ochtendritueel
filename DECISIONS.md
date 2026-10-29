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

---

## Open punten (beslissing later)

- **O-1 · TV-merk/model** — volgt van gebruiker; bepaalt of automatisch tv aan/uit kan (HDMI-CEC?).
- **O-2 · Hosting/triggering** — hoe wordt de routine op tijd gestart zonder always-on apparaat?
  Gebruiker heeft nu geen server/Pi/NAS.
- **O-3 · TV-runtime** — draait de webapp rechtstreeks op de tv of is een extern kastje nodig?
- **O-4 · Smartphone-app-design** — nog te ontwerpen; stijl afgeleid van Aura (voorkeur) of apart.
- **O-5 · Afvalkalender** — ✅ opgelost (D-008): live via Fost Plus, geverifieerd als
  IVVO zone 3 voor Guldenzandstraat 8670 (hele straat = één zone, huisnummer irrelevant).
- **O-6 · Outlook-toegang** — beleid/rechten werkaccount nog te controleren.
- **O-7 · Budget** — pas bespreken nadat opties/haalbaarheid in kaart zijn (PRD §10).

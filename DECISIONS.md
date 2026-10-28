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

---

## Open punten (beslissing later)

- **O-1 · TV-merk/model** — volgt van gebruiker; bepaalt of automatisch tv aan/uit kan (HDMI-CEC?).
- **O-2 · Hosting/triggering** — hoe wordt de routine op tijd gestart zonder always-on apparaat?
  Gebruiker heeft nu geen server/Pi/NAS.
- **O-3 · TV-runtime** — draait de webapp rechtstreeks op de tv of is een extern kastje nodig?
- **O-4 · Smartphone-app-design** — nog te ontwerpen; stijl afgeleid van Aura (voorkeur) of apart.
- **O-5 · Afvalkalender** — officiële bron + juiste kalender voor Guldenzandstraat verifiëren.
- **O-6 · Outlook-toegang** — beleid/rechten werkaccount nog te controleren.
- **O-7 · Budget** — pas bespreken nadat opties/haalbaarheid in kaart zijn (PRD §10).

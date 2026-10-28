# PRD — Ochtendroutine & TV-dashboard ("Aura")

**Versie:** 0.1 (draft) · **Datum:** 2026-10-28 · **Status:** Ter review

> Bronnen: [BRIEFING.md](./BRIEFING.md) (requirements-baseline) en het Stitch-designpakket
> `stitch_project_visualisatie_tool/` (Aura design-system + 3 TV-schermen).
> Deze PRD vertaalt die input naar scope, architectuur en concrete volgende stappen.

---

## 1. Context & probleem

De gebruiker wil elke ochtend rustig en gestructureerd wakker worden. Vandaag gebeurt
dat met losse apps (wekker, weer, verkeer, muziek) en geen begeleiding. Gewenst is één
**geautomatiseerde ochtendroutine** die vanzelf opstart, een **TV-dashboard** in de
slaapkamer toont, **muziek** speelt (Sonos Roam + Spotify) en een **korte workout**
begeleidt — bedienbaar en instelbaar via een **smartphone-app**.

**Randvoorwaarden uit de briefing:**
- Begin klein, breid later uit op basis van gebruikservaring.
- Vaste dashboardindeling — elke dag gelijk, geen automatische herschikking.
- Rustig, vanuit bed leesbaar (donker, grote tegels/tekst).
- Transparant zijn over wat (nog) niet live werkt; geen schijn-integraties.
- Technische haalbaarheid éérst onderzoeken vóór hardware-/budgetkeuzes.

## 2. Visie & doel

Eén systeem met twee zichtbare oppervlakken plus een gedeelde kern:

1. **TV-dashboard** (passief, 10-foot UI) — welkomstscherm → vast dashboard → workout, met
   muziek op de achtergrond. Donker, glanceable, vaste indeling.
2. **Smartphone-app** (bediening & instellingen) — start/pauze/stop, workout overslaan,
   starttijden, muziekstijl, weekoverzicht, vakantiemodus, testfunctie.
3. **Routine-kern** (timing/orchestratie) — bestuurt de 30-minuten tijdlijn en stuurt
   dashboard + muziek + workout aan.

**Noorderster:** een routine die vanzelf en betrouwbaar loopt, vanuit bed leesbaar is,
en nooit meer toont of claimt dan wat echt werkt.

## 3. Doelgroep & gebruik

| Oppervlak | Apparaat | Afstand/context | Kernacties |
|---|---|---|---|
| TV-dashboard | TV in slaapkamer | 3–4 m, vanuit bed, gedimd | Passief kijken; evt. D-pad-navigatie |
| Smartphone-app | Telefoon | In de hand | Bedienen, instellen, testen, plannen |

Eén gebruiker (persoonlijk gebruik). Geen multi-user, accounts of rollen nodig in v1.

## 4. De 30-minuten routine (kerngedrag)

| Tijd vanaf start | Scherm / gedrag |
|---|---|
| 00:00–01:00 | **Welkomstscherm** (klok, datum, weer, begroeting, quote) |
| 01:00–10:00 | **Vast dashboard** (weer, verkeer, nieuws, afval) |
| 10:00 | **Workout** start automatisch (tenzij overgeslagen of eerder gestart) |
| workout 5–10 min | Oefeningen met beeld + instructie + countdown; muziek blijft spelen |
| na workout → 30:00 | Dashboard weer zichtbaar; muziek blijft spelen |
| uiterlijk 30:00 | Routine eindigt; muziek stopt; tv uit *(indien technisch ondersteund)* |

- Muziek start samen met de routine, speelt continu door, stopt aan het einde.
- Zichtbare countdown "tot automatisch einde (30:00 max)" tijdens de workout.
- App-acties: **nu starten · pauzeren · stoppen · workout overslaan · workout eerder starten**.
- Starttijden standaard: werkdag **07:00**, weekend + Belgische feestdag **08:00** (instelbaar).

## 5. Scope v1 (MVP) — klikbaar prototype met placeholderdata

**In scope:**
- **TV-schermen** volgens het Aura-design: welkomstscherm, vast dashboard, workoutscherm.
- Dashboardtegels: **weer** (Oostduinkerke + Gistel), **verkeer** (Oostduinkerke→Gistel),
  **nieuws** (HLN / De Tijd / Regionaal Koksijde / Sporza), **afvalophaling** (Guldenzandstraat).
- **Workout-engine**: A (kracht) / B (mobiliteit), per-oefening countdown, stilstaand beeld,
  doorlopende A/B-afwisseling, overslaan/eerder starten.
- **Routine-orchestrator**: de volledige 30-min tijdlijn + app-bediening (start/pauze/stop).
- **Smartphone-app**: bedieningsknoppen, instellingen, weekoverzicht, vakantiemodus, testfunctie.
- **Alle data als duidelijk gemarkeerde placeholder/voorbeelddata** (geen live bronnen).
- Degelijke leegstand-/foutstatussen ("gegevens niet beschikbaar"), niet doen alsof.

**Out of scope v1 (bewust later):**
- Live databronnen (weer, verkeer, nieuws, afvalkalender) — pas Fase 3.
- Echte Sonos/Spotify-bediening en Outlook-locatie — pas Fase 4.
- TV automatisch aan/uit — afhankelijk van tv-model (nog onbekend), pas Fase 5.
- Pushmeldingen, routine-geschiedenis/logboek, nachtmodus app, QR-codes, genre-uitsluitlijst.
- Getijden, binnentemperatuur, brandstofprijzen, aparte spits-/waarschuwingstegels.

## 6. Design & UX — "Aura Ochtend Dashboard"

Het design-system is al uitgewerkt (zie `stitch_.../aura_ochtend_dashboard/DESIGN.md`) en
wordt leidend voor v1. Kernpunten:

- **10-foot UI**: leesbaar vanuit bed op 3–4 m; minimale tekst 13px, body 17–20px; grote metrics.
- **Kleur**: diepe midnight/slate ondergrond (`#0B0F17` / `#111827`), **dawn amber** `#F59E0B`
  als accent, **coastal blue** `#38BDF8` (weer/kust), **emerald** `#34D399` (vlot verkeer/voltooid).
  Geen felle whites, geen harde schaduwen of glow in de slaapkamer.
- **Typografie**: Plus Jakarta Sans (cijfers/koppen), Inter (body/labels); tabular figures voor klokken/timers.
- **Layout**: vast 16:9 raster, 6-koloms/3-rij, ruime overscan-marges, vaste tegelindeling.
- **Navigatie**: passief kijken; optioneel D-pad-focus (2px amber rand, zachte halo).

> **Nog te ontwerpen:** de smartphone-app-schermen (bediening, instellingen, weekoverzicht,
> vakantiemodus, testfunctie) bestaan nog niet als design. Zie next steps.

## 7. Architectuur (voorstel, ter bevestiging)

Open vraag #7 uit de briefing (app-platform/architectuur) is nog niet beslist. Voorstel dat
aansluit bij de rest van de workspace (`partner-onboarding` = Next.js):

- **Eén Next.js-webapp** met twee routes/oppervlakken:
  - `/tv` — het dashboard (voor browser op tv of een los kastje à la Chromecast/Fire TV).
  - `/app` — de smartphone-bediening (responsive web; later evt. PWA voor "op het startscherm").
- **Gedeelde routine-state** (de tijdlijn/fase) in de kern, zodat tv en telefoon synchroon lopen.
  v1 mag lokaal/in-memory + mock; de koppellaag wordt bewust abstract gehouden.
- **Adapter-interfaces** voor alle externe bronnen (weer, verkeer, nieuws, afval, Sonos, Spotify,
  Outlook, tv-aansturing) — in v1 **gemockt**, later te vervangen door echte implementaties.
  Zo hoeft het prototype niet herschreven te worden (uitbreidbaarheidseis uit de briefing).

**Bewust nog open (haalbaarheid eerst onderzoeken):**
- Draait de webapp rechtstreeks op de tv of is een extern kastje nodig?
- Is er always-on infrastructuur nodig (gebruiker heeft nu geen server/Pi/NAS)?
- Hoe wordt de routine op tijd getriggerd zonder always-on apparaat?

## 8. Databronnen & integraties (onderzoek Fase 3–4)

| Domein | Mogelijke bron | Status | Aandachtspunt |
|---|---|---|---|
| Weer + zon | bv. open weer-API (KMI/Open-Meteo) | onderzoeken | 2 locaties, zonsop/-onder Oostduinkerke |
| Verkeer | bv. routing-API met live verkeer | onderzoeken | vertrektijd-advies, regen meewegen |
| Nieuws | RSS van HLN / De Tijd / regionaal / Sporza | onderzoeken | NL headlines + 1–2 zin samenvatting |
| Afvalkalender | officiële bron Koksijde (bv. Recycle!) | **verifiëren** | juiste adres/kalender, nooit verzinnen |
| Muziek | Sonos API + Spotify (Premium) | onderzoeken | rechten/auth, automatisch afspelen testen |
| Agenda-locatie | Outlook (werkaccount) | onderzoeken | **alleen** bestemming/vertrektijd; nooit afspraakdetails tonen |
| TV aan/uit | afhankelijk van tv-model (HDMI-CEC?) | wacht op model | automatisch aan/uit nog niet bevestigd |

**Privacy-regel (hard):** Outlook-afspraakdetails verschijnen **nooit** op het dashboard —
alleen afgeleide bestemming/vertrektijd.

## 9. Betrouwbaarheid

- Auto-retry bij tijdelijk falen van bron/Sonos/Spotify; dashboard blijft werken als een
  component uitvalt.
- Discrete "gegevens verouderd/niet beschikbaar"-status i.p.v. verzonnen data.
- Gebruik laatst bekende/gecachete waarden waar zinvol; connectiviteitscheck.
- Testfunctie in de app om elk onderdeel los te controleren.

## 10. Openstaande vragen / aannames

1. **TV-merk/model** — volgt later; blokkeert v1-prototype niet.
2. **Architectuurkeuze** — akkoord met Next.js-webapp (`/tv` + `/app`)? *(beslissing nodig)*
3. **Hosting/triggering** — hoe start de routine op tijd zonder always-on apparaat? *(onderzoek)*
4. **Outlook** — toegang/beleid werkaccount nog te controleren.
5. **Afvalkalender** — officiële bron + juiste kalender voor Guldenzandstraat verifiëren.
6. **Smartphone-app-design** — nog te ontwerpen; stijl afgeleid van Aura of apart? *(beslissing)*
7. **Budget** — pas bespreken nadat opties/haalbaarheid in kaart zijn.

---

## 11. Next steps (concreet)

### Stap 0 — Beslissingen (nu, kort)
- [ ] Architectuur bevestigen: één Next.js-webapp met `/tv` + `/app` (§7).
- [ ] Projectnaam/stack akkoord; dan `DECISIONS.md` vastleggen.

### Stap 1 — Projectopzet (Fase 1 start)
- [ ] Next.js + TypeScript + Tailwind opzetten; Aura-tokens uit `DESIGN.md` in de Tailwind-config.
- [ ] Fonts Plus Jakarta Sans + Inter; basis-layout 16:9 met overscan-safe zone.
- [ ] Mapstructuur: `tv/`, `app/`, gedeelde `routine/`-kern, `adapters/` (mock).

### Stap 2 — TV-schermen bouwen (uit de 3 designs)
- [ ] Welkomstscherm (00:00–01:00).
- [ ] Vast dashboard met tegels weer / verkeer / nieuws / afval.
- [ ] Workoutscherm met oefenbeeld-placeholder, instructie, per-oefening countdown + 30-min countdown.
- [ ] Alles op **gemarkeerde placeholderdata**.

### Stap 3 — Smartphone-app
- [ ] App-schermen ontwerpen (ontbreekt nog): bediening, instellingen, weekoverzicht, vakantie, test.
- [ ] Bedieningsknoppen koppelen aan de routine-kern (start/pauze/stop/overslaan/eerder starten).

### Stap 4 — Gedrag & timing (Fase 2)
- [ ] Routine-orchestrator: 1 min welkom → dashboard → workout @10 min → einde @30 min.
- [ ] TV en telefoon synchroon op gedeelde routine-state.

### Stap 5 — Haalbaarheidsonderzoek (parallel, Fase 3–5)
- [ ] Databronnen verifiëren (§8), te beginnen met de **afvalkalender** (officiële bron).
- [ ] Sonos/Spotify- en Outlook-rechten uitzoeken; tv-aansturing afwachten tot model bekend is.
- [ ] Hosting/triggering-opties + kosten in kaart brengen.

---

*Aanpak: eerst het klikbare prototype met placeholderdata (Fase 1), dan timing (Fase 2),
pas daarna live data en integraties. Geen claim van werkende koppelingen vóór ze getest zijn.*

# Briefing — Geautomatiseerde ochtendroutine en dashboard

**Status:** Requirements verzameld; klaar voor technische uitwerking en eerste prototype  

**Taal:** Nederlands  

**Doel:** Een persoonlijke ochtendroutine die automatisch opstart, een tv-dashboard toont, muziek afspeelt via Sonos/Spotify en een korte workout begeleidt. De gebruiker wil de tv-specificaties later aanleveren.

---

## 1. Doel en uitgangspunten

Bouw een rustige, betrouwbare en grotendeels geautomatiseerde ochtendroutine voor de slaapkamer. De interface moet vanuit bed goed leesbaar zijn en via een smartphone-app bedienbaar zijn.

Belangrijke uitgangspunten:

- Begin met een eerste versie en breid later uit op basis van gebruikservaring.

- Houd de dashboardindeling elke dag hetzelfde.

- Geen extra opvallende waarschuwingen of automatische herschikking van tegels.

- Houd de oplossing eenvoudig; geen onnodige extra functies.

- De tv-specificaties volgen later. Stel de bouw van de basisinterface daarom niet uit.

- Onderzoek technische haalbaarheid voordat definitieve keuzes worden gemaakt voor hardware, integraties en budget.

- Wees transparant over functies die nog niet werken omdat hardware, toegangsrechten of externe diensten nog niet gekoppeld zijn.

## 2. Dagelijks schema

Standaard starttijden:

- Maandag t/m vrijdag: **07.00 uur**

- Zaterdag en zondag: **08.00 uur**

- Belgische feestdagen: **08.00 uur**

Alle tijden moeten via de app instelbaar zijn. De routine loopt dagelijks, met bovenstaande standaardverschillen.

### Timing van de routine

| Tijd vanaf start | Gedrag |
|---|---|
| 00:00–01:00 | Welkomstscherm |
| 01:00–10:00 | Volledig dashboard |
| Vanaf 10:00 | Workout start automatisch, tenzij overgeslagen of eerder gestart |
| Tijdens de workout | Workout van ongeveer 5–10 minuten; muziek blijft spelen |
| Na de workout tot 30:00 | Dashboard blijft zichtbaar en muziek blijft spelen |
| Uiterlijk na 30:00 | Routine eindigt; muziek stopt en tv gaat uit als technisch ondersteund |

De routine mag maximaal 30 minuten duren. Een zichtbare countdown tijdens de workout moet tonen hoeveel tijd resteert voordat de routine automatisch stopt. De workout zelf duurt ongeveer 5–10 minuten; de resterende tijd na de workout is vrije dashboardtijd.

De gebruiker kan via de app:

- De routine direct starten.

- Alles pauzeren.

- Alles stoppen.

- De workout overslaan.

- De workout eerder starten.

De exacte betekenis en technische werking van pauzeren/stoppen moet in het ontwerp duidelijk zijn. Automatisch de tv in- en uitschakelen hangt af van het tv-model en beschikbare bedieningsmogelijkheden.

## 3. Welkomstscherm

Duur: **1 minuut**.

Toon:

- Klok en datum.

- Actueel weer.

- Een vaste begroeting.

- Een motiverende quote die dagelijks verandert.

- Een korte vriendelijke boodschap die rekening houdt met het weer, bijvoorbeeld een passende goedemorgenboodschap bij zonnig weer aan de kust.

Geen speciale feestdag- of jubileumthema's nodig.

## 4. Dashboard — vaste layout

Visuele stijl:

- Donkere achtergrond.

- Grote tegels en grote, goed leesbare tekst.

- Klok en datum blijven tijdens het hele dashboard zichtbaar, maar nemen niet te veel ruimte in.

- De interface moet vanuit bed gemakkelijk leesbaar zijn.

- Vaste tegelindeling, iedere dag gelijk.

- Geen automatische prioritering of herschikking op basis van weer, verkeer of nieuws.

- Geen extra opvallende waarschuwingstijl; belangrijke informatie verschijnt op de normale plek.

### 4.1 Weer

Voor beide locaties:

- Oostduinkerke

- Gistel

Toon:

- Actuele omstandigheden.

- Verwachting voor de rest van de dag.

- Temperatuur.

- Kans op regen.

- Wind.

Voor Oostduinkerke ook:

- Zonsopgang.

- Zonsondergang.

Niet nodig:

- Binnentemperatuur van de slaapkamer.

- Getijdeninformatie.

- Een aparte kustwaarschuwingstegel.

- Brandstofprijzen.

Ernstig weer kan waar relevant in de gewone weerinformatie of het verkeersadvies worden vermeld, zonder de vaste indeling te veranderen.

### 4.2 Nieuws

Toon Nederlandstalige headlines met een samenvatting van 1–2 zinnen. Vernieuw het nieuws kort vóór de routine start.

Gewenste bronnen en onderwerpen:

- **HLN:** Belgisch nieuws en belangrijk internationaal nieuws.

- **De Tijd:** economie, financiën en bedrijfsnieuws.

- **Regionaal nieuws rond Koksijde:** lokaal nieuws.

- **Sporza:** sportnieuws.

Sportselectie:

- Club Brugge alleen wanneer er relevant nieuws is, zoals transfers, belangrijke wedstrijden, blessures of opvallende prestaties.

- Belangrijke Europese/buitenlandse voetbalcompetities.

- Ander belangrijk sportnieuws.

- Geen overvolle, uitsluitend op uitslagen gerichte sportsectie.

Geen gesproken nieuws. QR-codes zijn niet nodig. Eventuele links naar volledige artikelen zijn nog niet beslist en kunnen later worden overwogen.

### 4.3 Verkeer

Standaardroute: **Oostduinkerke → Gistel**.

Toon:

- Snelste beschikbare route.

- Actuele verkeerssituatie.

- Files, ongevallen en wegwerkzaamheden.

- Aanbevolen uiterste vertrektijd, bijvoorbeeld: "Vertrek uiterlijk om 07.35 uur."

- Houd waar mogelijk rekening met regen en slechte weersomstandigheden.

Als er een Outlook-agenda-afspraak is op een andere locatie, krijgt die bestemming voorrang. De afspraak zelf en de afspraakdetails mogen **nooit op het dashboard worden getoond**.

Outlook-integratie moet nog onderzocht worden, inclusief toegangsrechten en eventuele beperkingen van het werkaccount. Lees alleen de informatie die nodig is om bestemming en vertrektijd te bepalen, voor zover toegestaan en technisch mogelijk.

Geen:

- Aftelklok voor woon-werkverkeer.

- Extra algemene spitsverkeer-tegel.

### 4.4 Afvalophaling

Voeg een tegel toe met de titel **"Afvalophaling vandaag"**.

Locatie/referentie:

- Guldenzandstraat, Oostduinkerke.

Gedrag:

- Toon welke afvalsoort vandaag wordt opgehaald.

- Als er vandaag geen ophaling is, toon dan de volgende ophaaldatum.

- Verwerk wijzigingen als de officiële bron die informatie beschikbaar maakt.

De juiste officiële afvalkalender/gegevensbron moet nog worden vastgesteld. Verifieer de locatie en de relevante afvalkalender; verzin geen ophaaldata.

## 5. Muziek — Sonos Roam en Spotify Premium

Huidige situatie:

- Sonos Roam in de slaapkamer, op de lader.

- Gebruiker heeft Spotify Premium.

Gewenst gedrag:

- Muziek start automatisch met de routine.

- Dezelfde muziekcontext dient voor de wekker/start en de ochtendroutine.

- Gevarieerde stijlen, bijvoorbeeld jazz, lounge, rustige pop en instrumentale muziek; niet alleen jazz.

- Instelbaar vast achtergrondvolume via de app.

- Geen fade-up nodig.

- Muziek blijft tijdens de workout spelen.

- Muziek stopt aan het einde van de routine.

Planning:

- Muziekstijl kunnen instellen per weekdag en voor toekomstige datums.

- Als er geen stijl handmatig is gepland, kies automatisch een gevarieerde mix.

- Geen favorietenbeheer of uitsluitlijst voor genres nodig.

Onderzoek de mogelijkheden en vereiste rechten voor automatische Spotify-weergave en Sonos-bediening. Claim geen werkende integratie voordat die is getest.

## 6. Workout

Frequentie: dagelijks, tenzij overgeslagen.

Timing:

- Standaard start 10 minuten nadat de routine begint.

- Gebruiker kan workout eerder starten via de smartphone-app.

- Workout kan worden overgeslagen.

- Doelduur workout: 5–10 minuten.

- De gehele ochtendroutine stopt uiterlijk na 30 minuten.

Inhoud:

- Geen apparatuur nodig.

- Weinig ruimte nodig.

- Gemiddeld fitnessniveau.

- Matige uitdaging; moeilijkheid mag geleidelijk toenemen.

- Focus op bovenlichaam, buikspieren, mobiliteit en lichte stabiliteit.

- Geen workoutgeschiedenis of trainingslog.

A/B-afwisseling doorlopend, ook over weekgrenzen heen:

- **Workout A — Kracht:** bovenlichaam en buikspieren. Voorbeelden: wall push-ups, aangepaste push-ups, plank, dead bug.

- **Workout B — Mobiliteit:** schouders, bovenrug, romp en lichte stabiliteit.

TV-weergave:

- Stilstaande afbeelding van de oefening; geen animatie of video.

- Naam van de oefening.

- Korte instructies.

- Countdown per oefening.

- Grote, leesbare tekst.

Mogelijkheden via app:

- Workout eerder starten.

- Workout overslaan.

- Pauzeren of een oefening overslaan indien haalbaar.

Na de workout blijft het dashboard zichtbaar tot het einde van de 30 minuten; muziek blijft spelen tot de routine eindigt.

## 7. Smartphone-app

De app is het centrale bedienings- en instellingenpaneel.

### 7.1 Bedieningsknoppen

- "Start mijn ochtendroutine nu"

- "Pauzeer alles"

- "Stop alles"

- "Work-out overslaan"

Onderzoek of "Stop alles" de tv ook daadwerkelijk kan uitschakelen op het gekozen apparaat.

### 7.2 Instellingen

- Starttijden voor werkdagen, weekend en Belgische feestdagen.

- Muziekvolume en muziekstijl.

- Nieuwsbronnen.

- Instellingen voor het einde van de routine.

- Vakantiemodus.

- Workoutinstellingen waar relevant.

### 7.3 Weekoverzicht

Per dag tonen:

- Starttijd.

- Geplande muziekstijl.

- Workouttype (kracht/mobiliteit).

- Vakantiestatus.

Gebruiker kan dagen en toekomstige datums vanuit het overzicht aanpassen.

### 7.4 Vakantiemodus

- Gebruiker stelt begin- en einddatum in.

- Automatische routine, wekker/start, tv en muziek worden tijdelijk uitgeschakeld.

- Na de einddatum wordt het normale schema automatisch hervat.

- Handmatig starten moet tijdens vakantie nog steeds mogelijk zijn, als gebruiker dat wil.

### 7.5 Testfunctie

Een gebruiker kan onderdelen afzonderlijk testen:

- TV/dashboard.

- Sonos/Spotify.

- Weer voor Oostduinkerke en Gistel.

- Nieuws.

- Verkeer.

- Workout en timer.

- Afvalophaling voor Guldenzandstraat, Oostduinkerke.

## 8. Betrouwbaarheid en foutafhandeling

Gewenst:

- Automatisch opnieuw proberen als Sonos/Spotify of een gegevensbron tijdelijk niet reageert.

- Dashboard blijft functioneren als een component uitvalt.

- Duidelijke, discrete meldingen als gegevens ontbreken of verouderd zijn.

- Gebruik gecachete/laatst beschikbare gegevens waar zinvol.

- Connectiviteitscontrole.

- Testfunctie om problemen te diagnosticeren.

- Automatische routine-updates waar haalbaar.

Geen prioriteit:

- Pushmeldingen over fouten of verkeer.

- Geschiedenis/logboek van uitgevoerde routines.

- Nachtmodus voor de smartphone-app.

## 9. Huidige apparatuur en situatie

Bekend:

- Sonos Roam in de slaapkamer, op de lader.

- Spotify Premium.

- Geen bestaand domoticasysteem.

- Geen permanente computer/server, NAS, Raspberry Pi of mini-pc beschikbaar.

- Tv-merk en -model volgen later; bouw van de basisinterface moet hier niet op wachten.

Later te onderzoeken:

- Mogelijkheden van de tv voor automatisch aanzetten, dashboard tonen en uitschakelen.

- Of een browser/webapp rechtstreeks op de tv kan draaien of dat een extern apparaat nodig is.

- Betrouwbare Sonos/Spotify-automatisering.

- Vereiste always-on infrastructuur, indien nodig.

- Outlook-toegang en beperkingen van een werkaccount.

- Beschikbare weer-, verkeers-, nieuws- en afvalgegevensbronnen.

- Eenmalige kosten, eventuele abonnementen en onderhoud.

## 10. Wat expliciet niet nodig is

- Automatische herschikking van dashboardtegels.

- Extra opvallende waarschuwingen.

- Taken of herinneringen uit de agenda.

- Weergave van Outlook-afspraakdetails.

- Slaapkamer-binnentemperatuur.

- Getijdeninformatie.

- Brandstofprijzen.

- Aparte algemene spitsverkeer-tegel.

- Verkeers-countdown.

- Gesproken nieuws of agenda.

- Workoutgeschiedenis.

- QR-codes bij nieuws.

- Favorieten- of genre-uitsluitlijst.

- Nachtmodus voor de app.

- Geschiedenis van routines.

## 11. Voorgestelde bouwvolgorde

### Fase 1 — UI-prototype

Maak eerst een klikbaar prototype met:

- Welkomstscherm.

- Vast tv-dashboard.

- Tegels voor weer, nieuws, verkeer en afval.

- Workoutscherm met oefenbeeld-placeholder, instructie en countdown.

- Smartphone-bedieningspaneel.

- Weekoverzicht en vakantiemodus.

- Testscherm voor componenten.

Gebruik duidelijk gemarkeerde voorbeeld-/placeholdergegevens waar live bronnen nog niet zijn gekoppeld. Doe niet alsof voorbeelddata actueel zijn.

### Fase 2 — Gedrag en timing

Implementeer en test:

- 1 minuut welkomstscherm.

- Dashboard daarna.

- Workout na 10 minuten, tenzij eerder gestart of overgeslagen.

- Dashboard en muziek blijven na de workout actief.

- Automatisch einde uiterlijk na 30 minuten.

- Bediening via de app.

### Fase 3 — Live gegevens

Onderzoek en koppel betrouwbare bronnen voor:

- Weer en zongegevens.

- Nieuws.

- Verkeer en aanbevolen vertrektijd.

- Officiële afvalkalender.

### Fase 4 — Integraties

Onderzoek en implementeer, voor zover mogelijk:

- Sonos en Spotify.

- Outlook-locatie voor afspraken, zonder agenda-details te tonen.

- TV-aan/uit en dashboardweergave.

- Vakantieplanning en automatische hervatting.

### Fase 5 — Hardware, betrouwbaarheid en kosten

- Tv-merk/model ontvangen en compatibiliteit testen.

- Bepalen of extra apparatuur nodig is.

- Foutafhandeling en reconnects testen.

- Kosten en eventueel terugkerende kosten vergelijken.

- Pas daarna de definitieve architectuur vastleggen.

## 12. Openstaande vragen en aannames

1. **TV-merk/model:** volgt later van de gebruiker.

2. **Outlook:** toegang en beleid nog controleren.

3. **Afvalkalender:** officiële bron en correcte kalender voor de opgegeven locatie verifiëren.

4. **Live data:** bronnen, API-beperkingen, actualiteit en kosten nog onderzoeken.

5. **Hosting/automatisering:** nog bepalen; gebruiker heeft momenteel geen always-on computer of domotica.

6. **TV-bediening:** automatisch aan/uit is nog niet bevestigd.

7. **App-platform en technische architectuur:** nog niet gekozen.

8. **Budget:** pas bespreken nadat opties en haalbaarheid in kaart zijn gebracht.

## 13. Instructies voor de implementerende agent

- Gebruik deze briefing als requirements-baseline.

- Begin met de UI en de lokale interacties; wacht niet op tv-details.

- Vraag alleen om noodzakelijke ontbrekende informatie, bij voorkeur één vraag per keer.

- Scheid prototypegegevens duidelijk van live gegevens.

- Maak geen claims dat externe koppelingen werken voordat ze zijn geconfigureerd en getest.

- Verander de vaste dashboardindeling niet automatisch.

- Respecteer privacy: toon nooit Outlook-afspraakdetails op het tv-dashboard.

- Ontwerp de interface toegankelijk, responsive en goed leesbaar vanaf bed.

- Houd de code en architectuur uitbreidbaar, zodat later functies kunnen worden toegevoegd zonder het prototype volledig te herschrijven.

- Documenteer afhankelijkheden, vereiste toegangsrechten, kosten en beperkingen.

# Aura — Ochtendroutine & TV-dashboard

Persoonlijke, geautomatiseerde ochtendroutine: welkomstscherm → TV-dashboard →
workout, met muziek op de achtergrond. Bediening via een smartphone-app.

Zie **[PRD.md](./PRD.md)** (requirements + next steps) en **[DECISIONS.md](./DECISIONS.md)**
(vastgelegde keuzes). De oorspronkelijke input staat in **[BRIEFING.md](./BRIEFING.md)**
en het design in `stitch_project_visualisatie_tool/`.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4. Eén codebase, twee oppervlakken
die de gedeelde routine-kern delen (D-002).

## Starten

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # productie-build
```

## Structuur

```
src/
├── app/
│   ├── page.tsx          # landing: kies TV of smartphone
│   ├── tv/               # TV-oppervlak (10-foot UI, Aura-design)
│   └── app/              # smartphone-bediening & instellingen
├── components/           # gedeelde UI (bv. MockBadge)
└── lib/
    ├── routine/          # 30-min tijdlijn/fase-logica (pure, geen IO)
    └── adapters/         # interfaces voor externe bronnen + mock (v1)
```

## Fase (zie PRD §11)

- **Fase 1 (nu):** klikbaar prototype met duidelijk gemarkeerde voorbeelddata.
- Externe koppelingen (weer, verkeer, nieuws, afval, Sonos/Spotify, Outlook, tv)
  zitten achter adapters en zijn in v1 **gemockt** (D-003). Geen schijn van werkende
  integraties.

## Design-tokens

Het Aura design-system (kleuren, typografie, spacing) staat als Tailwind-tokens in
`src/app/globals.css`, afgeleid van
`stitch_project_visualisatie_tool/aura_ochtend_dashboard/DESIGN.md`.

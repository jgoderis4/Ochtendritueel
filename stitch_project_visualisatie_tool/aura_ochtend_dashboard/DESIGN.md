---
name: Aura Ochtend Dashboard
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#4de6aa'
  on-tertiary: '#003825'
  tertiary-container: '#22c990'
  on-tertiary-container: '#004e35'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#68fcbf'
  tertiary-fixed-dim: '#45dfa4'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display-clock:
    fontFamily: Plus Jakarta Sans
    fontSize: 112px
    fontWeight: '700'
    lineHeight: 112px
    letterSpacing: -0.03em
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-metric:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  label-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.06em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.75rem
  margin: 3.5rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

This design system defines a specialized 10-foot television experience engineered specifically for morning awakening in bedroom environments. Viewed from a bed at distances between 3 and 4 meters (10–13 feet), the visual tone balances deep nocturnal tranquility with gentle atmospheric dawn illumination. The emotional atmosphere is calm, reassuring, structured, and deliberate—preventing cognitive overload and retinal strain during the first moments of wakefulness.

The design philosophy combines deep dark modular architecture with restrained, ambient warmth. Core visual tenets include:
- **Nocturnal Comfort:** Midnight and deep slate foundations absorb glare, ensuring the display emits low photon volume into a dim bedroom.
- **Glanceable Legibility:** Uncompromised visual hierarchy with massive, legible metrics and clean label pairings tailored for sleepy or unfocused eyes.
- **Subdued Dawn Signaling:** Warm amber acts as the primary visual beacon, evoking early sunrise without aggressive strobe effects or high-frequency saturation.
- **Tranquil Predictability:** Consistent card geometries, calm status signifiers, and generous negative space to present weather, coastal tides, transit to neighboring communes, audio playback, and physical morning routines with clarity and poise.

## Colors

The palette is engineered specifically for organic light-emitting diode (OLED) and bedroom television panels in ultra-low ambient light. It rejects stark pure whites and neon primaries in favor of soft, luminous tones set against deep layered slates.

### Foundation & Surfaces
- **Canvas Base (`#0B0F17`):** Deep oceanic midnight tone, preventing light bleed into the room.
- **Surface Level 1 / Tile Base (`#111827`):** Primary card container backing.
- **Surface Level 2 / Nested Elements (`#161F30`):** Elevated inner sections, progress tracks, and module segmentations.
- **Surface Border (`#1E293B`):** Low-contrast architectural containment lines.

### Accent Roles
- **Primary Dawn Amber (`#F59E0B`):** Primary focal points, active state highlights, current time markers, and subtle sunrise indicators. Never used as large filled backdrops; reserved for icons, prominent values, and active selection rims.
- **Secondary Coastal Blue (`#38BDF8`):** Marine weather, North Sea tidal levels (Oostduinkerke / Koksijde), humidity, and calm ambient environmental metrics.
- **Tertiary Vitality Emerald (`#34D399`):** Smooth transit confirmations (e.g., E40 flow towards Gistel), completed habit indicators, and stable home readiness.
- **Muted Routine Coral/Purple (`#A78BFA` / `#FB7185`):** Morning stretching, Workout A/B progression badges, and Sonos/Spotify active stream highlights.

### Text & Neutral Ramp
- **High-Contrast Text (`#F8FAFC`):** Primary large numerals, essential headlines, and critical glanceable data.
- **Mid-Contrast Neutral (`#94A3B8`):** Descriptive labels, subheadings, units of measurement, and route names.
- **Muted Inactive (`#475569`):** Secondary timestamps, unselected tabs, and resting progress tracks.

## Typography

Typography is specifically scaled for 1080p and 4K TV displays viewed from bed distances. The typographic hierarchy utilizes **Plus Jakarta Sans** for prominent numerals, temporal readouts, and module headers, leveraging its open counters and geometric balance. **Inter** provides crystalline clarity across secondary metrics, track titles, and transit descriptors.

### Typographic Principles for the 10-Foot UI
- **Minimum Legibility Floor:** Nothing drops below 13px; default content body text rests comfortably at 17–20px to prevent squinting.
- **Tabular Figures:** All temporal counters, temperatures, tidal hours, and playlist track durations enforce monospaced figure alignment (`tnum`) to eliminate layout jitter.
- **Letter Spacing Discipline:** Large numerals feature tight, optical kerning to maintain cohesive unit groups, while Dutch uppercase labels (`label-lg`, `label-md`) use generous letter spacing for effortless rapid scanning.

## Layout & Spacing

The TV canvas operates on an intentional fixed 16:9 ratio layout optimized for standard television screens. The display follows a modular 6-column / 3-row grid with fixed outer TV overscan safe zones.

### Television Canvas Configuration
- **Overscan Margins (`3.5rem` / 56px):** Generous perimeter margins ensure critical data is never clipped or distorted by television bezels or edge panels.
- **Module Gutters (`1.75rem` / 28px):** Broad negative gutters create immediate cognitive segmentation between unrelated domains (e.g., separating coastal tide data from Spotify controls).
- **Internal Module Rhythm:**
  - `space-xs` (8px): Icon and adjacent micro-label proximity.
  - `space-sm` (12px): Metric numerical baseline to companion subtitle.
  - `space-md` (20px): Inner sub-component separation inside cards.
  - `space-lg` (32px): Primary card content padding.
  - `space-xl` (48px): Section boundary splits between morning focus areas.

### Information Architecture Zones
- **Top Row (Hero Horizontal):** Large current Dutch time (`07:14`), date (`Dinsdag 24 Oktober`), North Sea weather summary, and coastal tide indicator (`Koksijde / Oostduinkerke`).
- **Main Body Left (2 Columns):** Transit & Commute flow (`N34 & E40 richting Gistel / Brugge`) with live status chips.
- **Main Body Center (2 Columns):** Routine scheduler (`Ochtend Routine: Workout A - Core & Mobiliteit`).
- **Main Body Right (2 Columns):** Multi-room audio controller (`Sonos Slaapkamer • Speelt rustige ochtendjazz via Spotify`).

## Elevation & Depth

Because this system is engineered for low-light bedroom TV panels, traditional drop shadows, harsh specular reflections, and bright glow effects are strictly prohibited. Visual depth is established through tonal layering, subtle opacity gradations, and low-contrast borders.

### Depth Hierarchy
- **Canvas Base (`#0B0F17`):** The primary backdrop of the screen. Completely flat, absorbing gaze without distraction.
- **Base Tile Surface (`#111827` at 92% opacity with 1px border `#1E293B`):** Standard resting containers for dashboard modules. Provides separation without raising brightness.
- **Nested Card Inserts (`#161F30` at 70% opacity):** Sub-elements within modules, such as individual playlist tracks, transit waypoints, or workout set indicators.
- **Active Focus & D-Pad State:** When navigated via TV remote control or voice focus, tiles do not scale up aggressively. Instead, the container border transitions from `#1E293B` to an illuminated `#F59E0B` outline with an ultra-soft, diffused amber ambient halo (`box-shadow: 0 0 24px rgba(245, 158, 11, 0.12)`).

## Shapes

The design system uses a balanced rounded architecture (level 2) to eliminate harsh, jagged corners while avoiding childish or overly pill-like bubbles. 

### Geometric Rules
- **Base Components & Buttons:** Default corner radius of `0.5rem` (8px).
- **Primary Dashboard Modules (`rounded-lg`):** Uniform corner radius of `1rem` (16px), giving information panels a soft, furniture-like poise suitable for bedroom hardware.
- **Nested Sub-panels & Progress Badges:** Scaled proportionally between `0.5rem` and `0.75rem` (8px–12px) to ensure concentric alignment with outer card frames.
- **Status Indicators & Avatars:** Fully circular (`rounded-full`) for quick optical recognition from across the room.

## Components

Components are tailored for passive observation with optional D-Pad / Smart Remote navigation. All elements prioritize instantaneous scanning at a distance.

### Modular Dashboard Tiles
- Base background of `#111827`, border `#1E293B` (1px solid), rounded to `1rem` (16px) with `2rem` (32px) internal padding.
- Card headers always feature an uppercase Dutch micro-label (`label-lg`) in `#94A3B8` accompanied by a monochrome 24px icon, keeping the interface calm and structured.

### Data Metric Displays
- High-visibility numerals using `display-metric` (`Plus Jakarta Sans`, 48px/56px) in `#F8FAFC`.
- Metric descriptors positioned directly underneath in `body-md` (`Inter`, 17px) in `#94A3B8`.
- Weather tiles pair temperature (`11°C`) with tidal predictions (`Laagwater 08:42`) and wind conditions (`4 Bft ZW`).

### Status Badges & Chips
- Compact pill-shaped modules (`height: 36px`, horizontal padding `16px`) built on `#161F30`.
- Integrated status dot (8px circular dot):
  - Emerald (`#34D399`) for on-time transit (`Vlot verkeer naar Gistel`).
  - Coastal Blue (`#38BDF8`) for maritime state (`Eb - rustige branding`).
  - Warm Amber (`#F59E0B`) for pending actions (`Start Workout A`).

### Audio & Media Module (Sonos / Spotify)
- Album art represented in a fixed 80x80px rounded square (`rounded-md`).
- Primary track title in `headline-md` (`Plus Jakarta Sans`, 22px), artist and speaker zone in `body-md` (`Sonos Slaapkamer • 24% Volume`).
- Progress bar utilizes a 6px slim track in `#1E293B` with an active fill in `#F59E0B`.

### Routine Checklist & Workout Selector
- List items structured horizontally with a fixed height of 64px.
- Left marker displays a 28px rounded checkbox/radio outline: checked states display an emerald fill (`#34D399`) with a checkmark icon; pending routines show a subtle `#1E293B` border.
- Routine items clearly articulate state: `Voltooid` (Completed) or `Klaar voor start` (Ready to begin).

### Remote Focus State (10-Foot TV Interaction)
- Interactive elements receive a crisp 2px border in `#F59E0B` when selected, paired with a subtle internal brightness lift (+4% background lightness), providing immediate visual feedback across the bedroom without jarring motion.
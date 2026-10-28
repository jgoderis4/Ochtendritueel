/**
 * Instellingen van de routine (briefing §7.2). Client-side bewaard (localStorage)
 * in Fase 1; later server-side. Bewust eenvoudig gehouden.
 */

export type MusicStyle = "mix" | "jazz" | "lounge" | "rustige-pop" | "instrumentaal";

export const MUSIC_STYLES: { value: MusicStyle; label: string }[] = [
  { value: "mix", label: "Gevarieerde mix (automatisch)" },
  { value: "jazz", label: "Jazz" },
  { value: "lounge", label: "Lounge" },
  { value: "rustige-pop", label: "Rustige pop" },
  { value: "instrumentaal", label: "Instrumentaal" },
];

export type NewsSourceKey = "HLN" | "DeTijd" | "Regionaal" | "Sporza";

export interface Settings {
  /** Starttijden per dagtype (HH:MM). */
  startWeekday: string;
  startWeekend: string;
  startHoliday: string;
  /** Vast achtergrondvolume (0–100). */
  volume: number;
  /** Standaard muziekstijl wanneer niets gepland is. */
  musicStyle: MusicStyle;
  /** Actieve nieuwsbronnen. */
  newsSources: Record<NewsSourceKey, boolean>;
  /** Maximale routineduur in minuten (einde-instelling). */
  maxDurationMin: number;
  /** Tv uitschakelen aan het einde (indien ondersteund). */
  turnOffTvAtEnd: boolean;
  /** Vakantiemodus. */
  vacation: { enabled: boolean; from: string | null; to: string | null };
}

export const DEFAULT_SETTINGS: Settings = {
  startWeekday: "07:00",
  startWeekend: "08:00",
  startHoliday: "08:00",
  volume: 30,
  musicStyle: "mix",
  newsSources: { HLN: true, DeTijd: true, Regionaal: true, Sporza: true },
  maxDurationMin: 30,
  turnOffTvAtEnd: true,
  vacation: { enabled: false, from: null, to: null },
};

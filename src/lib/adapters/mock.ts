/**
 * Mock-adapters (D-003/D-004). Deterministische voorbeelddata, afgeleid van de
 * Stitch-schermen. Alles draagt source: "mock" zodat de UI het eerlijk labelt.
 */
import type {
  Adapters,
  CalendarAdapter,
  MusicAdapter,
  MusicState,
  NewsAdapter,
  Sourced,
  TrafficAdapter,
  TvAdapter,
  WasteAdapter,
  WeatherAdapter,
} from "./types";

function sourced<T>(data: T): Sourced<T> {
  // Vaste fetchedAt (geen Date.now hier): de UI toont "voorbeelddata".
  return { source: "mock", fetchedAt: null, data };
}

const weather: WeatherAdapter = {
  async getWeather(location) {
    if (location === "Oostduinkerke") {
      return sourced({
        location: "Oostduinkerke (Kust)",
        tempC: 15,
        condition: "Licht bewolkt · Droog ochtendbriesje",
        rainChancePct: 10,
        windText: "ZW 3 Bft · 18 km/u",
        sunrise: "05:48",
        sunset: "21:38",
        forecastText: "Max 19°C · Droog",
      });
    }
    return sourced({
      location: "Gistel (Bestemming)",
      tempC: 16,
      condition: "Wisselend bewolkt",
      rainChancePct: 15,
      windText: "ZW · 15 km/u",
      forecastText: "Max 20°C",
    });
  },
};

const traffic: TrafficAdapter = {
  async getTraffic() {
    return sourced({
      fromTo: "Oostduinkerke → Gistel",
      via: "E40 / N34",
      durationMin: 24,
      distanceKm: 26.4,
      flow: "vlot",
      incidents: [],
      leaveBy: "07:35",
    });
  },
};

const news: NewsAdapter = {
  async getHeadlines() {
    return sourced([
      {
        source: "HLN",
        topic: "Belgisch nieuws",
        headline: "Nieuwe infrastructuurwerken aan de kust vlotten volgens schema.",
        summary: "Aanpassingen aan de zeewering en tramsporen tussen de badplaatsen.",
      },
      {
        source: "De Tijd",
        topic: "Economie",
        headline: "Belgische inflatie stabiliseert rond 2,3%.",
        summary: "Dankzij gematigde energieprijzen blijft de druk op de koopkracht beperkt.",
      },
      {
        source: "Regionaal",
        topic: "Koksijde / Oostduinkerke",
        headline: "Gemeente vernieuwt strandtoegangen en fietspaden tegen zomerseizoen.",
        summary: "Comfortabele houten wandelvlonders en vernieuwde fietsverbindingen.",
      },
      {
        source: "Sporza",
        topic: "Sport",
        headline: "Club Brugge rondt voorbereiding af voor Europese kwalificatiewedstrijd.",
        summary: "De kern vertoont een fitte indruk na de intensieve stage.",
      },
    ]);
  },
};

const waste: WasteAdapter = {
  async getCollection() {
    return sourced({
      address: "Guldenzandstraat, Oostduinkerke",
      todayFractions: [], // geen ophaling vandaag
      next: {
        date: "Morgen (Zaterdag 25 mei)",
        fractions: ["PMD (Blauwe zak)", "Restafval (Grijze zak)"],
        putOutFrom: "Buitenzetten mag vanaf 20:00 vanavond",
      },
    });
  },
};

const mockMusicState: MusicState = {
  speaker: "Sonos Roam • Slaapkamer",
  playlist: "Acoustic Morning",
  volumePct: 30,
  playing: false,
};

const music: MusicAdapter = {
  async getState() {
    return sourced(mockMusicState);
  },
  async play() {
    mockMusicState.playing = true;
  },
  async stop() {
    mockMusicState.playing = false;
  },
  async setVolume(pct) {
    mockMusicState.volumePct = pct;
  },
};

const calendar: CalendarAdapter = {
  async getCommuteOverride() {
    // Geen afspraak → standaardroute. NOOIT afspraakdetails teruggeven (D-005).
    return sourced({ destination: null });
  },
};

const tv: TvAdapter = {
  async turnOn() {},
  async turnOff() {},
  supportsPower() {
    return false; // tv-model nog onbekend (O-1)
  },
};

export const mockAdapters: Adapters = {
  weather,
  traffic,
  news,
  waste,
  music,
  calendar,
  tv,
};

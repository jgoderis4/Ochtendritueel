/**
 * Adresconfiguratie voor de afvalkalender (eerste echte bron, Stap 5).
 *
 * De id's zijn geverifieerd via de officiële Recycle!/Fost Plus API
 * (https://api.fostplus.be/recyclecms/public/v1):
 *   - /zipcodes?q=8670            → zipcodeId "8670-38014" (Koksijde/Oostduinkerke)
 *   - /streets?q=Guldenzandstraat → streetId  ".../straatnaam-60585"
 *
 * Geverifieerd tegen de officiële IVVO-bron: Guldenzandstraat = Oostduinkerke
 * ZONE 3 (IVVO zone-Excel Koksijde 2026). De hele straat valt onder één zone,
 * dus `houseNumber` bepaalt hier NIET de ophaalronde — 1 volstaat. De Fost Plus-API
 * levert exact deze zone-3-kalender, inclusief feestdag-vervangrondes (bv. PMD
 * 11/11 → za 14/11), die de adapter correct afhandelt.
 */
export const WASTE_CONFIG = {
  postcode: "8670",
  city: "Oostduinkerke",
  street: "Guldenzandstraat",
  zone: 3, // IVVO zone (Koksijde) — ter documentatie; API werkt op zipcode+street
  zipcodeId: "8670-38014",
  streetId: "https://data.vlaanderen.be/id/straatnaam-60585",
  houseNumber: "1",
} as const;

/**
 * Adresconfiguratie voor de afvalkalender (eerste echte bron, Stap 5).
 *
 * De id's zijn geverifieerd via de officiële Recycle!/Fost Plus API
 * (https://api.fostplus.be/recyclecms/public/v1):
 *   - /zipcodes?q=8670            → zipcodeId "8670-38014" (Koksijde/Oostduinkerke)
 *   - /streets?q=Guldenzandstraat → streetId  ".../straatnaam-60585"
 *
 * LET OP: `houseNumber` bepaalt mee welke ophaalronde geldt. Pas dit aan naar het
 * echte huisnummer; standaard staat 1 ingesteld tot dat bevestigd is.
 */
export const WASTE_CONFIG = {
  postcode: "8670",
  city: "Oostduinkerke",
  street: "Guldenzandstraat",
  zipcodeId: "8670-38014",
  streetId: "https://data.vlaanderen.be/id/straatnaam-60585",
  houseNumber: "1",
} as const;

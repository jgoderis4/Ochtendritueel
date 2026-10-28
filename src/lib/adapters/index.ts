/**
 * Adapter-selectie. v1 kent alleen "mock" (D-003).
 * Later: lees de modus uit env en kies echte implementaties.
 */
import type { Adapters } from "./types";
import { mockAdapters } from "./mock";

export const ADAPTER_MODE = "mock" as const;

export function getAdapters(): Adapters {
  return mockAdapters;
}

export * from "./types";

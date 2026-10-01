export type ProvenanceSource =
  | "sensor"
  | "user"
  | "system"
  | "model"
  | "memory"
  | "external";

export interface Provenance {
  readonly source: ProvenanceSource;
  readonly sourceId?: string;
  readonly observedAt?: string;
}
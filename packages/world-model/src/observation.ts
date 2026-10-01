import type {
  Confidence,
  ObservationId,
  Provenance,
  Timestamp,
  TruthState,
} from "@catalyst/core";

export type ObservationSubject =
  | "environment"
  | "zone"
  | "object"
  | "surface"
  | "spatial-node"
  | "relationship";

export interface Observation {
  readonly id: ObservationId;
  readonly subjectType: ObservationSubject;
  readonly subjectId?: string;
  readonly truthState: Extract<
    TruthState,
    "observed" | "inferred" | "confirmed" | "remembered"
  >;
  readonly confidence: Confidence;
  readonly provenance: Provenance;
  readonly observedAt: Timestamp;
}
import type {
  Confidence,
  EventId,
  Provenance,
  Timestamp,
  TruthState,
} from "@catalyst/core";

import type { EventType } from "./event-types.js";

export interface DomainEvent<TPayload = unknown> {
  readonly id: EventId;
  readonly type: EventType;
  readonly occurredAt: Timestamp;
  readonly recordedAt: Timestamp;
  readonly truthState: Extract<
    TruthState,
    "observed" | "inferred" | "confirmed" | "remembered" | "proposed" | "executed"
  >;
  readonly confidence: Confidence;
  readonly provenance: Provenance;
  readonly payload: TPayload;
}
import type {
  Confidence,
  EnvironmentId,
  MemoryId,
  Provenance,
  Timestamp,
  UserId,
} from "@catalyst/core";

export type MemoryType =
  | "working"
  | "episodic"
  | "semantic"
  | "spatial"
  | "temporal"
  | "user-context"
  | "environmental";

export type MemoryStrength =
  | "explicit"
  | "confirmed"
  | "strong-signal"
  | "weak-signal"
  | "transient";

export type MemoryStatus =
  | "active"
  | "stale"
  | "superseded"
  | "archived"
  | "deleted";

export interface MemoryRecord {
  readonly id: MemoryId;
  readonly userId: UserId;
  readonly environmentId?: EnvironmentId;
  readonly type: MemoryType;
  readonly strength: MemoryStrength;
  readonly status: MemoryStatus;
  readonly content: string;
  readonly confidence: Confidence;
  readonly provenance: Provenance;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly lastRecalledAt?: Timestamp;
}
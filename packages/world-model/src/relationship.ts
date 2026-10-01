import type {
  Confidence,
  Provenance,
  Timestamp,
} from "@catalyst/core";

export type RelationshipKind =
  | "near"
  | "inside"
  | "contains"
  | "supports"
  | "attached-to"
  | "adjacent-to"
  | "above"
  | "below"
  | "left-of"
  | "right-of"
  | "front-of"
  | "behind"
  | "unknown";

export interface Relationship {
  readonly subjectId: string;
  readonly kind: RelationshipKind;
  readonly targetId: string;
  readonly confidence: Confidence;
  readonly provenance: Provenance;
  readonly observedAt: Timestamp;
}
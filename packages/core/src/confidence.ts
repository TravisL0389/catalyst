export type ConfidenceLevel =
  | "high"
  | "medium"
  | "low"
  | "unknown";

export interface Confidence {
  readonly level: ConfidenceLevel;
  readonly score?: number;
}
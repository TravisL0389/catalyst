import type {
  Timestamp,
} from "@catalyst/core";

export type SurfaceId = string & {
  readonly __brand: "SurfaceId";
};

export type SurfaceKind =
  | "floor"
  | "wall"
  | "ceiling"
  | "table"
  | "shelf"
  | "counter"
  | "unknown";

export interface Surface {
  readonly id: SurfaceId;
  readonly kind: SurfaceKind;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
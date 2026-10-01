export type SpatialNodeId = string & {
  readonly __brand: "SpatialNodeId";
};

export interface Vector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface SpatialNode {
  readonly id: SpatialNodeId;
  readonly position?: Vector3;
  readonly confidence?: number;
}
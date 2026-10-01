import type {
  EnvironmentId,
  ObjectId,
  Timestamp,
} from "@catalyst/core";

export type EnvironmentSnapshotId =
  string & {
    readonly __brand: "EnvironmentSnapshotId";
  };

export interface EnvironmentSnapshot {
  readonly id: EnvironmentSnapshotId;
  readonly environmentId: EnvironmentId;
  readonly capturedAt: Timestamp;
  readonly objectIds: readonly ObjectId[];
  readonly objectCount: number;
}

export interface EnvironmentSnapshotStore {
  save(
    snapshot: EnvironmentSnapshot,
  ): Promise<EnvironmentSnapshot>;

  getById(
    id: EnvironmentSnapshotId,
  ): Promise<EnvironmentSnapshot | null>;

  listByEnvironment(
    environmentId: EnvironmentId,
  ): Promise<readonly EnvironmentSnapshot[]>;

  getLatest(
    environmentId: EnvironmentId,
  ): Promise<EnvironmentSnapshot | null>;
}

export function asEnvironmentSnapshotId(
  value: string,
): EnvironmentSnapshotId {
  return value as EnvironmentSnapshotId;
}
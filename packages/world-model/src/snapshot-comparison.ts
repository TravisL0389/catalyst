import type {
  EnvironmentSnapshot,
} from "./snapshot.js";

export type SnapshotObjectChange =
  | "added"
  | "removed"
  | "unchanged";

export interface SnapshotObjectComparison {
  readonly objectId: string;
  readonly change: SnapshotObjectChange;
}

export interface SnapshotComparison {
  readonly previousSnapshotId: string;
  readonly currentSnapshotId: string;
  readonly previousCapturedAt: string;
  readonly currentCapturedAt: string;

  readonly addedObjectIds: readonly string[];
  readonly removedObjectIds: readonly string[];
  readonly unchangedObjectIds: readonly string[];

  readonly addedCount: number;
  readonly removedCount: number;
  readonly unchangedCount: number;

  readonly hasChanges: boolean;
}

export function compareSnapshots(
  previous: EnvironmentSnapshot,
  current: EnvironmentSnapshot,
): SnapshotComparison {
  const previousIds =
    new Set(previous.objectIds);

  const currentIds =
    new Set(current.objectIds);

  const addedObjectIds =
    current.objectIds.filter(
      (id) => !previousIds.has(id),
    );

  const removedObjectIds =
    previous.objectIds.filter(
      (id) => !currentIds.has(id),
    );

  const unchangedObjectIds =
    current.objectIds.filter(
      (id) => previousIds.has(id),
    );

  return {
    previousSnapshotId: previous.id,
    currentSnapshotId: current.id,

    previousCapturedAt:
      previous.capturedAt,

    currentCapturedAt:
      current.capturedAt,

    addedObjectIds,
    removedObjectIds,
    unchangedObjectIds,

    addedCount:
      addedObjectIds.length,

    removedCount:
      removedObjectIds.length,

    unchangedCount:
      unchangedObjectIds.length,

    hasChanges:
      addedObjectIds.length > 0 ||
      removedObjectIds.length > 0,
  };
}
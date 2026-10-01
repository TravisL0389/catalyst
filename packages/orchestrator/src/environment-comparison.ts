import type {
  EnvironmentId,
} from "@catalyst/core";

import type {
  EnvironmentSnapshot,
  EnvironmentSnapshotStore,
  SnapshotComparison,
} from "@catalyst/world-model";

import {
  compareSnapshots,
} from "@catalyst/world-model";

export interface EnvironmentComparisonResult {
  readonly environmentId: EnvironmentId;
  readonly previousSnapshot: EnvironmentSnapshot;
  readonly currentSnapshot: EnvironmentSnapshot;
  readonly comparison: SnapshotComparison;
}

export class EnvironmentComparisonService {
  constructor(
    private readonly snapshots:
      EnvironmentSnapshotStore,
  ) {}

  async compareLatest(
    environmentId: EnvironmentId,
  ): Promise<
    EnvironmentComparisonResult | null
  > {
    const snapshots =
      await this.snapshots.listByEnvironment(
        environmentId,
      );

    if (snapshots.length < 2) {
      return null;
    }

    const previous =
      snapshots[snapshots.length - 2];

    const current =
      snapshots[snapshots.length - 1];

    if (
      previous === undefined ||
      current === undefined
    ) {
      return null;
    }

    return {
      environmentId,
      previousSnapshot:
        previous,
      currentSnapshot:
        current,
      comparison:
        compareSnapshots(
          previous,
          current,
        ),
    };
  }
}
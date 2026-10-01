import type {
  EnvironmentId,
} from "@catalyst/core";

import type {
  EnvironmentSnapshot,
  EnvironmentSnapshotId,
  EnvironmentSnapshotStore,
} from "../snapshot.js";

export class InMemoryEnvironmentSnapshotStore
  implements EnvironmentSnapshotStore
{
  private readonly snapshots =
    new Map<
      EnvironmentSnapshotId,
      EnvironmentSnapshot
    >();

  async save(
    snapshot: EnvironmentSnapshot,
  ): Promise<EnvironmentSnapshot> {
    this.snapshots.set(
      snapshot.id,
      snapshot,
    );

    return snapshot;
  }

  async getById(
    id: EnvironmentSnapshotId,
  ): Promise<EnvironmentSnapshot | null> {
    return (
      this.snapshots.get(id) ??
      null
    );
  }

  async listByEnvironment(
    environmentId: EnvironmentId,
  ): Promise<
    readonly EnvironmentSnapshot[]
  > {
    return [
      ...this.snapshots.values(),
    ]
      .filter(
        (snapshot) =>
          snapshot.environmentId ===
          environmentId,
      )
      .sort((a, b) =>
        a.capturedAt.localeCompare(
          b.capturedAt,
        ),
      );
  }

  async getLatest(
    environmentId: EnvironmentId,
  ): Promise<EnvironmentSnapshot | null> {
    const snapshots =
      await this.listByEnvironment(
        environmentId,
      );

    return (
      snapshots.at(-1) ??
      null
    );
  }
}
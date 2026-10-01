import {
  asEnvironmentSnapshotId,
} from "@catalyst/world-model";

import type {
  EnvironmentId,
} from "@catalyst/core";

import type {
  EventStore,
} from "@catalyst/events";

import type {
  EnvironmentSnapshot,
  EnvironmentSnapshotStore,
  WorldModelQuery,
} from "@catalyst/world-model";

export interface CaptureSnapshotResult {
  readonly snapshot: EnvironmentSnapshot;
  readonly objectCount: number;
}

export class EnvironmentSnapshotService {
  constructor(
    private readonly worldModel:
      WorldModelQuery,

    private readonly snapshots:
      EnvironmentSnapshotStore,

    private readonly events:
      EventStore,
  ) {}

  async capture(
    environmentId: EnvironmentId,
  ): Promise<CaptureSnapshotResult> {
    const objects =
      await this.worldModel.listObjects(
        environmentId,
      );

    const capturedAt =
      new Date().toISOString();

    const snapshot: EnvironmentSnapshot = {
      id: asEnvironmentSnapshotId(
        crypto.randomUUID(),
      ),

      environmentId,

      capturedAt:
        capturedAt as EnvironmentSnapshot["capturedAt"],

      objectIds:
        objects.map(
          (object) => object.id,
        ),

      objectCount:
        objects.length,
    };

    await this.snapshots.save(
      snapshot,
    );

    await this.events.append({
      id:
        crypto.randomUUID() as never,

      type: "snapshot-created",

      occurredAt:
        snapshot.capturedAt,

      recordedAt:
        snapshot.capturedAt,

      truthState: "confirmed",

      confidence: {
        level: "high",
        score: 1,
      },

      provenance: {
        source: "system",
        sourceId:
          "environment-snapshot-service",
        observedAt:
          snapshot.capturedAt,
      },

      payload: {
        environmentId:
          snapshot.environmentId,

        snapshotId:
          snapshot.id,

        objectCount:
          snapshot.objectCount,

        simulation:
          true,
      },
    });

    return {
      snapshot,
      objectCount:
        objects.length,
    };
  }

  async getLatest(
    environmentId: EnvironmentId,
  ): Promise<EnvironmentSnapshot | null> {
    return this.snapshots.getLatest(
      environmentId,
    );
  }

  async list(
    environmentId: EnvironmentId,
  ): Promise<
    readonly EnvironmentSnapshot[]
  > {
    return this.snapshots.listByEnvironment(
      environmentId,
    );
  }
}
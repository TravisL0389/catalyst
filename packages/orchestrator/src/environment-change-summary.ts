import type {
  EnvironmentId,
} from "@catalyst/core";

import type {
  SnapshotComparison,
  WorldModelStore,
} from "@catalyst/world-model";

export interface EnvironmentalChangeItem {
  readonly objectId: string;
  readonly status:
    | "added"
    | "removed";
  readonly label: string;
  readonly category: string;
}

export interface EnvironmentalChangeSummary {
  readonly environmentId: EnvironmentId;
  readonly hasChanges: boolean;
  readonly added: readonly EnvironmentalChangeItem[];
  readonly removed: readonly EnvironmentalChangeItem[];
  readonly addedCount: number;
  readonly removedCount: number;
  readonly statement: string;
}

export class EnvironmentalChangeSummaryService {
  constructor(
    private readonly worldModel:
      WorldModelStore,
  ) {}

  async summarize(
    environmentId: EnvironmentId,
    comparison: SnapshotComparison,
  ): Promise<EnvironmentalChangeSummary> {
    const added =
      await this.resolveObjects(
        comparison.addedObjectIds,
        "added",
      );

    const removed =
      await this.resolveObjects(
        comparison.removedObjectIds,
        "removed",
      );

    const hasChanges =
      added.length > 0 ||
      removed.length > 0;

    let statement =
      "No object-level differences were detected between the snapshots.";

    if (
      added.length > 0 &&
      removed.length === 0
    ) {
      statement =
        `Detected ${added.length} object${
          added.length === 1
            ? ""
            : "s"
        } not present in the previous snapshot.`;
    } else if (
      removed.length > 0 &&
      added.length === 0
    ) {
      statement =
        `Detected ${removed.length} object${
          removed.length === 1
            ? ""
            : "s"
        } no longer present in the current snapshot.`;
    } else if (
      added.length > 0 &&
      removed.length > 0
    ) {
      statement =
        `Detected ${added.length} added object${
          added.length === 1
            ? ""
            : "s"
        } and ${removed.length} removed object${
          removed.length === 1
            ? ""
            : "s"
        }.`;
    }

    return {
      environmentId,
      hasChanges,
      added,
      removed,
      addedCount:
        added.length,
      removedCount:
        removed.length,
      statement,
    };
  }

  private async resolveObjects(
    objectIds: readonly string[],
    status:
      | "added"
      | "removed",
  ): Promise<
    readonly EnvironmentalChangeItem[]
  > {
    const results:
      EnvironmentalChangeItem[] =
      [];

    for (const objectId of objectIds) {
      const object =
        await this.worldModel.getObject(
          objectId as never,
        );

      if (!object) {
        results.push({
          objectId,
          status,
          label:
            "Unknown object",
          category:
            "unknown",
        });

        continue;
      }

      results.push({
        objectId,
        status,
        label:
          object.label ??
          "Unnamed object",
        category:
          object.category ??
          "uncategorized",
      });
    }

    return results;
  }
}
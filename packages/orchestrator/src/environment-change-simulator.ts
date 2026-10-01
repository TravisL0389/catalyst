import {
  asObjectId,
  now,
} from "@catalyst/core";

import type {
  EventStore,
} from "@catalyst/events";

import type {
  RelationshipStore,
  WorldModelStore,
} from "@catalyst/world-model";

export interface SimulatedEnvironmentChange {
  readonly objectId: string;
  readonly label: string;
  readonly category: string;
  readonly environmentId: string;
  readonly simulation: true;
  readonly relationshipsCreated: number;
}

export class EnvironmentChangeSimulator {
  constructor(
    private readonly worldModel:
      WorldModelStore,

    private readonly events:
      EventStore,

    private readonly relationships:
      RelationshipStore,
  ) {}

  async addToolChest(
    environmentId: Parameters<
      WorldModelStore["listObjects"]
    >[0],
  ): Promise<SimulatedEnvironmentChange> {
    const timestamp =
      now();

    const objectId =
      asObjectId(
        crypto.randomUUID(),
      );

    const object = {
      id: objectId,
      environmentId,
      label: "Tool Chest",
      category: "storage",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.worldModel.saveObject(
      object,
    );

    await this.events.append({
      id:
        crypto.randomUUID() as never,

      type: "object-added",

      occurredAt:
        timestamp,

      recordedAt:
        timestamp,

      truthState:
        "confirmed",

      confidence: {
        level: "high",
        score: 1,
      },

      provenance: {
        source: "system",
        sourceId:
          "environment-change-simulator",
        observedAt:
          timestamp,
      },

      payload: {
        environmentId,
        objectId,
        label: object.label,
        category: object.category,
        simulation: true,
      },
    });

    /*
     * Find the existing compressor.
     * The relationship created below is part
     * of this controlled simulation.
     */
    const objects =
      await this.worldModel.listObjects(
        environmentId,
      );

    const compressor =
      objects.find(
        (candidate) =>
          candidate.label ===
          "Air Compressor",
      );

    let relationshipsCreated =
      0;

    /*
     * Tool Chest is explicitly represented
     * as being inside the Garage.
     *
     * This is structured simulated state,
     * not an AI inference.
     */
    await this.relationships.save({
      subjectId:
        objectId,

      kind:
        "inside",

      targetId:
        environmentId,

      confidence: {
        level: "high",
        score: 1,
      },

      provenance: {
        source: "system",
        sourceId:
          "environment-change-simulator",
        observedAt:
          timestamp,
      },

      observedAt:
        timestamp,
    });

    relationshipsCreated += 1;

    /*
     * For the BUILD 01 demonstration,
     * represent the Tool Chest as near the
     * Air Compressor when the compressor exists.
     */
    if (compressor) {
      await this.relationships.save({
        subjectId:
          objectId,

        kind:
          "near",

        targetId:
          compressor.id,

        confidence: {
          level: "high",
          score: 1,
        },

        provenance: {
          source: "system",
          sourceId:
            "environment-change-simulator",
          observedAt:
            timestamp,
        },

        observedAt:
          timestamp,
      });

      relationshipsCreated += 1;
    }

    return {
      objectId,
      label:
        object.label ??
        "Tool Chest",

      category:
        object.category ??
        "storage",

      environmentId,

      simulation:
        true,

      relationshipsCreated,
    };
  }
}
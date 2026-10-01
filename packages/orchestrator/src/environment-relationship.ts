import type {
  Confidence,
  Provenance,
  Timestamp,
} from "@catalyst/core";

import type {
  Relationship,
} from "@catalyst/world-model";

import type {
  RelationshipStore,
} from "@catalyst/world-model";

export interface CreateRelationshipInput {
  readonly subjectId: string;
  readonly kind: Relationship["kind"];
  readonly targetId: string;
  readonly confidence?: Confidence;
  readonly provenance?: Provenance;
  readonly observedAt?: Timestamp;
}

export interface EntityRelationshipResult {
  readonly entityId: string;
  readonly relationships:
    readonly Relationship[];
  readonly count: number;
}

export class EnvironmentRelationshipService {
  constructor(
    private readonly relationships:
      RelationshipStore,
  ) {}

  async create(
    input: CreateRelationshipInput,
  ): Promise<Relationship> {
    const observedAt =
      input.observedAt ??
      (new Date().toISOString() as Timestamp);

    const relationship: Relationship = {
      subjectId:
        input.subjectId,

      kind:
        input.kind,

      targetId:
        input.targetId,

      confidence:
        input.confidence ?? {
          level: "high",
          score: 1,
        },

      provenance:
        input.provenance ?? {
          source: "system",
          sourceId:
            "environment-relationship-service",
          observedAt,
        },

      observedAt,
    };

    return this.relationships.save(
      relationship,
    );
  }

  async getForEntity(
    entityId: string,
  ): Promise<EntityRelationshipResult> {
    const relationships =
      await this.relationships.listByEntity(
        entityId,
      );

    return {
      entityId,
      relationships,
      count:
        relationships.length,
    };
  }

  async list(): Promise<
    readonly Relationship[]
  > {
    return this.relationships.list();
  }
}
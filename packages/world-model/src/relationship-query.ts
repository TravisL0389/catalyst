import type { Relationship, RelationshipKind } from "./relationship.js";
import type { RelationshipStore } from "./relationship-store.js";

export type RelationshipQueryKind =
  | "near"
  | "inside"
  | "contains"
  | "adjacent-to"
  | "all";

export interface RelationshipQuery {
  entityId: string;
  kind: RelationshipQueryKind;
}

export interface RelationshipQueryResult {
  entityId: string;
  kind: RelationshipQueryKind;
  relationships: readonly Relationship[];
  count: number;
}

export class RelationshipQueryService {
  constructor(
    private readonly store: RelationshipStore,
  ) {}

  async query(
    query: RelationshipQuery,
  ): Promise<RelationshipQueryResult> {
    const allRelationships =
      await this.store.listByEntity(query.entityId);

    const relationships = allRelationships.filter(
      (relationship) =>
        this.matchesRelationship(
          relationship,
          query.entityId,
          query.kind,
        ),
    );

    return {
      entityId: query.entityId,
      kind: query.kind,
      relationships,
      count: relationships.length,
    };
  }

  async whatIsNear(
    entityId: string,
  ): Promise<RelationshipQueryResult> {
    return this.query({
      entityId,
      kind: "near",
    });
  }

  async whatIsInside(
    entityId: string,
  ): Promise<RelationshipQueryResult> {
    return this.query({
      entityId,
      kind: "inside",
    });
  }

  async whatContains(
    entityId: string,
  ): Promise<RelationshipQueryResult> {
    return this.query({
      entityId,
      kind: "contains",
    });
  }

  private matchesRelationship(
    relationship: Relationship,
    entityId: string,
    kind: RelationshipQueryKind,
  ): boolean {
    if (kind === "all") {
      return (
        relationship.subjectId === entityId ||
        relationship.targetId === entityId
      );
    }

    if (kind === "contains") {
      /*
       * "Garage contains Tool Chest" is represented internally as:
       *
       * Tool Chest --inside--> Garage
       *
       * Therefore a contains query looks for an "inside"
       * relationship where the queried entity is the target.
       */
      return (
        relationship.kind === "inside" &&
        relationship.targetId === entityId
      );
    }

    if (kind === "inside") {
      /*
       * "Tool Chest is inside Garage"
       */
      return (
        relationship.kind === "inside" &&
        relationship.subjectId === entityId
      );
    }

    if (kind === "near") {
      return (
        relationship.kind === "near" &&
        (
          relationship.subjectId === entityId ||
          relationship.targetId === entityId
        )
      );
    }

    if (kind === "adjacent-to") {
      return (
        relationship.kind === "adjacent-to" &&
        (
          relationship.subjectId === entityId ||
          relationship.targetId === entityId
        )
      );
    }

    return relationship.kind === (kind as RelationshipKind);
  }
}
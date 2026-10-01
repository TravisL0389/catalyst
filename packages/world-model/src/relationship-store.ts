import type {
  Relationship,
} from "./relationship.js";

export interface RelationshipStore {
  save(
    relationship: Relationship,
  ): Promise<Relationship>;

  list(): Promise<
    readonly Relationship[]
  >;

  listBySubject(
    subjectId: string,
  ): Promise<
    readonly Relationship[]
  >;

  listByTarget(
    targetId: string,
  ): Promise<
    readonly Relationship[]
  >;

  listByEntity(
    entityId: string,
  ): Promise<
    readonly Relationship[]
  >;
}

export class InMemoryRelationshipStore
  implements RelationshipStore
{
  private readonly relationships =
    new Map<
      string,
      Relationship
    >();

  async save(
    relationship: Relationship,
  ): Promise<Relationship> {
    const key =
      [
        relationship.subjectId,
        relationship.kind,
        relationship.targetId,
      ].join(":");

    this.relationships.set(
      key,
      relationship,
    );

    return relationship;
  }

  async list(): Promise<
    readonly Relationship[]
  > {
    return [
      ...this.relationships.values(),
    ];
  }

  async listBySubject(
    subjectId: string,
  ): Promise<
    readonly Relationship[]
  > {
    return [
      ...this.relationships.values(),
    ].filter(
      (relationship) =>
        relationship.subjectId ===
        subjectId,
    );
  }

  async listByTarget(
    targetId: string,
  ): Promise<
    readonly Relationship[]
  > {
    return [
      ...this.relationships.values(),
    ].filter(
      (relationship) =>
        relationship.targetId ===
        targetId,
    );
  }

  async listByEntity(
    entityId: string,
  ): Promise<
    readonly Relationship[]
  > {
    return [
      ...this.relationships.values(),
    ].filter(
      (relationship) =>
        relationship.subjectId ===
          entityId ||
        relationship.targetId ===
          entityId,
    );
  }
}
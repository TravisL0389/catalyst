import type {
  Relationship,
  RelationshipStore,
} from "@catalyst/world-model";

import {
  RelationshipQueryService,
} from "@catalyst/world-model";

export interface WorldGraphQueryInput {
  readonly question: string;
  readonly entityId: string;
}

export interface WorldGraphQueryResult {
  readonly question: string;
  readonly entityId: string;
  readonly interpretation:
    | "near"
    | "inside"
    | "contains"
    | "adjacent-to"
    | "all";

  readonly relationships:
    readonly Relationship[];

  readonly answer: string;

  readonly evidenceCount: number;
}

export class WorldGraphQueryService {
  private readonly queries:
    RelationshipQueryService;

  constructor(
    store: RelationshipStore,
  ) {
    this.queries =
      new RelationshipQueryService(
        store,
      );
  }

  async answer(
    input: WorldGraphQueryInput,
  ): Promise<WorldGraphQueryResult> {
    const interpretation =
      this.interpret(
        input.question,
      );

    const result =
      await this.queries.query({
        entityId:
          input.entityId,

        kind:
          interpretation,
      });

    const answer =
      this.formatAnswer(
        result.relationships,
        interpretation,
      );

    return {
      question:
        input.question,

      entityId:
        input.entityId,

      interpretation,

      relationships:
        result.relationships,

      answer,

      evidenceCount:
        result.count,
    };
  }

  private interpret(
    question: string,
  ):
    | "near"
    | "inside"
    | "contains"
    | "adjacent-to"
    | "all" {
    const normalized =
      question
        .toLowerCase()
        .trim();

    if (
      normalized.includes(
        "near",
      ) ||
      normalized.includes(
        "next to",
      ) ||
      normalized.includes(
        "close to",
      )
    ) {
      return "near";
    }

    if (
      normalized.includes(
        "inside",
      ) ||
      normalized.includes(
        "within",
      )
    ) {
      return "inside";
    }

    if (
      normalized.includes(
        "contain",
      ) ||
      normalized.includes(
        "in the",
      )
    ) {
      return "contains";
    }

    if (
      normalized.includes(
        "adjacent",
      )
    ) {
      return "adjacent-to";
    }

    return "all";
  }

  private formatAnswer(
    relationships:
      readonly Relationship[],
    interpretation:
      | "near"
      | "inside"
      | "contains"
      | "adjacent-to"
      | "all",
  ): string {
    if (
      relationships.length ===
      0
    ) {
      return this.noResultAnswer(
        interpretation,
      );
    }

    const names =
      relationships.map(
        (relationship) =>
          relationship.targetId,
      );

    if (
      interpretation ===
      "near"
    ) {
      return `I have ${names.length} recorded nearby relationship${
        names.length === 1
          ? ""
          : "s"
      }.`;
    }

    if (
      interpretation ===
      "inside"
    ) {
      return `The recorded relationship indicates this entity is inside another environment or container.`;
    }

    if (
      interpretation ===
      "contains"
    ) {
      return `The World Model contains ${relationships.length} recorded relationship${
        relationships.length ===
        1
          ? ""
          : "s"
      }.`;
    }

    return `The World Model has ${relationships.length} recorded relationship${
      relationships.length ===
      1
        ? ""
        : "s"
    } for this entity.`;
  }

  private noResultAnswer(
    interpretation:
      | "near"
      | "inside"
      | "contains"
      | "adjacent-to"
      | "all",
  ): string {
    switch (
      interpretation
    ) {
      case "near":
        return "I have no recorded nearby relationship for this entity.";

      case "inside":
        return "I have no recorded containment relationship for this entity.";

      case "contains":
        return "I have no recorded contents relationship for this entity.";

      case "adjacent-to":
        return "I have no recorded adjacent relationship for this entity.";

      default:
        return "I have no recorded World Graph relationships for this entity.";
    }
  }
}
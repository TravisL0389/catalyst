import type {
  EnvironmentId,
} from "@catalyst/core";

import type {
  WorldObject,
} from "./object.js";

import type {
  WorldModelQuery,
} from "./query.js";

export interface EnvironmentContents {
  readonly environmentId: EnvironmentId;
  readonly objects: readonly WorldObject[];
  readonly objectCount: number;
}

export interface ObjectSearchResult {
  readonly environmentId: EnvironmentId;
  readonly query: string;
  readonly matches: readonly WorldObject[];
  readonly matchCount: number;
}

export class WorldModelQueryService {
  constructor(
    private readonly query: WorldModelQuery,
  ) {}

  async getEnvironmentContents(
    environmentId: EnvironmentId,
  ): Promise<EnvironmentContents> {
    const objects =
      await this.query.listObjects(environmentId);

    return {
      environmentId,
      objects,
      objectCount: objects.length,
    };
  }

  async findObjects(
    environmentId: EnvironmentId,
    query: string,
  ): Promise<ObjectSearchResult> {
    const normalizedQuery =
      query.trim();

    if (!normalizedQuery) {
      return {
        environmentId,
        query: normalizedQuery,
        matches: [],
        matchCount: 0,
      };
    }

    const matches =
      await this.query.findObjectsByLabel(
        environmentId,
        normalizedQuery,
      );

    return {
      environmentId,
      query: normalizedQuery,
      matches,
      matchCount: matches.length,
    };
  }
}
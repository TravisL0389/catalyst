import type {
  EnvironmentId,
  ObjectId,
} from "@catalyst/core";

import type {
  Environment,
  WorldObject,
} from "./index.js";

export interface WorldModelQuery {
  getEnvironment(
    id: EnvironmentId,
  ): Promise<Environment | null>;

  listObjects(
    environmentId: EnvironmentId,
  ): Promise<readonly WorldObject[]>;

  getObject(
    id: ObjectId,
  ): Promise<WorldObject | null>;

  findObjectsByLabel(
    environmentId: EnvironmentId,
    label: string,
  ): Promise<readonly WorldObject[]>;
}
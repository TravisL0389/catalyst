import type {
  EnvironmentId,
  ObjectId,
} from "@catalyst/core";

import type {
  Environment,
  WorldObject,
} from "./index.js";

export interface WorldModelStore {
  getEnvironment(
    id: EnvironmentId,
  ): Promise<Environment | null>;

  saveEnvironment(
    environment: Environment,
  ): Promise<Environment>;

  getObject(
    id: ObjectId,
  ): Promise<WorldObject | null>;

  saveObject(
    object: WorldObject,
  ): Promise<WorldObject>;

  listObjects(
    environmentId: EnvironmentId,
  ): Promise<readonly WorldObject[]>;
}
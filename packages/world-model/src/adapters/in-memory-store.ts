import type {
  EnvironmentId,
  ObjectId,
} from "@catalyst/core";

import type {
  Environment,
  WorldObject,
} from "../index.js";

import type {
  WorldModelStore,
} from "../store.js";

import type {
  WorldModelQuery,
} from "../query.js";

export class InMemoryWorldModelStore
  implements WorldModelStore, WorldModelQuery
{
  private readonly environments =
    new Map<EnvironmentId, Environment>();

  private readonly objects =
    new Map<ObjectId, WorldObject>();

  async getEnvironment(
    id: EnvironmentId,
  ): Promise<Environment | null> {
    return this.environments.get(id) ?? null;
  }

  async saveEnvironment(
    environment: Environment,
  ): Promise<Environment> {
    this.environments.set(
      environment.id,
      environment,
    );

    return environment;
  }

  async getObject(
    id: ObjectId,
  ): Promise<WorldObject | null> {
    return this.objects.get(id) ?? null;
  }

  async saveObject(
    object: WorldObject,
  ): Promise<WorldObject> {
    this.objects.set(
      object.id,
      object,
    );

    return object;
  }

  async listObjects(
    environmentId: EnvironmentId,
  ): Promise<readonly WorldObject[]> {
    return [
      ...this.objects.values(),
    ].filter(
      (object) =>
        object.environmentId === environmentId,
    );
  }

  async findObjectsByLabel(
    environmentId: EnvironmentId,
    label: string,
  ): Promise<readonly WorldObject[]> {
    const normalizedLabel =
      label.trim().toLowerCase();

    return [
      ...this.objects.values(),
    ].filter(
      (object) =>
        object.environmentId === environmentId &&
        object.label?.toLowerCase().includes(
          normalizedLabel,
        ),
    );
  }
}
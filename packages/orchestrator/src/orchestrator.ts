import type {
  EnvironmentId,
  SessionId,
} from "@catalyst/core";

import type {
  MemoryCoordinator,
} from "@catalyst/memory";

import type {
  ModelRouter,
} from "@catalyst/model-router";

import type {
  CognitiveState,
} from "./cognitive-state.js";

export interface OrchestratorDependencies {
  readonly modelRouter: ModelRouter;
  readonly memoryCoordinator: MemoryCoordinator;
}

export interface StartSessionInput {
  readonly sessionId: SessionId;
  readonly environmentId?: EnvironmentId;
}

export class CatalystOrchestrator {
  constructor(
    private readonly dependencies: OrchestratorDependencies,
  ) {}

  startSession(
    input: StartSessionInput,
  ): CognitiveState {
    return {
  sessionId: input.sessionId,
  ...(input.environmentId !== undefined
    ? { environmentId: input.environmentId }
    : {}),
  activeCapability: "perceive",
  updatedAt: new Date().toISOString() as CognitiveState["updatedAt"],
};
  }

  getModelRouter(): ModelRouter {
    return this.dependencies.modelRouter;
  }

  getMemoryCoordinator(): MemoryCoordinator {
    return this.dependencies.memoryCoordinator;
  }
}
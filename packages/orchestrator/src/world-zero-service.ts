import { asEventId, now } from "@catalyst/core";

import type { EventStore } from "@catalyst/events";

import type {
  MemoryCoordinator,
  MemoryPolicy,
} from "@catalyst/memory";

import type { SessionStore } from "@catalyst/session";

import type { TaskState } from "@catalyst/task-state";

import type { WorldModelStore } from "@catalyst/world-model";

import {
  deriveCapabilityStateFromEvents,
  type CapabilityStateSet,
} from "./capability-state.js";

import type { WorldZero } from "./world-zero.js";

export interface WorldZeroResult {
  readonly world: WorldZero;
  readonly taskState: TaskState;
  readonly memoryCreated: boolean;
  readonly capabilityState: CapabilityStateSet;
}

export interface WorldZeroServiceDependencies {
  readonly sessions: SessionStore;
  readonly worldModel: WorldModelStore;
  readonly events: EventStore;
  readonly memory: MemoryCoordinator;
}

export class WorldZeroService {
  constructor(
    private readonly dependencies: WorldZeroServiceDependencies,
  ) {}

  async initialize(
    world: WorldZero,
    memoryPolicy: MemoryPolicy,
  ): Promise<WorldZeroResult> {
    const timestamp = now();

    await this.dependencies.sessions.create({
      id: world.sessionId,
      userId: world.userId,
      environmentId: world.environment.id,
      status: "active",
      startedAt: timestamp,
      updatedAt: timestamp,
    });

    await this.dependencies.worldModel.saveEnvironment(
      world.environment,
    );

    await this.dependencies.worldModel.saveObject(
      world.compressor,
    );

    await this.dependencies.events.append({
      id: asEventId(crypto.randomUUID()),
      type: "object-observed",
      occurredAt: world.observation.observedAt,
      recordedAt: timestamp,
      truthState: world.observation.truthState,
      confidence: world.observation.confidence,
      provenance: world.observation.provenance,
      payload: {
        objectId: world.compressor.id,
        environmentId: world.environment.id,
        label: world.compressor.label,
        simulation: true,
      },
    });

    await this.dependencies.events.append({
      id: asEventId(crypto.randomUUID()),
      type: "world-model-updated",
      occurredAt: timestamp,
      recordedAt: timestamp,
      truthState: "confirmed",
      confidence: {
        level: "high",
        score: 1,
      },
      provenance: {
        source: "system",
        sourceId: "world-zero-world-model",
        observedAt: timestamp,
      },
      payload: {
        environmentId: world.environment.id,
        objectId: world.compressor.id,
        simulation: true,
      },
    });

    const memory =
      await this.dependencies.memory.createCandidate(
        {
          userId: world.userId,
          environmentId: world.environment.id,
          content:
            "The user has an air compressor associated with the Garage environment.",
          explicit: true,
          createdAt: timestamp,
        },
        memoryPolicy,
      );

    if (memory !== null) {
      await this.dependencies.events.append({
        id: asEventId(crypto.randomUUID()),
        type: "memory-created",
        occurredAt: timestamp,
        recordedAt: timestamp,
        truthState: "remembered",
        confidence: memory.confidence,
        provenance: memory.provenance,
        payload: {
          memoryId: memory.id,
          environmentId: world.environment.id,
          simulation: true,
        },
      });
    }

    const taskState: TaskState = {
      currentEnvironmentId: world.environment.id,

      currentObservationId:
        world.observation.id,

      userIntent:
        "Inspect the current environment.",

      activeGoal:
        "Establish the initial environmental world model.",

      constraints: [],

      decisions: [
        "The compressor observation is simulated for Build 01.",
      ],

      pendingActions: [],

      completedActions: [
        "Created Garage environment.",
        "Started environmental session.",
        "Recorded compressor observation.",
        "Updated World Model.",
        "Recorded object-observed event.",
        ...(memory !== null
          ? ["Created environmental memory."]
          : []),
      ],

      unresolvedQuestions: [],

      nextPlannedStep:
        "Replace simulated perception with live spatial perception.",

      updatedAt: timestamp,
    };

    const events =
      await this.dependencies.events.list();

    const capabilityState =
      deriveCapabilityStateFromEvents(events);

    return {
      world,
      taskState,
      memoryCreated: memory !== null,
      capabilityState,
    };
  }
}
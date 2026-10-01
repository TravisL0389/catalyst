import {
  asEnvironmentId,
  asObjectId,
  asObservationId,
  asSessionId,
  asUserId,
  now,
} from "@catalyst/core";

import type { Environment } from "@catalyst/world-model";
import type {
  Observation,
  WorldObject,
} from "@catalyst/world-model";

export interface WorldZero {
  readonly userId: ReturnType<typeof asUserId>;
  readonly sessionId: ReturnType<typeof asSessionId>;
  readonly environment: Environment;
  readonly compressor: WorldObject;
  readonly observation: Observation;
}

export function createWorldZero(): WorldZero {
  const timestamp = now();

  const userId = asUserId(
    "00000000-0000-4000-8000-000000000001",
  );

  const sessionId = asSessionId(
    "00000000-0000-4000-8000-000000000002",
  );

  const environmentId = asEnvironmentId(
    "00000000-0000-4000-8000-000000000003",
  );

  const compressorId = asObjectId(
    "00000000-0000-4000-8000-000000000004",
  );

  const observationId = asObservationId(
    "00000000-0000-4000-8000-000000000005",
  );

  const environment: Environment = {
    id: environmentId,
    name: "Garage",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const compressor: WorldObject = {
    id: compressorId,
    environmentId,
    label: "Air Compressor",
    category: "equipment",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const observation: Observation = {
    id: observationId,
    subjectType: "object",
    subjectId: compressorId,
    truthState: "observed",
    confidence: {
      level: "high",
      score: 1,
    },
    provenance: {
      source: "system",
      sourceId: "world-zero-simulation",
      observedAt: timestamp,
    },
    observedAt: timestamp,
  };

  return {
    userId,
    sessionId,
    environment,
    compressor,
    observation,
  };
}
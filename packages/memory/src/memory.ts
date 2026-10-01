import type {
  EnvironmentId,
  MemoryId,
  Timestamp,
  UserId,
} from "@catalyst/core";

import type {
  MemoryPolicy,
} from "./memory-policy.js";

import type {
  MemoryRecord,
} from "./memory-types.js";

export interface MemoryCandidate {
  readonly userId: UserId;
  readonly environmentId?: EnvironmentId;
  readonly content: string;
  readonly explicit: boolean;
  readonly createdAt: Timestamp;
}

export interface MemoryStore {
  save(memory: MemoryRecord): Promise<MemoryRecord>;

  recall(query: string, userId: UserId): Promise<readonly MemoryRecord[]>;

  getById(id: MemoryId): Promise<MemoryRecord | null>;

  forget(id: MemoryId): Promise<void>;
}

export interface MemoryCoordinator {
  createCandidate(
    candidate: MemoryCandidate,
    policy: MemoryPolicy,
  ): Promise<MemoryRecord | null>;
}
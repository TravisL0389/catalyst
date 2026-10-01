import { asMemoryId, now } from "@catalyst/core";

import type { MemoryRecord } from "./memory-types.js";
import type {
  MemoryCandidate,
  MemoryCoordinator,
  MemoryStore,
} from "./memory.js";
import type { MemoryPolicy } from "./memory-policy.js";

export class InMemoryMemoryCoordinator implements MemoryCoordinator {
  constructor(
    private readonly store: MemoryStore,
  ) {}

  async createCandidate(
    candidate: MemoryCandidate,
    policy: MemoryPolicy,
  ): Promise<MemoryRecord | null> {
    if (candidate.explicit && !policy.rememberExplicitRequests) {
      return null;
    }

    if (!candidate.explicit && policy.mode === "ephemeral") {
      return null;
    }

    if (
      !candidate.explicit &&
      policy.requireConfirmationForAutomaticMemory
    ) {
      return null;
    }

    const timestamp = now();

    const memory: MemoryRecord = {
      id: asMemoryId(crypto.randomUUID()),
      userId: candidate.userId,
      ...(candidate.environmentId !== undefined
        ? { environmentId: candidate.environmentId }
        : {}),
      type: "environmental",
      strength: candidate.explicit
        ? "explicit"
        : "strong-signal",
      status: "active",
      content: candidate.content,
      confidence: {
        level: candidate.explicit ? "high" : "medium",
        score: candidate.explicit ? 1 : 0.8,
      },
      provenance: {
        source: "system",
        sourceId: "memory-coordinator",
        observedAt: timestamp,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return this.store.save(memory);
  }
}
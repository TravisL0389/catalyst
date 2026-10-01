import type {
  EnvironmentId,
  SessionId,
  Timestamp,
} from "@catalyst/core";

import type { TaskState } from "@catalyst/task-state";

export interface CognitiveState {
  readonly sessionId: SessionId;
  readonly environmentId?: EnvironmentId;
  readonly taskState?: TaskState;
  readonly activeCapability:
    | "perceive"
    | "understand"
    | "remember"
    | "explore"
    | "harmonize"
    | "transform";
  readonly updatedAt: Timestamp;
}
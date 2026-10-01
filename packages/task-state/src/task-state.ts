import type {
  EnvironmentId,
  Timestamp,
} from "@catalyst/core";

export interface TaskState {
  readonly currentEnvironmentId?: EnvironmentId;
  readonly currentObservationId?: string;
  readonly userIntent?: string;
  readonly activeGoal?: string;
  readonly constraints: readonly string[];
  readonly decisions: readonly string[];
  readonly pendingActions: readonly string[];
  readonly completedActions: readonly string[];
  readonly unresolvedQuestions: readonly string[];
  readonly nextPlannedStep?: string;
  readonly updatedAt: Timestamp;
}
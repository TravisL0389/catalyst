import type {
  EnvironmentId,
  Timestamp,
} from "@catalyst/core";

export interface Environment {
  readonly id: EnvironmentId;
  readonly name: string;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
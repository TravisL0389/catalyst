import type {
  EnvironmentId,
  ObjectId,
  Timestamp,
} from "@catalyst/core";

export interface WorldObject {
  readonly id: ObjectId;
  readonly environmentId: EnvironmentId;
  readonly label?: string;
  readonly category?: string;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
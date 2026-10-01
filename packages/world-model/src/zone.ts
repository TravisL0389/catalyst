import type {
  EnvironmentId,
  Timestamp,
} from "@catalyst/core";

export type ZoneId = string & {
  readonly __brand: "ZoneId";
};

export interface Zone {
  readonly id: ZoneId;
  readonly environmentId: EnvironmentId;
  readonly name: string;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
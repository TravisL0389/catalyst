export type Brand<T, B extends string> = T & {
  readonly __brand: B;
};

export type UserId = Brand<string, "UserId">;
export type SessionId = Brand<string, "SessionId">;
export type EnvironmentId = Brand<string, "EnvironmentId">;
export type ObjectId = Brand<string, "ObjectId">;
export type ObservationId = Brand<string, "ObservationId">;
export type EventId = Brand<string, "EventId">;
export type MemoryId = Brand<string, "MemoryId">;
export type TaskId = Brand<string, "TaskId">;

export function createId(): string {
  return crypto.randomUUID();
}

export function asUserId(value: string): UserId {
  return value as UserId;
}

export function asSessionId(value: string): SessionId {
  return value as SessionId;
}

export function asEnvironmentId(value: string): EnvironmentId {
  return value as EnvironmentId;
}

export function asObjectId(value: string): ObjectId {
  return value as ObjectId;
}

export function asObservationId(value: string): ObservationId {
  return value as ObservationId;
}

export function asEventId(value: string): EventId {
  return value as EventId;
}

export function asMemoryId(value: string): MemoryId {
  return value as MemoryId;
}

export function asTaskId(value: string): TaskId {
  return value as TaskId;
}
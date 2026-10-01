import type {
  EnvironmentId,
  SessionId,
  Timestamp,
  UserId,
} from "@catalyst/core";

export type SessionStatus =
  | "active"
  | "paused"
  | "completed";

export interface Session {
  readonly id: SessionId;
  readonly userId: UserId;
  readonly environmentId: EnvironmentId;
  readonly status: SessionStatus;
  readonly startedAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly endedAt?: Timestamp;
}

export interface SessionStore {
  create(session: Session): Promise<Session>;

  getById(id: SessionId): Promise<Session | null>;

  update(session: Session): Promise<Session>;
}
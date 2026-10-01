import type { SessionId } from "@catalyst/core";
import type { Session, SessionStore } from "./session.js";

export class InMemorySessionStore implements SessionStore {
  private readonly sessions = new Map<SessionId, Session>();

  async create(session: Session): Promise<Session> {
    if (this.sessions.has(session.id)) {
      throw new Error(`Session already exists: ${session.id}`);
    }

    this.sessions.set(session.id, session);

    return session;
  }

  async getById(id: SessionId): Promise<Session | null> {
    return this.sessions.get(id) ?? null;
  }

  async update(session: Session): Promise<Session> {
    if (!this.sessions.has(session.id)) {
      throw new Error(`Session does not exist: ${session.id}`);
    }

    this.sessions.set(session.id, session);

    return session;
  }
}
import type {
  EnvironmentId,
  EventId,
} from "@catalyst/core";

import type {
  DomainEvent,
} from "./event.js";

import type {
  EventHistoryQuery,
} from "./query.js";

export interface EventStore {
  append<TPayload>(
    event: DomainEvent<TPayload>,
  ): Promise<DomainEvent<TPayload>>;

  getById(
    id: EventId,
  ): Promise<DomainEvent | null>;

  list(): Promise<readonly DomainEvent[]>;
}

export class InMemoryEventStore
  implements EventStore, EventHistoryQuery
{
  private readonly events =
    new Map<EventId, DomainEvent>();

  async append<TPayload>(
    event: DomainEvent<TPayload>,
  ): Promise<DomainEvent<TPayload>> {
    this.events.set(
      event.id,
      event,
    );

    return event;
  }

  async getById(
    id: EventId,
  ): Promise<DomainEvent | null> {
    return (
      this.events.get(id) ??
      null
    );
  }

  async list(): Promise<
    readonly DomainEvent[]
  > {
    return [
      ...this.events.values(),
    ];
  }

  async listByEnvironment(
    environmentId: EnvironmentId,
  ): Promise<
    readonly DomainEvent[]
  > {
    return [
      ...this.events.values(),
    ].filter((event) => {
      const payload =
        event.payload;

      if (
        typeof payload !== "object" ||
        payload === null
      ) {
        return false;
      }

      const record =
        payload as Record<
          string,
          unknown
        >;

      return (
        record.environmentId ===
        environmentId
      );
    });
  }

  async listByType(
    type: DomainEvent["type"],
  ): Promise<
    readonly DomainEvent[]
  > {
    return [
      ...this.events.values(),
    ].filter(
      (event) =>
        event.type === type,
    );
  }

  async listRecent(
    limit: number,
  ): Promise<
    readonly DomainEvent[]
  > {
    if (limit <= 0) {
      return [];
    }

    return [
      ...this.events.values(),
    ]
      .sort(
        (a, b) =>
          b.occurredAt.localeCompare(
            a.occurredAt,
          ),
      )
      .slice(0, limit);
  }
}
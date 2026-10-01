import type {
  EnvironmentId,
} from "@catalyst/core";

import type {
  EventStore,
} from "@catalyst/events";

export interface EnvironmentalHistory {
  readonly environmentId: EnvironmentId;
  readonly events: readonly {
    id: string;
    type: string;
    occurredAt: string;
    truthState: string;
    confidence: string;
    payload: unknown;
  }[];
  readonly eventCount: number;
}

export class EnvironmentalHistoryService {
  constructor(
    private readonly events: EventStore,
  ) {}

  async getHistory(
    environmentId: EnvironmentId,
  ): Promise<EnvironmentalHistory> {
    const history =
      await this.events.list();

    const environmentEvents =
      history.filter((event) => {
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

    return {
      environmentId,

      events:
        environmentEvents.map(
          (event) => ({
            id: event.id,
            type: event.type,
            occurredAt:
              event.occurredAt,
            truthState:
              event.truthState,
            confidence:
              event.confidence.level,
            payload:
              event.payload,
          }),
        ),

      eventCount:
        environmentEvents.length,
    };
  }
}
import type {
  EnvironmentId,
} from "@catalyst/core";

import type {
  DomainEvent,
} from "./event.js";

export interface EventHistoryQuery {
  listByEnvironment(
    environmentId: EnvironmentId,
  ): Promise<readonly DomainEvent[]>;

  listByType(
    type: DomainEvent["type"],
  ): Promise<readonly DomainEvent[]>;

  listRecent(
    limit: number,
  ): Promise<readonly DomainEvent[]>;
}
import type { EnvironmentId } from "@catalyst/core";
import type { EventStore } from "@catalyst/events";

export interface EnvironmentalActivityItem {
  readonly id: string;
  readonly type: string;
  readonly occurredAt: string;
  readonly truthState: string;
  readonly confidence: string;
  readonly description: string;
  readonly payload: unknown;
}

export interface EnvironmentalActivity {
  readonly environmentId: EnvironmentId;
  readonly items: readonly EnvironmentalActivityItem[];
  readonly count: number;
}

function describeEvent(
  type: string,
  payload: unknown,
): string {
  if (
    typeof payload !== "object" ||
    payload === null
  ) {
    return type;
  }

  const record =
    payload as Record<string, unknown>;

  const label =
    typeof record.label === "string"
      ? record.label
      : "object";

  switch (type) {
    case "object-observed":
      return `Observed ${label}.`;

    case "object-added":
      return `Added ${label}.`;

    case "object-moved":
      return `Detected movement of ${label}.`;

    case "object-removed":
      return `Detected removal of ${label}.`;

    case "object-changed":
      return `Detected a change involving ${label}.`;

    case "world-model-updated":
      return "Updated the environmental World Model.";

    case "memory-created":
      return "Created an environmental memory.";

    case "user-identified":
      return `User identified ${label}.`;

    case "constraint-created":
      return "Created an environmental constraint.";

    case "constraint-updated":
      return "Updated an environmental constraint.";

    case "simulation-created":
      return "Created an environmental simulation.";

    case "observation-corrected":
      return "Corrected an environmental observation.";

    case "snapshot-created":
      return "Created an environmental snapshot.";

    default:
      return type;
  }
}

export class EnvironmentalActivityService {
  constructor(
    private readonly events: EventStore,
  ) {}

  async getActivity(
    environmentId: EnvironmentId,
  ): Promise<EnvironmentalActivity> {
    const history =
      await this.events.list();

    const environmentEvents =
      history.filter((event) => {
        if (
          typeof event.payload !== "object" ||
          event.payload === null
        ) {
          return false;
        }

        const record =
          event.payload as Record<
            string,
            unknown
          >;

        return (
          record.environmentId ===
          environmentId
        );
      });

    const items =
      environmentEvents
        .sort((a, b) =>
          b.occurredAt.localeCompare(
            a.occurredAt,
          ),
        )
        .map(
          (event) => ({
            id: event.id,
            type: event.type,
            occurredAt:
              event.occurredAt,
            truthState:
              event.truthState,
            confidence:
              event.confidence.level,
            description:
              describeEvent(
                event.type,
                event.payload,
              ),
            payload:
              event.payload,
          }),
        );

    return {
      environmentId,
      items,
      count: items.length,
    };
  }
}
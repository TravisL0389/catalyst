import type { DomainEvent } from "@catalyst/events";
import type { TaskState } from "@catalyst/task-state";

export type Capability =
  | "perceive"
  | "understand"
  | "remember"
  | "explore"
  | "harmonize"
  | "transform";

export type CapabilityStatus =
  | "inactive"
  | "active"
  | "completed"
  | "available";

export interface CapabilityState {
  readonly capability: Capability;
  readonly status: CapabilityStatus;
  readonly activity: number;
}

export interface CapabilityStateSet {
  readonly active: Capability;
  readonly states: readonly CapabilityState[];
}

const capabilities: readonly Capability[] = [
  "perceive",
  "understand",
  "remember",
  "explore",
  "harmonize",
  "transform",
];

function capabilityForEvent(
  event: DomainEvent,
): Capability | null {
  switch (event.type) {
    case "object-observed":
    case "object-added":
    case "object-moved":
    case "object-removed":
    case "object-changed":
      return "perceive";

    case "world-model-updated":
      return "understand";

    case "memory-created":
      return "remember";

    case "simulation-created":
      return "explore";

    case "constraint-created":
    case "constraint-updated":
      return "harmonize";

    case "action-approved":
    case "action-executed":
    case "action-verified":
      return "transform";

    case "snapshot-created":
      return null;

    default:
      return null;
  }
}

export function deriveCapabilityStateFromEvents(
  events: readonly DomainEvent[],
): CapabilityStateSet {
  let active: Capability = "perceive";

  for (const event of events) {
    const capability =
      capabilityForEvent(event);

    if (capability !== null) {
      active = capability;
    }
  }

  const activeIndex =
    capabilities.indexOf(active);

  const states =
    capabilities.map(
      (
        capability,
        index,
      ): CapabilityState => {
        if (
          capability === active
        ) {
          return {
            capability,
            status: "active",
            activity: 1,
          };
        }

        if (
          index < activeIndex
        ) {
          return {
            capability,
            status: "completed",
            activity: 0.25,
          };
        }

        return {
          capability,
          status: "available",
          activity: 0,
        };
      },
    );

  return {
    active,
    states,
  };
}

export function deriveCapabilityState(
  taskState: TaskState,
  memoryCreated: boolean,
): CapabilityStateSet {
  if (memoryCreated) {
    return deriveCapabilityStateFromEvents(
      [
        {
          id:
            "00000000-0000-4000-8000-000000000001" as never,
          type: "object-observed",
          occurredAt:
            taskState.updatedAt,
          recordedAt:
            taskState.updatedAt,
          truthState: "observed",
          confidence: {
            level: "high",
            score: 1,
          },
          provenance: {
            source: "system",
          },
          payload: {},
        },
        {
          id:
            "00000000-0000-4000-8000-000000000002" as never,
          type: "world-model-updated",
          occurredAt:
            taskState.updatedAt,
          recordedAt:
            taskState.updatedAt,
          truthState: "confirmed",
          confidence: {
            level: "high",
            score: 1,
          },
          provenance: {
            source: "system",
          },
          payload: {},
        },
        {
          id:
            "00000000-0000-4000-8000-000000000003" as never,
          type: "memory-created",
          occurredAt:
            taskState.updatedAt,
          recordedAt:
            taskState.updatedAt,
          truthState: "remembered",
          confidence: {
            level: "high",
            score: 1,
          },
          provenance: {
            source: "system",
          },
          payload: {},
        },
      ],
    );
  }

  if (
    taskState.currentObservationId
  ) {
    return deriveCapabilityStateFromEvents(
      [
        {
          id:
            "00000000-0000-4000-8000-000000000001" as never,
          type: "object-observed",
          occurredAt:
            taskState.updatedAt,
          recordedAt:
            taskState.updatedAt,
          truthState: "observed",
          confidence: {
            level: "high",
            score: 1,
          },
          provenance: {
            source: "system",
          },
          payload: {},
        },
      ],
    );
  }

  return {
    active: "perceive",

    states:
      capabilities.map(
        (capability) => ({
          capability,

          status:
            capability ===
            "perceive"
              ? "active"
              : "available",

          activity:
            capability ===
            "perceive"
              ? 1
              : 0,
        }),
      ),
  };
}
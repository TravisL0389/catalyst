import { NextResponse } from "next/server";

import {
  InMemoryEventStore,
} from "@catalyst/events";

import {
  InMemoryMemoryCoordinator,
  InMemoryMemoryStore,
} from "@catalyst/memory";

import {
  createWorldZero,
  EnvironmentalActivityService,
  EnvironmentChangeSimulator,
  EnvironmentalChangeSummaryService,
  EnvironmentComparisonService,
  EnvironmentRelationshipService,
  EnvironmentSnapshotService,
  WorldGraphQueryService,
  WorldZeroService,
} from "@catalyst/orchestrator";

import {
  InMemorySessionStore,
} from "@catalyst/session";

import {
  InMemoryEnvironmentSnapshotStore,
  InMemoryRelationshipStore,
  InMemoryWorldModelStore,
  WorldModelQueryService,
} from "@catalyst/world-model";

const sessions =
  new InMemorySessionStore();

const worldModel =
  new InMemoryWorldModelStore();

const events =
  new InMemoryEventStore();

const memoryStore =
  new InMemoryMemoryStore();

const memory =
  new InMemoryMemoryCoordinator(
    memoryStore,
  );

const snapshots =
  new InMemoryEnvironmentSnapshotStore();

const relationships =
  new InMemoryRelationshipStore();

const service =
  new WorldZeroService({
    sessions,
    worldModel,
    events,
    memory,
  });

const worldQueries =
  new WorldModelQueryService(
    worldModel,
  );

const activity =
  new EnvironmentalActivityService(
    events,
  );

const snapshotService =
  new EnvironmentSnapshotService(
    worldModel,
    snapshots,
    events,
  );

const comparisonService =
  new EnvironmentComparisonService(
    snapshots,
  );

const changeSimulator =
  new EnvironmentChangeSimulator(
    worldModel,
    events,
    relationships,
  );

const changeSummaryService =
  new EnvironmentalChangeSummaryService(
    worldModel,
  );

const relationshipService =
  new EnvironmentRelationshipService(
    relationships,
  );

export async function POST(
  request: Request,
) {
  const url =
    new URL(request.url);

  const action =
    url.searchParams.get(
      "action",
    );

  /*
   * --------------------------------------------------
   * SIMULATE ENVIRONMENTAL CHANGE
   * --------------------------------------------------
   */
  if (
    action ===
    "simulate-change"
  ) {
    const environmentId =
      url.searchParams.get(
        "environmentId",
      );

    if (!environmentId) {
      return NextResponse.json(
        {
          error:
            "environmentId is required.",
        },
        {
          status: 400,
        },
      );
    }

    const change =
      await changeSimulator.addToolChest(
        environmentId as never,
      );

    return NextResponse.json({
      type:
        "simulated-environment-change",

      change,
    });
  }

  /*
   * --------------------------------------------------
   * CAPTURE SNAPSHOT
   * --------------------------------------------------
   */
  if (
    action ===
    "snapshot"
  ) {
    const environmentId =
      url.searchParams.get(
        "environmentId",
      );

    if (!environmentId) {
      return NextResponse.json(
        {
          error:
            "environmentId is required.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await snapshotService.capture(
        environmentId as never,
      );

    return NextResponse.json({
      type:
        "environment-snapshot",

      snapshot:
        result.snapshot,

      objectCount:
        result.objectCount,

      simulation:
        true,
    });
  }

  /*
   * --------------------------------------------------
   * DEFAULT WORLD ZERO INITIALIZATION
   * --------------------------------------------------
   */
  const world =
    createWorldZero();

  const result =
    await service.initialize(
      world,
      {
        mode: "selective",

        allowAutomaticConsolidation:
          false,

        requireConfirmationForAutomaticMemory:
          true,

        retainRawImagery:
          false,

        retainAudio:
          false,

        rememberExplicitRequests:
          true,
      },
    );

  const initialSnapshot =
    await snapshotService.capture(
      world.environment.id,
    );

  return NextResponse.json({
    environment:
      result.world.environment,

    session: {
      id:
        result.world.sessionId,

      status:
        "active",
    },

    observation:
      result.world.observation,

    object:
      result.world.compressor,

    taskState:
      result.taskState,

    memoryCreated:
      result.memoryCreated,

    capabilityState:
      result.capabilityState,

    snapshot:
      initialSnapshot.snapshot,

    simulation:
      true,
  });
}

export async function GET(
  request: Request,
) {
  const url =
    new URL(request.url);

  const environmentId =
    url.searchParams.get(
      "environmentId",
    );

  const query =
    url.searchParams.get(
      "query",
    );

  const relationshipEntityId =
    url.searchParams.get(
      "relationshipEntityId",
    );

  const graphQuestion =
    url.searchParams.get(
      "graphQuestion",
    );

  const graphEntityId =
    url.searchParams.get(
      "graphEntityId",
    );

  const activityRequested =
    url.searchParams.get(
      "activity",
    );

  const historyRequested =
    url.searchParams.get(
      "history",
    );

  const snapshotsRequested =
    url.searchParams.get(
      "snapshots",
    );

  const comparisonRequested =
    url.searchParams.get(
      "comparison",
    );

  const relationshipsRequested =
    url.searchParams.get(
      "relationships",
    );

  /*
   * --------------------------------------------------
   * ENVIRONMENT ID IS REQUIRED FOR ALL GET QUERIES
   * --------------------------------------------------
   */
  if (!environmentId) {
    return NextResponse.json(
      {
        error:
          "environmentId is required.",
      },
      {
        status: 400,
      },
    );
  }

  const typedEnvironmentId =
    environmentId as never;

  /*
   * --------------------------------------------------
   * WORLD GRAPH NATURAL-LANGUAGE QUERY
   * --------------------------------------------------
   *
   * Example:
   *
   * graphQuestion=What's near the Tool Chest?
   * graphEntityId=<tool-chest-id>
   *
   * The question is interpreted by the deterministic
   * BUILD 01 graph query service.
   *
   * This is NOT an AI-generated answer.
   * --------------------------------------------------
   */
  if (
    graphQuestion &&
    graphEntityId
  ) {
    const graphQuery =
      new WorldGraphQueryService(
        relationships,
      );

    const result =
      await graphQuery.answer({
        question:
          graphQuestion,

        entityId:
          graphEntityId,
      });

    const resolvedRelationships =
      await Promise.all(
        result.relationships.map(
          async (
            relationship,
          ) => {
            const subjectObject =
              await worldModel.getObject(
                relationship.subjectId as never,
              );

            const targetObject =
              await worldModel.getObject(
                relationship.targetId as never,
              );

            return {
              ...relationship,

              subjectLabel:
                subjectObject?.label ??
                null,

              targetLabel:
                targetObject?.label ??
                null,
            };
          },
        ),
      );

    /*
     * The environment itself is not a WorldObject,
     * so resolve it separately when necessary.
     */
    const resolvedRelationshipsWithEnvironment =
      await Promise.all(
        resolvedRelationships.map(
          async (
            relationship,
          ) => {
            let subjectLabel =
              relationship.subjectLabel;

            let targetLabel =
              relationship.targetLabel;

            if (
              relationship.subjectId ===
              environmentId
            ) {
              subjectLabel =
                (
                  await worldModel.getEnvironment(
                    typedEnvironmentId,
                  )
                )?.name ??
                "Environment";
            }

            if (
              relationship.targetId ===
              environmentId
            ) {
              targetLabel =
                (
                  await worldModel.getEnvironment(
                    typedEnvironmentId,
                  )
                )?.name ??
                "Environment";
            }

            return {
              ...relationship,
              subjectLabel,
              targetLabel,
            };
          },
        ),
      );

    return NextResponse.json({
      type:
        "world-graph-query",

      question:
        result.question,

      entityId:
        result.entityId,

      interpretation:
        result.interpretation,

      answer:
        result.answer,

      evidenceCount:
        result.evidenceCount,

      relationships:
        resolvedRelationshipsWithEnvironment,
    });
  }

  /*
   * --------------------------------------------------
   * ENVIRONMENT COMPARISON
   * --------------------------------------------------
   */
  if (
    comparisonRequested ===
    "true"
  ) {
    const comparison =
      await comparisonService.compareLatest(
        typedEnvironmentId,
      );

    if (!comparison) {
      return NextResponse.json({
        type:
          "environment-comparison",

        result:
          null,

        summary:
          null,

        message:
          "At least two environmental snapshots are required for comparison.",
      });
    }

    const summary =
      await changeSummaryService.summarize(
        typedEnvironmentId,
        comparison.comparison,
      );

    return NextResponse.json({
      type:
        "environment-comparison",

      result:
        comparison,

      summary,
    });
  }

  /*
   * --------------------------------------------------
   * WORLD GRAPH RELATIONSHIPS
   * --------------------------------------------------
   */
  if (
    relationshipsRequested ===
    "true"
  ) {
    const entityId =
      relationshipEntityId ??
      environmentId;

    const result =
      await relationshipService.getForEntity(
        entityId,
      );

    return NextResponse.json({
      type:
        "environment-relationships",

      ...result,
    });
  }

  /*
   * --------------------------------------------------
   * SNAPSHOT HISTORY
   * --------------------------------------------------
   */
  if (
    snapshotsRequested ===
    "true"
  ) {
    const result =
      await snapshotService.list(
        typedEnvironmentId,
      );

    return NextResponse.json({
      type:
        "environment-snapshots",

      snapshots:
        result,
    });
  }

  /*
   * --------------------------------------------------
   * ENVIRONMENTAL ACTIVITY
   * --------------------------------------------------
   */
  if (
    activityRequested ===
    "true"
  ) {
    const result =
      await activity.getActivity(
        typedEnvironmentId,
      );

    return NextResponse.json({
      type:
        "environmental-activity",

      ...result,
    });
  }

  /*
   * --------------------------------------------------
   * ENVIRONMENT HISTORY
   * --------------------------------------------------
   */
  if (
    historyRequested ===
    "true"
  ) {
    const result =
      await activity.getActivity(
        typedEnvironmentId,
      );

    return NextResponse.json({
      type:
        "environment-history",

      ...result,
    });
  }

  /*
   * --------------------------------------------------
   * WORLD MODEL OBJECT SEARCH
   * --------------------------------------------------
   */
  if (query) {
    const result =
      await worldQueries.findObjects(
        typedEnvironmentId,
        query,
      );

    return NextResponse.json({
      type:
        "object-search",

      ...result,
    });
  }

  /*
   * --------------------------------------------------
   * DEFAULT ENVIRONMENT CONTENTS
   * --------------------------------------------------
   */
  const result =
    await worldQueries.getEnvironmentContents(
      typedEnvironmentId,
    );

  return NextResponse.json({
    type:
      "environment-contents",

    ...result,
  });
}
"use client";

import { useState } from "react";

interface CapabilityState {
  capability: string;
  status: string;
  activity: number;
}

interface WorldObject {
  id: string;
  environmentId: string;
  label?: string;
  category?: string;
}

interface Snapshot {
  id: string;
  environmentId: string;
  capturedAt: string;
  objectIds: readonly string[];
  objectCount: number;
}

interface WorldZeroResponse {
  environment: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  session: {
    id: string;
    status: string;
  };
  observation: {
    id: string;
    subjectType: string;
    subjectId?: string;
    truthState: string;
    confidence: {
      level: string;
      score?: number;
    };
    provenance: {
      source: string;
      sourceId?: string;
      observedAt?: string;
    };
    observedAt: string;
  };
  object: WorldObject;
  taskState: {
    currentEnvironmentId?: string;
    currentObservationId?: string;
    userIntent?: string;
    activeGoal?: string;
    constraints: readonly string[];
    decisions: readonly string[];
    pendingActions: readonly string[];
    completedActions: readonly string[];
    unresolvedQuestions: readonly string[];
    nextPlannedStep?: string;
    updatedAt: string;
  };
  memoryCreated: boolean;
  capabilityState: {
    active: string;
    states: readonly CapabilityState[];
  };
  snapshot: Snapshot;
  simulation: boolean;
}

interface EnvironmentContentsResponse {
  type: "environment-contents";
  environmentId: string;
  objects: readonly WorldObject[];
  objectCount: number;
}

interface ObjectSearchResponse {
  type: "object-search";
  environmentId: string;
  query: string;
  matches: readonly WorldObject[];
  matchCount: number;
}

interface EnvironmentalActivityItem {
  id: string;
  type: string;
  occurredAt: string;
  truthState: string;
  confidence: string;
  description: string;
  payload: unknown;
}

interface EnvironmentalActivityResponse {
  type:
    | "environmental-activity"
    | "environment-history";
  environmentId: string;
  items: readonly EnvironmentalActivityItem[];
  count: number;
}

interface SimulatedChangeResponse {
  type: "simulated-environment-change";
  change: {
    objectId: string;
    label: string;
    category: string;
    environmentId: string;
    simulation: true;
    relationshipsCreated: number;
  };
}

interface SnapshotResponse {
  type: "environment-snapshot";
  snapshot: Snapshot;
  objectCount: number;
  simulation: boolean;
}

interface ComparisonResult {
  environmentId: string;
  previousSnapshot: Snapshot;
  currentSnapshot: Snapshot;
  comparison: {
    previousSnapshotId: string;
    currentSnapshotId: string;
    previousCapturedAt: string;
    currentCapturedAt: string;
    addedObjectIds: readonly string[];
    removedObjectIds: readonly string[];
    unchangedObjectIds: readonly string[];
    addedCount: number;
    removedCount: number;
    unchangedCount: number;
    hasChanges: boolean;
  };
}

interface EnvironmentalChangeItem {
  objectId: string;
  status: "added" | "removed";
  label: string;
  category: string;
}

interface EnvironmentalChangeSummary {
  environmentId: string;
  hasChanges: boolean;
  added: readonly EnvironmentalChangeItem[];
  removed: readonly EnvironmentalChangeItem[];
  addedCount: number;
  removedCount: number;
  statement: string;
}

interface ComparisonResponse {
  type: "environment-comparison";
  result: ComparisonResult | null;
  summary: EnvironmentalChangeSummary | null;
  message?: string;
}

interface Relationship {
  subjectId: string;
  kind: string;
  targetId: string;
  confidence: {
    level: string;
    score?: number;
  };
  provenance: {
    source: string;
    sourceId?: string;
    observedAt?: string;
  };
  observedAt: string;
  subjectLabel?: string | null;
  targetLabel?: string | null;
}

interface RelationshipResponse {
  type: "environment-relationships";
  entityId: string;
  relationships: readonly Relationship[];
  count: number;
}

interface WorldGraphQueryResponse {
  type: "world-graph-query";
  question: string;
  entityId: string;
  interpretation:
    | "near"
    | "inside"
    | "contains"
    | "adjacent-to"
    | "all";
  answer: string;
  evidenceCount: number;
  relationships: readonly Relationship[];
  simulation?: boolean;
}

export default function CommandCenter() {
  const [state, setState] =
    useState<WorldZeroResponse | null>(null);

  const [contents, setContents] =
    useState<EnvironmentContentsResponse | null>(
      null,
    );

  const [activity, setActivity] =
    useState<EnvironmentalActivityResponse | null>(
      null,
    );

  const [comparison, setComparison] =
    useState<ComparisonResponse | null>(null);

  const [relationships, setRelationships] =
    useState<RelationshipResponse | null>(null);

  const [relationshipLabels, setRelationshipLabels] =
    useState<Record<string, string>>({});

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<ObjectSearchResponse | null>(null);

  const [graphQuestion, setGraphQuestion] =
    useState("What's near the Tool Chest?");

  const [graphEntityId, setGraphEntityId] =
    useState("");

  const [graphResult, setGraphResult] =
    useState<WorldGraphQueryResponse | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [changeLoading, setChangeLoading] =
    useState(false);

  const [snapshotLoading, setSnapshotLoading] =
    useState(false);

  const [comparisonLoading, setComparisonLoading] =
    useState(false);

  const [queryLoading, setQueryLoading] =
    useState(false);

  const [relationshipLoading, setRelationshipLoading] =
    useState(false);

  const [graphLoading, setGraphLoading] =
    useState(false);

  const [changeSimulated, setChangeSimulated] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function initializeWorldZero() {
    setLoading(true);
    setError(null);
    setComparison(null);
    setRelationships(null);
    setGraphResult(null);
    setChangeSimulated(false);

    try {
      const response = await fetch(
        "/api/world-zero",
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `World Zero initialization failed (${response.status}): ${body}`,
        );
      }

      const result =
        (await response.json()) as WorldZeroResponse;

      setState(result);

      setGraphEntityId(
        result.environment.id,
      );

      await queryEnvironment(
        result.environment.id,
      );

      await queryActivity(
        result.environment.id,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unknown initialization error.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function simulateChange() {
    if (!state) {
      return;
    }

    setChangeLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/world-zero?action=simulate-change&environmentId=${encodeURIComponent(
          state.environment.id,
        )}`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Environmental simulation failed (${response.status}): ${body}`,
        );
      }

      const result =
        (await response.json()) as SimulatedChangeResponse;

      if (
        result.type !==
        "simulated-environment-change"
      ) {
        throw new Error(
          "Unexpected simulation response.",
        );
      }

      setChangeSimulated(true);

      await queryEnvironment(
        state.environment.id,
      );

      await queryActivity(
        state.environment.id,
      );

      await queryRelationships(
        result.change.objectId,
      );

      setGraphEntityId(
        result.change.objectId,
      );

      setGraphQuestion(
        "What's near the Tool Chest?",
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unknown simulation error.",
      );
    } finally {
      setChangeLoading(false);
    }
  }

  async function captureSnapshot() {
    if (!state) {
      return;
    }

    setSnapshotLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/world-zero?action=snapshot&environmentId=${encodeURIComponent(
          state.environment.id,
        )}`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Snapshot capture failed (${response.status}): ${body}`,
        );
      }

      const result =
        (await response.json()) as SnapshotResponse;

      setState((current) =>
        current
          ? {
              ...current,
              snapshot: result.snapshot,
            }
          : current,
      );

      await queryActivity(
        state.environment.id,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unknown snapshot error.",
      );
    } finally {
      setSnapshotLoading(false);
    }
  }

  async function compareEnvironment() {
    if (!state) {
      return;
    }

    setComparisonLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/world-zero?comparison=true&environmentId=${encodeURIComponent(
          state.environment.id,
        )}`,
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Environment comparison failed (${response.status}): ${body}`,
        );
      }

      const result =
        (await response.json()) as ComparisonResponse;

      setComparison(result);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unknown comparison error.",
      );
    } finally {
      setComparisonLoading(false);
    }
  }

  async function queryEnvironment(
    environmentId: string,
  ) {
    setQueryLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/world-zero?environmentId=${encodeURIComponent(
          environmentId,
        )}`,
      );

      if (!response.ok) {
        throw new Error(
          "Environment query failed.",
        );
      }

      const result =
        (await response.json()) as EnvironmentContentsResponse;

      setContents(result);
      setSearchResults(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unknown query error.",
      );
    } finally {
      setQueryLoading(false);
    }
  }

  async function queryActivity(
    environmentId: string,
  ) {
    try {
      const response = await fetch(
        `/api/world-zero?environmentId=${encodeURIComponent(
          environmentId,
        )}&activity=true`,
      );

      if (!response.ok) {
        throw new Error(
          "Environmental activity query failed.",
        );
      }

      const result =
        (await response.json()) as EnvironmentalActivityResponse;

      setActivity(result);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unknown activity error.",
      );
    }
  }

  async function queryRelationships(
    entityId: string,
  ) {
    if (!state) {
      return;
    }

    setRelationshipLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/world-zero?relationships=true&environmentId=${encodeURIComponent(
          state.environment.id,
        )}&relationshipEntityId=${encodeURIComponent(
          entityId,
        )}`,
      );

      if (!response.ok) {
        throw new Error(
          "World Graph query failed.",
        );
      }

      const result =
        (await response.json()) as RelationshipResponse;

      setRelationships(result);

      const labels: Record<string, string> =
        {};

      for (
        const object of contents?.objects ?? []
      ) {
        labels[object.id] =
          object.label ??
          "Unnamed object";
      }

      labels[state.environment.id] =
        state.environment.name;

      for (
        const relationship of result.relationships
      ) {
        if (relationship.subjectLabel) {
          labels[relationship.subjectId] =
            relationship.subjectLabel;
        }

        if (relationship.targetLabel) {
          labels[relationship.targetId] =
            relationship.targetLabel;
        }
      }

      setRelationshipLabels(labels);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unknown World Graph error.",
      );
    } finally {
      setRelationshipLoading(false);
    }
  }

  async function askWorldGraph() {
    if (!state) {
      return;
    }

    const question =
      graphQuestion.trim();

    if (!question) {
      setError(
        "Enter a World Graph question first.",
      );
      return;
    }

    if (!graphEntityId) {
      setError(
        "Select an entity for the World Graph query.",
      );
      return;
    }

    setGraphLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/world-zero?environmentId=${encodeURIComponent(
          state.environment.id,
        )}&graphQuestion=${encodeURIComponent(
          question,
        )}&graphEntityId=${encodeURIComponent(
          graphEntityId,
        )}`,
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `World Graph question failed (${response.status}): ${body}`,
        );
      }

      const result =
        (await response.json()) as WorldGraphQueryResponse;

      setGraphResult(result);

      const labels: Record<string, string> =
        {};

      labels[state.environment.id] =
        state.environment.name;

      for (
        const object of contents?.objects ?? []
      ) {
        labels[object.id] =
          object.label ??
          "Unnamed object";
      }

      for (
        const relationship of result.relationships
      ) {
        if (relationship.subjectLabel) {
          labels[relationship.subjectId] =
            relationship.subjectLabel;
        }

        if (relationship.targetLabel) {
          labels[relationship.targetId] =
            relationship.targetLabel;
        }
      }

      setRelationshipLabels(labels);

      setRelationships({
        type:
          "environment-relationships",
        entityId:
          graphEntityId,
        relationships:
          result.relationships,
        count:
          result.relationships.length,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unknown World Graph question error.",
      );
    } finally {
      setGraphLoading(false);
    }
  }

  async function searchEnvironment() {
    if (!state) {
      return;
    }

    const query =
      searchQuery.trim();

    if (!query) {
      await queryEnvironment(
        state.environment.id,
      );

      return;
    }

    setQueryLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/world-zero?environmentId=${encodeURIComponent(
          state.environment.id,
        )}&query=${encodeURIComponent(
          query,
        )}`,
      );

      if (!response.ok) {
        throw new Error(
          "Object search failed.",
        );
      }

      const result =
        (await response.json()) as ObjectSearchResponse;

      setSearchResults(result);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unknown search error.",
      );
    } finally {
      setQueryLoading(false);
    }
  }

  function getRelationshipLabel(
    id: string,
  ) {
    return (
      relationshipLabels[id] ??
      id.slice(0, 8) + "…"
    );
  }

  const graphEntities = [
    ...(state
      ? [
          {
            id: state.environment.id,
            label: state.environment.name,
            category: "Environment",
          },
        ]
      : []),

    ...(contents?.objects ?? []).map(
      (object) => ({
        id: object.id,
        label:
          object.label ??
          "Unnamed object",
        category:
          object.category ??
          "Object",
      }),
    ),
  ];

  return (
    <main className="min-h-screen bg-[#07090a] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        <header className="mb-10">
          <p className="text-sm tracking-[0.35em] text-cyan-300">
            ENVIRONMENTAL INTELLIGENCE ENGINE
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight">
            CΛTΛLYΣT
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            See reality. Unlock possibility. Change what comes next.
          </p>
        </header>

        {!state && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              BUILD 01
            </p>

            <h2 className="mt-3 text-3xl font-medium">
              World Zero
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
              Initialize the first deterministic
              CΛTΛLYΣT environment. This demonstration
              uses simulated perception rather than
              claiming live environmental sensing.
            </p>

            <button
              type="button"
              onClick={
                initializeWorldZero
              }
              disabled={loading}
              className="mt-8 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-6 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Initializing…"
                : "Initialize World Zero"}
            </button>

            {error && (
              <p className="mt-5 whitespace-pre-wrap text-sm text-red-300">
                {error}
              </p>
            )}

          </section>
        )}

        {state && (
          <section className="space-y-6">

            <div className="grid gap-6 lg:grid-cols-3">

              <Panel
                eyebrow="ENVIRONMENT"
                title={
                  state.environment.name
                }
              >
                <Row
                  label="Session"
                  value={
                    state.session.status
                  }
                />

                <Row
                  label="Mode"
                  value={
                    state.simulation
                      ? "Simulated perception"
                      : "Live perception"
                  }
                />

                <Row
                  label="Objects"
                  value={
                    contents
                      ? String(
                          contents.objectCount,
                        )
                      : "Loading"
                  }
                />
              </Panel>

              <Panel
                eyebrow="WORLD MODEL"
                title="Structured reality"
              >
                <Row
                  label="Object"
                  value={
                    state.object.label ??
                    "Unknown"
                  }
                />

                <Row
                  label="Category"
                  value={
                    state.object.category ??
                    "Unknown"
                  }
                />

                <Row
                  label="Truth"
                  value={
                    state.observation
                      .truthState
                  }
                />

                <Row
                  label="Confidence"
                  value={
                    state.observation
                      .confidence.level
                  }
                />
              </Panel>

              <Panel
                eyebrow="MEMORY"
                title={
                  state.memoryCreated
                    ? "Memory created"
                    : "No memory created"
                }
              >
                <Row
                  label="Policy"
                  value="Selective"
                />

                <Row
                  label="Raw imagery"
                  value="Not retained"
                />

                <Row
                  label="Audio"
                  value="Not retained"
                />
              </Panel>

            </div>

            <section className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.035] p-8">

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                    ENVIRONMENTAL EXPERIMENT
                  </p>

                  <h2 className="mt-3 text-2xl font-medium">
                    Observe → Snapshot → Compare
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    This controlled experiment changes the
                    structured World Model, captures another
                    snapshot, and compares the two states.
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-300/20 bg-black/20 px-5 py-4 text-sm text-zinc-400">
                  <span className="text-cyan-300">
                    Simulation
                  </span>{" "}
                  only
                </div>

              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">

                <ExperimentButton
                  step="01"
                  title="Simulate Change"
                  description="Add a Tool Chest"
                  onClick={
                    simulateChange
                  }
                  disabled={
                    changeLoading ||
                    changeSimulated
                  }
                  loading={
                    changeLoading
                  }
                  complete={
                    changeSimulated
                  }
                />

                <ExperimentButton
                  step="02"
                  title="Capture Snapshot"
                  description="Record current state"
                  onClick={
                    captureSnapshot
                  }
                  disabled={
                    snapshotLoading ||
                    !changeSimulated
                  }
                  loading={
                    snapshotLoading
                  }
                  complete={
                    Boolean(
                      comparison?.result,
                    )
                  }
                />

                <ExperimentButton
                  step="03"
                  title="Compare"
                  description="Ask what changed"
                  onClick={
                    compareEnvironment
                  }
                  disabled={
                    comparisonLoading ||
                    !changeSimulated
                  }
                  loading={
                    comparisonLoading
                  }
                  complete={
                    Boolean(
                      comparison?.summary,
                    )
                  }
                />

              </div>

              <p className="mt-5 text-xs text-zinc-600">
                CΛTΛLYΣT will describe observed
                differences without inventing a reason
                for those differences.
              </p>

            </section>

            {comparison?.summary && (
              <section className="overflow-hidden rounded-3xl border border-cyan-300/30 bg-black/30">

                <div className="border-b border-white/10 px-8 py-6">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                        ENVIRONMENTAL COMPARISON
                      </p>

                      <h2 className="mt-3 text-3xl font-medium">
                        What changed?
                      </h2>
                    </div>

                    <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-wider text-cyan-200">
                      Deterministic comparison
                    </div>

                  </div>

                  <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300">
                    {
                      comparison.summary
                        .statement
                    }
                  </p>

                </div>

                <div className="grid gap-px bg-white/5 md:grid-cols-2">

                  <ChangeColumn
                    title="Added"
                    count={
                      comparison.summary
                        .addedCount
                    }
                    items={
                      comparison.summary
                        .added
                    }
                    status="added"
                  />

                  <ChangeColumn
                    title="Removed"
                    count={
                      comparison.summary
                        .removedCount
                    }
                    items={
                      comparison.summary
                        .removed
                    }
                    status="removed"
                  />

                </div>

                <div className="border-t border-white/10 px-8 py-5">

                  <p className="text-xs leading-5 text-zinc-600">
                    Evidence boundary: this result establishes
                    that the object sets differ between the
                    two snapshots. It does not establish who
                    moved, added, removed, or changed an object.
                  </p>

                </div>

              </section>
            )}

            {/* WORLD GRAPH */}

            <section className="overflow-hidden rounded-3xl border border-cyan-300/25 bg-cyan-300/[0.025]">

              <div className="border-b border-white/10 px-8 py-7">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                      WORLD GRAPH
                    </p>

                    <h2 className="mt-3 text-3xl font-medium">
                      How are things connected?
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                      CΛTΛLYΣT represents environmental
                      entities as connected relationships
                      rather than treating the environment
                      as a flat object list.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const toolChest =
                        contents?.objects.find(
                          (object) =>
                            object.label ===
                            "Tool Chest",
                        );

                      if (toolChest) {
                        void queryRelationships(
                          toolChest.id,
                        );
                      }
                    }}
                    disabled={
                      relationshipLoading ||
                      !changeSimulated
                    }
                    className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {relationshipLoading
                      ? "Reading graph…"
                      : "Refresh World Graph"}
                  </button>

                </div>

              </div>

              {/* ADDITIVE WORLD GRAPH QUERY */}

              <div className="border-b border-white/10 px-8 py-7">

                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                  ASK WORLD GRAPH
                </p>

                <h3 className="mt-3 text-2xl font-medium">
                  Ask about a connection
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                  Ask a question about relationships already
                  represented in the World Model.
                </p>

                <div className="mt-6 flex flex-col gap-3 lg:flex-row">

                  <input
                    value={
                      graphQuestion
                    }
                    onChange={(event) =>
                      setGraphQuestion(
                        event.target.value,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        void askWorldGraph();
                      }
                    }}
                    placeholder="What's near the Tool Chest?"
                    disabled={
                      !changeSimulated
                    }
                    className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-40"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      void askWorldGraph()
                    }
                    disabled={
                      graphLoading ||
                      !changeSimulated
                    }
                    className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-6 py-3 text-sm text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {graphLoading
                      ? "Reading…"
                      : "Ask"}
                  </button>

                </div>

                <div className="mt-4">

                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                    QUERY ENTITY
                  </label>

                  <select
                    value={
                      graphEntityId
                    }
                    onChange={(event) =>
                      setGraphEntityId(
                        event.target.value,
                      )
                    }
                    disabled={
                      !changeSimulated
                    }
                    className="mt-2 w-full rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm text-zinc-200 outline-none focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    <option value="">
                      Select an entity
                    </option>

                    {graphEntities.map(
                      (entity) => (
                        <option
                          key={entity.id}
                          value={entity.id}
                        >
                          {entity.label} —{" "}
                          {entity.category}
                        </option>
                      ),
                    )}

                  </select>

                </div>

                <div className="mt-4 flex flex-wrap gap-2">

                  {[
                    "What's near the Tool Chest?",
                    "What is inside the Tool Chest?",
                    "What does the Garage contain?",
                    "What's next to the Tool Chest?",
                  ].map(
                    (example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() =>
                          setGraphQuestion(
                            example,
                          )
                        }
                        disabled={
                          !changeSimulated
                        }
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 transition hover:border-cyan-300/20 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {example}
                      </button>
                    ),
                  )}

                </div>

                {graphResult && (
                  <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.035] p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                          GRAPH ANSWER
                        </p>

                        <p className="mt-3 text-lg leading-7 text-zinc-200">
                          {graphResult.answer}
                        </p>
                      </div>

                      <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-zinc-400">
                        {graphResult.evidenceCount}{" "}
                        evidence{" "}
                        {graphResult.evidenceCount ===
                        1
                          ? "record"
                          : "records"}
                      </div>

                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">

                      <MiniStat
                        label="Interpretation"
                        value={
                          graphResult.interpretation
                        }
                      />

                      <MiniStat
                        label="Entity"
                        value={getRelationshipLabel(
                          graphResult.entityId,
                        )}
                      />

                      <MiniStat
                        label="Source"
                        value="World Graph"
                      />

                    </div>

                    <div className="mt-5 border-t border-white/10 pt-5">

                      <p className="text-xs leading-5 text-zinc-600">
                        Evidence boundary: this answer is
                        derived from structured relationships
                        currently recorded in the World Model.
                        It does not represent live AR perception.
                      </p>

                    </div>

                  </div>
                )}

              </div>

              {!relationships && (
                <div className="px-8 py-10">

                  <p className="text-sm text-zinc-600">
                    Simulate the Tool Chest change to
                    establish the first spatial relationships.
                  </p>

                </div>
              )}

              {relationships && (
                <div className="p-8">

                  <div className="mb-8 flex items-center justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                        RELATIONSHIPS
                      </p>

                      <p className="mt-2 text-zinc-300">
                        {relationships.count} known
                        relationship
                        {relationships.count ===
                        1
                          ? ""
                          : "s"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (graphEntityId) {
                          void queryRelationships(
                            graphEntityId,
                          );
                        }
                      }}
                      disabled={
                        relationshipLoading ||
                        !graphEntityId
                      }
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-wider text-zinc-500 transition hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {relationshipLoading
                        ? "Reading…"
                        : "Refresh"}
                    </button>

                  </div>

                  {relationships.relationships.length ===
                  0 ? (
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-6">

                      <p className="text-sm text-zinc-600">
                        No relationships are currently
                        recorded for this entity.
                      </p>

                    </div>
                  ) : (
                    <div className="grid gap-4">

                      {relationships.relationships.map(
                        (
                          relationship,
                        ) => (
                          <div
                            key={`${relationship.subjectId}-${relationship.kind}-${relationship.targetId}`}
                            className="rounded-2xl border border-white/10 bg-black/20 p-6"
                          >

                            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                              <div className="flex flex-1 flex-wrap items-center gap-3">

                                <GraphNode
                                  label={
                                    relationship.subjectLabel ??
                                    getRelationshipLabel(
                                      relationship.subjectId,
                                    )
                                  }
                                />

                                <span className="text-cyan-300">
                                  →
                                </span>

                                <div className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2 text-xs uppercase tracking-[0.15em] text-cyan-200">
                                  {
                                    relationship.kind
                                  }
                                </div>

                                <span className="text-cyan-300">
                                  →
                                </span>

                                <GraphNode
                                  label={
                                    relationship.targetLabel ??
                                    getRelationshipLabel(
                                      relationship.targetId,
                                    )
                                  }
                                />

                              </div>

                              <div className="text-left md:text-right">

                                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                                  EVIDENCE
                                </p>

                                <p className="mt-2 text-xs text-zinc-400">
                                  {
                                    relationship
                                      .provenance
                                      .source
                                  }
                                </p>

                                <p className="mt-1 text-[10px] text-zinc-600">
                                  {
                                    relationship
                                      .confidence
                                      .level
                                  }{" "}
                                  confidence
                                </p>

                              </div>

                            </div>

                          </div>
                        ),
                      )}

                    </div>
                  )}

                  <div className="mt-8 rounded-2xl border border-white/5 bg-black/20 p-5">

                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                      EVIDENCE BOUNDARY
                    </p>

                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                      These relationships are currently
                      generated by the controlled BUILD 01
                      simulation. They represent structured
                      environmental state, not live AR
                      perception.
                    </p>

                  </div>

                </div>
              )}

            </section>

            <div className="grid gap-6 lg:grid-cols-3">

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:col-span-2">

                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  TASK STATE
                </p>

                <h2 className="mt-3 text-2xl font-medium">
                  {
                    state.taskState
                      .activeGoal
                  }
                </h2>

                <div className="mt-8">

                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                    USER INTENT
                  </p>

                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    {
                      state.taskState
                        .userIntent ??
                      "No user intent recorded."
                    }
                  </p>

                </div>

                <div className="mt-8">

                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                    COMPLETED
                  </p>

                  <ul className="mt-4 space-y-2 text-sm text-zinc-300">

                    {state.taskState.completedActions.map(
                      (action) => (
                        <li key={action}>
                          ✓ {action}
                        </li>
                      ),
                    )}

                  </ul>

                </div>

                <div className="mt-8 border-t border-white/10 pt-6">

                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                    NEXT
                  </p>

                  <p className="mt-2 text-zinc-300">
                    {
                      state.taskState
                        .nextPlannedStep ??
                      "No next step recorded."
                    }
                  </p>

                </div>

              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  SNAPSHOT
                </p>

                <h2 className="mt-3 text-2xl font-medium">
                  Current state
                </h2>

                <div className="mt-8 space-y-4">

                  <Row
                    label="Objects"
                    value={String(
                      state.snapshot
                        .objectCount,
                    )}
                  />

                  <Row
                    label="Snapshot ID"
                    value={
                      state.snapshot.id.slice(
                        0,
                        8,
                      ) + "…"
                    }
                  />

                  <Row
                    label="Mode"
                    value="Simulated"
                  />

                </div>

              </div>

            </div>

            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.04] p-8">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                    CΛTΛLYΣT COGNITIVE STATE
                  </p>

                  <h2 className="mt-3 text-2xl font-medium">
                    {
                      state.capabilityState
                        .active
                        .toUpperCase()
                    }
                  </h2>
                </div>

                <div className="h-4 w-4 rounded-full border border-cyan-300/70 shadow-[0_0_30px_rgba(103,232,249,0.5)]" />

              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">

                {state.capabilityState.states.map(
                  (item) => (
                    <div
                      key={
                        item.capability
                      }
                      className={`rounded-2xl border p-5 transition ${
                        item.status ===
                        "active"
                          ? "border-cyan-300/50 bg-cyan-300/10"
                          : item.status ===
                              "completed"
                            ? "border-white/10 bg-white/[0.04]"
                            : "border-white/5 bg-white/[0.02]"
                      }`}
                    >

                      <div
                        className={`mx-auto mb-4 h-10 w-10 rounded-full border ${
                          item.status ===
                          "active"
                            ? "border-cyan-300 shadow-[0_0_28px_rgba(103,232,249,0.4)]"
                            : item.status ===
                                "completed"
                              ? "border-white/30"
                              : "border-white/15"
                        }`}
                      />

                      <p className="text-xs font-medium tracking-wider text-zinc-200">
                        {
                          item.capability
                            .toUpperCase()
                        }
                      </p>

                      <p className="mt-2 text-[11px] uppercase tracking-wider text-zinc-600">
                        {item.status}
                      </p>

                    </div>
                  ),
                )}

              </div>

            </div>

            <div className="grid gap-6 lg:grid-cols-2">

              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  ENVIRONMENTAL QUERY
                </p>

                <h2 className="mt-3 text-2xl font-medium">
                  What is in this environment?
                </h2>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                  <input
                    value={
                      searchQuery
                    }
                    onChange={(event) =>
                      setSearchQuery(
                        event.target.value,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        void searchEnvironment();
                      }
                    }}
                    placeholder="Try: compressor"
                    className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/40"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      void searchEnvironment()
                    }
                    disabled={
                      queryLoading
                    }
                    className="rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm text-zinc-200 transition hover:bg-white/[0.08] disabled:opacity-50"
                  >
                    {queryLoading
                      ? "Querying…"
                      : "Query"}
                  </button>

                </div>

                <div className="mt-8">

                  {!searchResults &&
                    contents && (
                      <>
                        <p className="text-sm text-zinc-500">
                          CΛTΛLYΣT currently
                          knows about{" "}
                          <span className="text-zinc-200">
                            {
                              contents.objectCount
                            }
                          </span>{" "}
                          object
                          {contents.objectCount ===
                          1
                            ? ""
                            : "s"}{" "}
                          in this environment.
                        </p>

                        <ObjectList
                          objects={
                            contents.objects
                          }
                        />
                      </>
                    )}

                  {searchResults && (
                    <>
                      <p className="text-sm text-zinc-500">
                        Query:{" "}
                        <span className="text-zinc-200">
                          "
                          {
                            searchResults.query
                          }
                          "
                        </span>
                      </p>

                      <p className="mt-2 text-sm text-zinc-500">
                        Found{" "}
                        <span className="text-zinc-200">
                          {
                            searchResults.matchCount
                          }
                        </span>{" "}
                        matching object
                        {searchResults.matchCount ===
                        1
                          ? ""
                          : "s"}.
                      </p>

                      <ObjectList
                        objects={
                          searchResults.matches
                        }
                      />
                    </>
                  )}

                </div>

              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      ENVIRONMENTAL ACTIVITY
                    </p>

                    <h2 className="mt-3 text-2xl font-medium">
                      What happened?
                    </h2>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-500">
                    {activity
                      ? `${activity.count} events`
                      : "Loading"}
                  </span>

                </div>

                {activity &&
                  activity.items.length >
                    0 && (
                    <div className="mt-8 space-y-3">

                      {activity.items
                        .slice(0, 8)
                        .map(
                          (item) => (
                            <div
                              key={
                                item.id
                              }
                              className="rounded-2xl border border-white/5 bg-black/20 p-4"
                            >

                              <p className="text-sm text-zinc-200">
                                {
                                  item.description
                                }
                              </p>

                              <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-600">
                                {
                                  item.type
                                }
                              </p>

                            </div>
                          ),
                        )}

                    </div>
                  )}

              </section>

            </div>

            {error && (
              <div className="rounded-2xl border border-red-300/20 bg-red-300/[0.05] p-5">

                <p className="whitespace-pre-wrap text-sm text-red-300">
                  {error}
                </p>

              </div>
            )}

          </section>
        )}

      </div>
    </main>
  );
}

function GraphNode({
  label,
}: {
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-zinc-200">
      {label}
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        {label}
      </p>

      <p className="mt-2 truncate text-sm text-zinc-200">
        {value}
      </p>

    </div>
  );
}

function ExperimentButton({
  step,
  title,
  description,
  onClick,
  disabled,
  loading,
  complete,
}: {
  step: string;
  title: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  complete: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border p-5 text-left transition ${
        complete
          ? "border-cyan-300/30 bg-cyan-300/[0.06]"
          : "border-white/10 bg-black/20 hover:border-cyan-300/30 hover:bg-white/[0.04]"
      } disabled:cursor-not-allowed disabled:opacity-45`}
    >

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
            STEP {step}
          </p>

          <p className="mt-3 font-medium text-zinc-200">
            {loading
              ? "Working…"
              : complete
                ? "Complete"
                : title}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            {description}
          </p>

        </div>

        <div
          className={`h-3 w-3 rounded-full border ${
            complete
              ? "border-cyan-300 bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,0.7)]"
              : "border-white/20"
          }`}
        />

      </div>

    </button>
  );
}

function ChangeColumn({
  title,
  count,
  items,
  status,
}: {
  title: string;
  count: number;
  items: readonly EnvironmentalChangeItem[];
  status: "added" | "removed";
}) {
  return (
    <div className="bg-[#0b0d0e] p-8">

      <div className="flex items-center justify-between">

        <h3 className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          {title}
        </h3>

        <span
          className={`text-2xl font-medium ${
            status === "added"
              ? "text-cyan-300"
              : "text-zinc-400"
          }`}
        >
          {count}
        </span>

      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-600">
          No objects in this category.
        </p>
      ) : (
        <div className="mt-6 space-y-3">

          {items.map((item) => (
            <div
              key={item.objectId}
              className="rounded-2xl border border-white/5 bg-black/20 p-5"
            >

              <div className="flex items-center gap-4">

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg ${
                    status === "added"
                      ? "border-cyan-300/30 text-cyan-300"
                      : "border-white/10 text-zinc-500"
                  }`}
                >
                  {status === "added"
                    ? "+"
                    : "−"}
                </div>

                <div>

                  <p className="text-sm font-medium text-zinc-200">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs uppercase tracking-wider text-zinc-600">
                    {item.category}
                  </p>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

function ObjectList({
  objects,
}: {
  objects: readonly WorldObject[];
}) {
  if (objects.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-5">

        <p className="text-sm text-zinc-500">
          No matching objects are currently
          represented in the World Model.
        </p>

      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">

      {objects.map((object) => (
        <div
          key={object.id}
          className="rounded-2xl border border-white/10 bg-black/20 p-5"
        >

          <p className="font-medium text-zinc-200">
            {object.label ??
              "Unnamed object"}
          </p>

          <p className="mt-2 text-xs uppercase tracking-wider text-zinc-600">
            {object.category ??
              "Uncategorized"}
          </p>

        </div>
      ))}

    </div>
  );
}

function Panel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-2xl font-medium">
        {title}
      </h2>

      <div className="mt-8 space-y-4">
        {children}
      </div>

    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">

      <span className="text-sm text-zinc-500">
        {label}
      </span>

      <span className="text-right text-sm text-zinc-200">
        {value}
      </span>

    </div>
  );
}
# CΛTΛLYΣT Repository Constitution

**Version:** 1.0  
**Status:** Foundational  
**Product:** CΛTΛLYΣT — Environmental Intelligence Engine

---

# 1. Purpose

This file is the governing constitution for the CΛTΛLYΣT repository.

All development agents, implementation work, architecture decisions, tests, and repository changes must operate within these rules.

The purpose of this constitution is to ensure that CΛTΛLYΣT is built deliberately, coherently, honestly, and according to the product architecture that has been established.

Development agents exist to build CΛTΛLYΣT.

They do not exist to redefine it.

---

# 2. Product Identity

CΛTΛLYΣT is an:

**ENVIRONMENTAL INTELLIGENCE ENGINE**

Tagline:

**SEE REALITY. UNLOCK POSSIBILITY. CHANGE WHAT COMES NEXT.**

Core relationship:

**Human ↔ Environment ↔ CΛTΛLYΣT**

CΛTΛLYΣT is designed to create a persistent multimodal relationship between intelligence, humans, and the physical environments humans inhabit.

It is not merely:

- a chatbot,
- an AR application,
- a voice assistant,
- a computer-vision system,
- a digital-twin viewer,
- an automation platform,
- or a generic AI agent.

Its architecture integrates perception, world modeling, memory, reasoning, exploration, attention, human intent, and authorized action.

---

# 3. Core Cognitive Loop

The foundational CΛTΛLYΣT loop is:

**PERCEIVE → UNDERSTAND → REMEMBER → EXPLORE → HARMONIZE → TRANSFORM → PERCEIVE AGAIN**

The system should continuously improve its understanding through this cycle.

A system capability should be evaluated against where it contributes to this loop.

---

# 4. Product Philosophy

CΛTΛLYΣT does not seek to become human.

It seeks to understand the world humans inhabit.

The system should bring intelligence into the human environment rather than requiring humans to reduce their environment into perfectly formed prompts.

The foundational principle is:

> We are not trying to make artificial intelligence human. We are trying to bring artificial intelligence into the human world.

---

# 5. Feature-Creep Rule

This rule is absolute.

When a requested feature cannot be clearly connected to:

1. The CΛTΛLYΣT Product Charter,
2. The World Model,
3. An approved roadmap capability, or
4. A documented user requirement,

the agent MUST NOT invent its purpose.

The agent must flag the feature for review.

Agents must not add features simply because:

- they are easy to generate,
- they look impressive,
- another application has them,
- they are fashionable,
- they fill empty UI space,
- or the model believes they would be useful.

---

# 6. Foundational Architecture Rules

## 6.1 World Model

The World Model represents structured environmental reality.

Perception produces observations.

Observations do not automatically become confirmed reality.

The World Model must preserve uncertainty and provenance.

---

## 6.2 Memory

Memory is a cognitive system.

Database storage is not equivalent to memory.

CΛTΛLYΣT memory includes contextual relationships involving:

- what happened,
- where,
- when,
- what was observed,
- what the user noticed,
- what the user cared about,
- what changed,
- what was learned,
- and how historical experience relates to current context.

---

## 6.3 Events

Meaningful environmental history is event-driven.

Events may represent:

- objects observed,
- objects added,
- objects moved,
- objects removed,
- objects changed,
- user identification,
- constraints,
- simulations,
- approvals,
- executions,
- verification,
- corrections.

History should not simply be overwritten when historical change matters.

---

## 6.4 Intelligence

Intelligence should reason primarily over structured state and contextual evidence rather than treating raw model output as reality.

The World Model, Memory, Task State, Attention, Human Intent, and model outputs must remain distinguishable.

---

## 6.5 Model Independence

CΛTΛLYΣT must remain model-agnostic.

The system may use:

- OpenAI,
- Google,
- Anthropic,
- open models,
- local models,
- future providers,
- specialized vision models,
- specialized speech models,
- specialized embedding models.

No single model provider may own the domain architecture.

Provider-specific implementation belongs behind appropriate abstraction and routing boundaries.

---

## 6.6 Human Authority

Consequential actions must follow:

**OBSERVE → REASON → RECOMMEND → ASK → APPROVE → EXECUTE → VERIFY → RECORD**

CΛTΛLYΣT must not silently convert recommendations into consequential actions.

Human authorization is an architectural boundary.

---

## 6.7 Continuous Perception ≠ Permanent Memory

CΛTΛLYΣT may perceive an environment without permanently remembering every observation.

Environmental perception, temporary processing, memory candidates, consolidated memory, and permanent retention are separate concepts.

The user controls memory behavior through Memory Policy.

---

## 6.8 Honest Failure

CΛTΛLYΣT must fail honestly.

Examples:

- If the model did not respond, do not claim that it did.
- If the database did not save something, do not claim it was saved.
- If spatial tracking is degraded, do not claim precise spatial knowledge.
- If an action was not executed, do not claim execution.
- If confidence is low, preserve uncertainty.

Never fake capability.

---

# 7. Truth-State Model

CΛTΛLYΣT must distinguish between:

- **Observed**
- **Inferred**
- **Confirmed**
- **Remembered**
- **Proposed**
- **Executed**

These states must not be silently collapsed.

Examples:

An object can be:

**Observed**

without being:

**Confirmed**

A configuration can be:

**Proposed**

without being:

**Executed**

A historical fact can be:

**Remembered**

without representing the current state of the environment.

Possibility is not reality.

---

# 8. World Model Authority

The World Model is the authoritative structured representation of environmental state.

Core conceptual entities include:

- Environment
- Zone
- Object
- Surface
- Spatial Node
- Observation
- Relationship
- Event
- World Snapshot
- Experience
- Constraint
- Insight
- Simulation State

The exact ontology may evolve through documented architectural decisions.

Agents must not casually redefine these concepts.

---

# 9. Memory Architecture

Memory follows the conceptual pipeline:

**RAW PERCEPTION  
→ OBSERVATION  
→ SIGNIFICANCE  
→ EVENT / EXPERIENCE  
→ MEMORY CANDIDATE  
→ CONSOLIDATION  
→ LONG-TERM MEMORY**

Memory may include:

- Working Memory
- Episodic Memory
- Semantic Memory
- Spatial Memory
- Temporal Memory
- User Context Memory
- Environmental History

The user may explicitly say:

> Remember this.

Explicit memory requests receive the highest persistence priority subject to system safety and privacy constraints.

---

# 10. Memory Policy

Memory Policy is an architectural constraint.

It governs:

- what CΛTΛLYΣT may perceive,
- what may be temporarily retained,
- what may become a memory candidate,
- what may be consolidated,
- raw-media retention,
- memory categories,
- exclusions,
- automatic consolidation,
- confirmation behavior,
- deletion behavior.

Conceptual experience levels may include:

- Ephemeral
- Selective
- Assisted
- Continuous
- Immersive

These are architectural concepts and are not necessarily final user-facing labels.

Do not lock UI terminology prematurely.

---

# 11. Attention Architecture

CΛTΛLYΣT should not constantly interrupt the user.

The conceptual attention pipeline is:

**OBSERVED  
→ CHANGED?  
→ MEANINGFUL?  
→ RELEVANT?  
→ IMPORTANT?  
→ INTERRUPT?**

Attention determines whether something deserves communication or action.

Conversation determines how the system communicates.

Memory determines what persists.

These responsibilities must remain distinct.

---

# 12. Conversation and Task State

CΛTΛLYΣT should support natural conversational interaction.

The system should tolerate:

- incomplete sentences,
- interruptions,
- corrections,
- changing intent,
- conversational references,
- silence,
- variable response length,
- barge-in.

Operational task state should include:

- Current Environment
- Current Observation
- User Intent
- Active Goal
- Constraints
- Decisions
- Pending Actions
- Completed Actions
- Unresolved Questions
- Next Planned Step

Barge-in must preserve task state and allow appropriate replanning.

---

# 13. Perception Architecture

The perception boundary is:

**RAW SENSOR DATA → PERCEPTION → STRUCTURED OBSERVATION**

The rest of the system should operate primarily from structured observations rather than raw sensor streams whenever practical.

Initial serious spatial platform:

- Swift
- SwiftUI
- ARKit
- RealityKit

Future platforms may include:

- Android
- ARCore
- visionOS
- AR glasses
- other spatial computing platforms

Browser-based AR must not be used as a substitute for serious native spatial perception when native capabilities are required.

---

# 14. Physical and Web Architecture

The initial system contains two major interfaces.

## Spatial Client

The iOS application provides:

- camera perception,
- world tracking,
- depth,
- plane detection,
- spatial anchors,
- spatial observations,
- AR interaction.

## Command Center

The web application provides:

- environment visualization,
- World Model visualization,
- memory,
- events,
- timelines,
- simulations,
- recommendations,
- system state,
- administrative and development interfaces.

Both interfaces connect to the same underlying CΛTΛLYΣT domains.

---

# 15. Technology Choices

Current implementation choices include:

### Web

- Next.js
- React
- TypeScript
- Tailwind
- Three.js
- React Three Fiber
- Zustand

### iOS

- Swift
- SwiftUI
- ARKit
- RealityKit

### Backend

- Supabase
- PostgreSQL
- pgvector
- Storage
- Realtime

### Source Control

- Git
- GitHub

### Deployment

- Vercel

### Design

- Penpot

### Development AI

- Kilo Code
- OpenCode
- ChatGPT
- other approved model providers

These technologies are implementation choices.

They are not the identity of CΛTΛLYΣT.

The architecture must remain portable where practical.

---

# 16. Repository Architecture

The conceptual repository structure is:

```text
CATALYST/
├── apps/
│   ├── command-center/
│   └── ios/
├── packages/
│   ├── core/
│   ├── world-model/
│   ├── memory/
│   ├── perception/
│   ├── reasoning/
│   ├── conversation/
│   ├── model-router/
│   ├── task-state/
│   ├── events/
│   ├── simulation/
│   ├── security/
│   └── ui/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
├── docs/
├── tests/
├── scripts/
├── AGENTS.md
├── README.md
└── package.json
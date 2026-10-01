# CΛTΛLYΣT Development Agent System

**Version:** 1.0

This directory defines the development agents responsible for building, validating, and protecting the CΛTΛLYΣT platform.

The development agents operate under the repository constitution defined in:

`/AGENTS.md`

---

# 1. Purpose

CΛTΛLYΣT is being developed using specialized development agents rather than a single unrestricted coding agent.

The purpose of this system is to separate:

- Architectural judgment.
- Software implementation.
- Verification and quality assurance.

This separation reduces architectural drift, feature creep, untested implementation, and misleading claims of functionality.

---

# 2. Agent Hierarchy

The development system consists initially of three agents:

```text
                 CΛTΛLYΣT
                     │
                 AGENTS.md
               Repository Law
                     │
          ┌──────────┼──────────┐
          │          │          │
      ARCHITECT    BUILDER      QA
          │          │          │
       Designs    Implements   Verifies
          │          │          │
          └──────────┼──────────┘
                     │
               HUMAN REVIEW
# Agentic Workflow Bootstrap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bootstrap a repeatable agentic workflow for `Mini_Hands_On_Cube` that preserves session context, scaffolds dated artifacts, and guards contributor documentation updates.

**Architecture:** Keep the workflow inside the standalone cube project so it travels with the folder. Use small Node scripts for scaffolding and guard checks, Husky hooks for reminders and verification, and protected `docs/` folders for reasoning-heavy artifacts that should not live in Serena memory.

**Tech Stack:** Node.js ESM scripts, Husky git hooks, built-in `node:test`, Serena memories, local `CLAUDE.md`, local `LESSONS.md`

---

### Task 1: Define The Contributor Workflow Surface

**Files:**
- Create: `docs/README.md`
- Create: `docs/specs/2026-03-26-agentic-workflow-spec.md`
- Create: `docs/plans/2026-03-26-agentic-workflow-bootstrap.md`
- Create: `docs/handoffs/2026-03-26-agentic-workflow-bootstrap.md`

**Reasoning:**
- The cube folder already separates user-facing docs from contributor context.
- A local `docs/` tree keeps plans and handoffs close to the standalone project without polluting Serena memory.

### Task 2: Add Reusable Templates And Session Bootstrap

**Files:**
- Create: `docs/templates/implementation-plan-template.md`
- Create: `docs/templates/spec-template.md`
- Create: `docs/templates/handoff-template.md`
- Create: `scripts/workflow-lib.mjs`
- Create: `scripts/session-start.mjs`

**Reasoning:**
- A template-backed script lowers friction for future sessions and makes the workflow reproducible.
- The shared helper module keeps filename logic and guard policy in one place.

### Task 3: Add Guard Rails And Hook Automation

**Files:**
- Create: `scripts/check-workflow-changes.mjs`
- Create: `scripts/verify-workflow.mjs`
- Create: `.husky/post-checkout`
- Create: `.husky/post-merge`
- Create: `.husky/pre-commit`
- Create: `.husky/pre-push`
- Modify: `package.json`

**Reasoning:**
- Reminders help at session boundaries.
- Guard scripts keep durable docs aligned with code or workflow changes.
- The hook setup should stay lightweight and avoid bringing back a large runtime test toolchain.

### Task 4: Verify And Record Durable Takeaways

**Files:**
- Create: `tests/workflow/workflow-lib.test.mjs`
- Modify: `CHANGELOG.md`
- Modify: `LESSONS.md`
- Modify: `CLAUDE.md`

**Reasoning:**
- Lightweight tests protect the workflow helper logic.
- Changelog and lessons updates make the new process discoverable for the next session.

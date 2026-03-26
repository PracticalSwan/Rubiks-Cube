# Agentic Workflow Specification

## Goal

Create a lightweight, repeatable session workflow for `Mini_Hands_On_Cube` that keeps context, reasoning, and contributor handoffs inside the project without leaking workflow detail into the user-facing runtime README.

## Non-Goals

- Reintroducing a heavy application test harness for the cube runtime.
- Turning the public `README.md` into contributor process documentation.
- Duplicating Serena memory content inside local docs.

## Requirements

### Universal

- U-001: The project shall keep contributor workflow material inside `docs/`, `CLAUDE.md`, `LESSONS.md`, and Serena memories.
- U-002: The project shall preserve `README.md` as a user-facing runtime guide only.
- U-003: The project shall provide a repeatable command that scaffolds dated workflow artifacts for a new session.
- U-004: The project shall keep workflow automation lightweight enough to live inside the standalone cube folder.

### Event-Driven

- E-001: When a contributor starts a new session, the project shall provide a clear reminder to review context and create a dated plan or handoff note.
- E-002: When runtime files or workflow automation files are committed, the project shall require a matching `CHANGELOG.md` update.
- E-003: When runtime behavior or implementation patterns change, the project shall require a matching `LESSONS.md` update.
- E-004: Upon `npm run verify`, the project shall validate that the workflow scaffolding, scripts, and tests are still intact.

### State-Driven

- S-001: If a task needs explicit requirements, the workflow shall support creating a dated spec artifact.
- S-002: If a plan or handoff file for a topic already exists on the same day, the session bootstrap shall preserve it instead of overwriting it.

### Unwanted Behavior

- N-001: The workflow shall not overwrite existing dated artifacts without an explicit user action.
- N-002: The workflow shall not force contributor-process text into the user-facing runtime README.
- N-003: The workflow shall not depend on global tooling beyond Node.js, Git, and the local npm install.

## Success Criteria

- A new contributor can run one command and receive the right docs scaffold plus context reminders.
- Hook automation nudges good habits without changing the actual cube runtime.
- The project can be extracted to its own repository and keep the same workflow intact.

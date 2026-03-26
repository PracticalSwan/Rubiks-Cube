# Agentic Workflow

This folder holds contributor-only handoff material for `Mini_Hands_On_Cube`. Keep user-facing runtime guidance in `README.md`, stable reusable context in Serena memories, and durable technical takeaways in `LESSONS.md`.

## Sources Of Truth

- `CLAUDE.md` defines session rules, architecture boundaries, and doc update triggers.
- Serena memories hold stable project context that should survive across sessions.
- `LESSONS.md` stores short durable takeaways worth reusing.
- `docs/specs/` stores requirements and problem framing for bigger changes.
- `docs/plans/` stores implementation plans, task breakdowns, and reasoning.
- `docs/handoffs/` stores concise end-of-session notes for the next agent.
- `docs/templates/` stores reusable scaffolds for plans, specs, and handoffs.

## Default Session Loop

1. Read `CLAUDE.md`, `LESSONS.md`, and the Serena memories relevant to the task.
2. Run `npm run session:start -- "<topic>"` to scaffold a dated plan and handoff note.
3. Add `--spec` when the change needs explicit requirements or trade-off capture.
4. Implement the work while keeping `core/` renderer-agnostic and `app.js` as the browser edge.
5. Run `npm run verify` and any task-specific runtime checks before wrapping up.
6. Update `CHANGELOG.md`, `LESSONS.md`, and the matching handoff note when the change is durable.

## Automation

- `prepare` installs Husky hooks after `npm install`.
- `post-checkout` and `post-merge` remind contributors to start a fresh session deliberately.
- `pre-commit` blocks commits that change runtime or workflow files without the matching `CHANGELOG.md` and `LESSONS.md` updates.
- `pre-push` runs `npm run verify` so the workflow scripts and lightweight tests stay healthy.

## Folder Map

- `docs/specs/2026-03-26-agentic-workflow-spec.md` is the initial workflow requirements baseline.
- `docs/plans/2026-03-26-agentic-workflow-bootstrap.md` records the bootstrap plan and reasoning.
- `docs/handoffs/2026-03-26-agentic-workflow-bootstrap.md` captures the initial handoff state for future sessions.

## Notes

- Keep this folder project-local so `Mini_Hands_On_Cube` can be extracted without losing workflow context.
- Do not copy detailed plan steps into Serena memory or `LESSONS.md`; summarize only the durable parts there.

# Contributor Workflow

This folder holds contributor-only session material for `Mini_Hands_On_Cube`. Keep user-facing runtime guidance in `README.md`, stable reusable context in Serena memories, and durable technical takeaways in `LESSONS.md`.

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
2. Run `npm run session:start -- "<topic>"` when the task needs a dated plan and handoff trail.
3. Add `--spec` when the change needs explicit requirements or trade-off capture.
4. Implement the work while keeping `core/` renderer-agnostic and `app.js` as the browser edge.
5. Run `npm run verify` and any task-specific runtime checks before wrapping up.
6. Update `CHANGELOG.md`, `LESSONS.md`, and Serena memory with the durable takeaways, then prune completed dated notes that no longer add value.

## Automation

- `prepare` installs Husky hooks after `npm install`.
- `post-checkout` and `post-merge` remind contributors to start a fresh session deliberately.
- `pre-commit` runs `npm run workflow:guard` as an advisory hook. Run `npm run workflow:guard` directly when you need a blocking check before committing.
- `pre-push` runs `npm run verify` as an advisory hook. Run `npm run verify` directly before publishing or when you need a blocking verification pass.

## Folder Map

- `docs/templates/` stores reusable scaffolds for plans, specs, and handoffs.
- `docs/plans/` stores active or in-progress implementation plans.
- `docs/specs/` stores active requirements or problem-framing docs.
- `docs/handoffs/` stores open session notes for the next contributor.
- These dated folders may be empty between active sessions; keep them lean on purpose.

## Notes

- Keep this folder project-local so `Mini_Hands_On_Cube` can be extracted without losing workflow context.
- Do not copy detailed plan steps into Serena memory or `LESSONS.md`; summarize only the durable parts there.

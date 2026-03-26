# Agentic Workflow Bootstrap Handoff

## Summary

- Added a local `docs/` workflow tree for plans, specs, templates, and handoff notes.
- Added Node-based session bootstrap and workflow guard scripts.
- Reintroduced lightweight Husky automation for contributor workflow only.

## Decisions

- Keep the public `README.md` runtime-only.
- Keep stable facts in Serena memory and detailed reasoning in `docs/`.
- Use built-in `node:test` instead of restoring a large application test harness.

## Verification Targets

- `npm test`
- `npm run workflow:verify`
- `npm run verify`
- Local hook install via `npm install`

## Next Session Starting Point

1. Read `CLAUDE.md` and `LESSONS.md`.
2. Read the Serena memories relevant to the task.
3. Run `npm run session:start -- "<topic>"`.
4. Fill in the generated plan and handoff files before editing source files.

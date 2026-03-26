# Contributing

Thanks for taking the time to improve Mini Hands On Cube.

## Getting Started

1. Fork the repository and create a focused branch for your change.
2. Install dependencies with `npm install`.
3. Start the local app with `npm run dev`.

## Before You Open a Pull Request

- Run `npm run verify`.
- Update `README.md` when the change affects setup, usage, or visible behavior.
- Update `CHANGELOG.md` for notable user-facing or contributor-facing changes.
- Keep `README.md` runtime-focused and keep contributor-only notes in `docs/`.

## Project Expectations

- Keep renderer-agnostic logic in `core/`.
- Keep DOM and Three.js wiring at the `app.js` edge.
- Prefer small, well-scoped pull requests with a clear description of what changed.
- Include screenshots or short recordings when the UI or scene behavior changes.

## Style

- Use the existing Vite workflow and local npm scripts instead of ad hoc tooling.
- Follow the local ESLint and Prettier configuration.
- Write comments only when they explain intent, constraints, or non-obvious tradeoffs.

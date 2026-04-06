# Context: Phase 0 — Project Scaffolding

## MCP servers involved

None directly. Phase 0 is infrastructure — no MCP tools are called during scaffolding.

## External APIs

None. All outputs are local files.

## Schemas read or written

None yet. The `schemas/` directory is created empty; schemas are implemented in Phase 1.

## Dependencies on other features

- **None** — Phase 0 is the foundation. All subsequent phases depend on it.
- Phase 1 (Schemas) depends on `tsconfig.json` being configured correctly for TypeScript compilation.
- Phase 2 (SKILL.md) depends on `.claude/skills/d2c/` directory structure existing.
- Phases 5-7 (Demo Buttons) depend on `demo/` directory structure existing.

## Key decisions

- **ESM-only**: `"type": "module"` in package.json. Required by Storybook 10. All imports use ESM syntax.
- **Vitest over Jest**: Vitest has native ESM support, aligns with the ESM-only constraint. No configuration shims needed.
- **Local path dependency**: `component-contracts` referenced as `file:../component-contracts`. Will fail `npm install` until that repo is scaffolded. This is a known, accepted state.
- **Node 22.x in CI**: Matches the `engines` constraint and Storybook 10's requirement of 22.19+.
- **Storybook 10**: Targeted version. `@storybook/addon-mcp` provides the MCP server at `/mcp`. React-only initially.

## Library-specific context

- **Vitest**: ESM-native test runner. Config via `vitest.config.ts` or inline in `package.json`. Supports `import.meta.dirname` for path resolution.
- **Storybook 10**: ESM-only, CSF factories preferred, `@storybook/addon-essentials` is an empty package (do not include).
- **class-variance-authority (CVA)**: `^0.7` — variant-driven component styling. Core dependency for the build phase.

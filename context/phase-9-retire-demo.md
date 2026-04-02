# Context: Phase 9 — Retire Phase Demo

## MCP servers involved

- **Variant Authority MCP** — deprecation signal (written directly to manifest since MCP not yet built)
- **Storybook MCP** — status update to "deprecated" (documented, not exercised)

## Schemas read or written

| Schema | Operation |
|---|---|
| `variant-manifest.ts` | Update — add deprecated field |
| `status-registry.ts` | Update — set Button to deprecated |

## Key decisions

- **Button → ActionButton** (not Badge → StatusBadge): Changed to match the Button demo component.
- **Blocked by seeded consumer**: Demo intentionally leaves Button in "deprecated" not "retired" to show the removal gate blocking behavior.
- **Codemod is a scaffold**: The codemod shows the pattern but doesn't implement a full AST transform — that would require jscodeshift as a dependency which is out of scope for a demo.

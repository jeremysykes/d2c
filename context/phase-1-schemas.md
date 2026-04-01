# Context: Phase 1 — Schemas

## MCP servers involved

**Sequential Thinking** — Used to reason about cross-phase data flow before defining schemas. No other MCP servers are called during schema definition.

## External APIs

None. Schemas are pure TypeScript type definitions.

## Schemas read or written

This phase *creates* all 5 schemas. No schemas are read.

| Schema | Written to | Read by phases |
|---|---|---|
| `variant-manifest.ts` | `.claude/skills/d2c/schemas/` | Design, Build, Validate, Ship, Maintain, Retire |
| `status-registry.ts` | `.claude/skills/d2c/schemas/` | All phases, CI (validate.yml) |
| `drift-report.ts` | `.claude/skills/d2c/schemas/` | Maintain, Validate (re-validation), Ship |
| `diff-result.ts` | `.claude/skills/d2c/schemas/` | Validate, Ship, Maintain |
| `batch-report.ts` | `.claude/skills/d2c/schemas/` | Batch runner, CI |

## Dependencies

- **Phase 0** — tsconfig.json must be configured for TypeScript compilation
- No runtime dependencies — schemas are type-only

## Key decisions

- **Self-contained schemas**: Each schema file is independent — no cross-imports between schema files. This prevents circular dependencies and allows phases to import only what they need.
- **Type guards over runtime validators**: Each schema includes a simple `is{Name}` type guard function. Full runtime validation (e.g., Zod) is not needed at this stage — type guards are sufficient for JSON boundary checks.
- **ISO 8601 strings for timestamps**: All dates are `string` type, not `Date`. This ensures JSON serializability without transformation.
- **LifecyclePhase as union type**: 10 explicit string literals rather than an enum. Enums in TypeScript emit runtime code; union types are pure type-level.

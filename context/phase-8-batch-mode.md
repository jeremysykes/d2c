# Context: Phase 8 — Batch Mode

## MCP servers involved

None directly. Batch mode is orchestration — it invokes phases which in turn call MCP servers.

## Schemas read or written

| Schema | Operation |
|---|---|
| `batch-report.ts` | Write — batch report JSON |
| `status-registry.ts` | Read/Update — per-component status |

## Dependencies

- **Phase 1** — batch-report schema
- **Phases 5-7** — demo components to batch over
- **Phase 2** — SKILL.md already documents batch mode behavior

## Key decisions

- **Scope manifest is a simple JSON list**: Not a complex query language. A manifest lists component names, and the batch runner iterates over them.
- **Never halt on failure**: Each component is independent. A failure in one does not affect others.
- **Sample report is a demonstration artifact**: The batch report in `.d2c/batch-reports/` shows what a real run would produce. In production, the skill generates these dynamically.

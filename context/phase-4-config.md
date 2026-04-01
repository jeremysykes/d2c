# Context: Phase 4 — Configuration

## MCP servers involved

None. Configuration is static typed data.

## External APIs

None.

## Schemas read or written

None. Config files are independent of schemas — they export primitive values only.

## Dependencies

- **BRIEF.md** — flag defaults table is the source of truth for values
- **Amendment 01** — adds `tokenSource: "auto"` to defaults

## Key decisions

- **Config independent of schemas**: defaults.ts and thresholds.ts do not import from schema files. This keeps the dependency graph clean — schemas depend on nothing, config depends on nothing, phase logic depends on both.
- **Token threshold is immutable**: The `TOKEN_THRESHOLD_OVERRIDE: false` constant documents the architectural decision that token drift tolerance is always zero.

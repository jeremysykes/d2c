# Context: Phase 2 — SKILL.md and Phase Docs

## MCP servers involved

None directly during creation. The phase docs *document* MCP tool call patterns for each phase but don't invoke them during this phase.

## External APIs

None. These are instruction documents.

## Schemas read or written

Phase docs *reference* all 6 schemas from Phase 1 but do not read or write JSON files.

| Phase doc | Schemas referenced |
|---|---|
| design.md | variant-manifest, status-registry |
| build.md | variant-manifest, status-registry, token-source |
| validate.md | diff-result, status-registry |
| ship.md | variant-manifest, status-registry |
| maintain.md | drift-report, variant-manifest, status-registry |
| retire.md | variant-manifest, status-registry |

## Dependencies

- **Phase 1** — Schemas must be defined so phase docs can reference correct type shapes
- **Amendment 01** — build.md and ship.md must reflect the Tokens Studio pipeline and Pro plan write-back scope

## Key decisions

- **Portable format**: No Claude Code-specific syntax. Uses standard MCP tool call patterns. Compatible with Cursor and Codex CLI.
- **Compatibility frontmatter**: SKILL.md declares supported clients in frontmatter.
- **Phase routing in SKILL.md**: SKILL.md is a dispatcher — it reads flags and includes the correct phase doc. It does not contain phase logic itself.
- **Each phase doc is self-contained**: A phase doc contains everything needed to execute that phase. No cross-references between phase docs except through the status registry.

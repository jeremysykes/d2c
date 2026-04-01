# Context: Phase 3 — MCP Docs

## MCP servers involved

All 5 MCP servers are *documented* in this phase but none are called directly. These docs describe tool call patterns for use by the phase docs.

## External APIs

- **Figma REST API**: Documented in figma.md — endpoints, auth, rate limits, plan restrictions
- **Storybook MCP HTTP endpoint**: Documented in storybook.md — /mcp endpoint from addon

## Schemas read or written

None. MCP docs reference schemas but do not produce JSON artifacts.

## Dependencies

- **Phase 2** — Phase docs reference MCP docs for tool call patterns
- **Amendment 01** — figma.md must document Variables API Enterprise constraint
- **component-contracts** — variant-authority.md and radix-primitives.md document MCP servers from this package (not yet built)

## Key decisions

- **Figma preflight as reference pattern**: The no-op PATCH preflight is documented as a reusable pattern, not hardcoded to a specific endpoint
- **Three-threshold diff as core concept**: playwright.md explains *why* three thresholds exist, not just how to configure them
- **Storybook 10 as target**: storybook.md documents Storybook 10 specifically — CSF factories, ESM-only, empty addon packages
- **component-contracts as requirement gate**: variant-authority.md and radix-primitives.md document the expected MCP interface even though the servers aren't built yet. This serves as a contract for the component-contracts development.

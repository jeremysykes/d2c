---
mcp: variant-authority
description: Variant Authority MCP — CVA registry operations and deprecation signals
compatibility: [claude-code, cursor, codex-cli]
---

# Variant Authority MCP

The engineering contract layer for d2c. Stores the canonical variant manifest — which variants exist, what their allowed values are, what's deprecated, and what the migration path is. Enforces consistency between Figma variant names and code prop types.

## Source

This MCP server is provided by the `component-contracts` package:

- Repository: https://github.com/jeremysykes/component-contracts
- Local path dependency: `"component-contracts": "file:../component-contracts"`
- Provides two MCP servers: `variant-authority` and `radix-primitives`

**Note**: component-contracts is currently in development. If the MCP server is not yet available, surface a requirement gate.

## Manifest location

Variant manifests are stored at:

```
.variant-authority/{component}.manifest.json
```

Each component has exactly one manifest file. The manifest conforms to the `variant-manifest.ts` schema.

## Registry operations

### Read manifest

Read the current variant manifest for a component:

- Input: component name
- Output: `VariantManifest` object
- Error if manifest does not exist: "No variant manifest found for {component}. Run the design phase first."

### Write manifest

Create or update the variant manifest:

- Input: component name, `VariantManifest` data
- Validates against the `variant-manifest.ts` schema before writing
- Updates `updatedAt` timestamp
- Preserves `createdAt` on updates

### Query variants

Query variant definitions for a component:

- Input: component name, optional variant name filter
- Output: `Record<string, VariantDefinition>` (all variants or filtered subset)

### Query deprecated components

List all components with `deprecated` field set:

- Output: array of `{ component, deprecatedAt, replacedBy }`

## Conflict detection

The Variant Authority is the tiebreaker when Figma and code disagree on structural decisions:

**When `--truth-structure cva` (default):**
- CVA registry is the authority for variant names, prop types, slot definitions
- If Figma adds a variant that doesn't exist in CVA, it's flagged as a conflict
- Resolution: add the variant to CVA (code change) or remove it from Figma (design change)

**When `--truth-structure figma`:**
- Figma is the authority for structural decisions
- If CVA has a variant that doesn't exist in Figma, it's flagged for removal
- Resolution: remove from CVA or add to Figma

## Deprecation signal

When the retire phase runs, the Variant Authority records the deprecation:

```json
{
  "deprecated": {
    "deprecated": true,
    "replacedBy": "ActionButton",
    "migrationGuide": ".d2c/migration-guides/button-to-actionbutton.md",
    "deprecatedAt": "2026-04-01T00:00:00.000Z",
    "removalTarget": "2.0.0"
  }
}
```

The deprecation signal is consumed by:
- Storybook (parameters.status → "deprecated")
- CI (status registry check blocks deployments if deprecated components are used without migration)
- Consumer surface map (tracks who still references the deprecated component)

## Version tracking

The variant manifest includes a `version` field that follows semver:

- Design phase: `0.1.0` (initial)
- Ship to alpha: `x.y.z-alpha.N`
- Ship to beta: `x.y.z-beta.N`
- Ship to stable: `x.y.z`

Version is managed by the ship phase, not by the Variant Authority MCP directly.

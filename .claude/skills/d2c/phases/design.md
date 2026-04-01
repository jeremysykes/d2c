---
phase: design
description: Extract component from Figma and seed the Variant Authority registry
compatibility: [claude-code, cursor, codex-cli]
---

# Design Phase

Extract a component's structure from Figma and create the canonical variant manifest that all subsequent phases depend on.

## Required MCP servers

- **Figma MCP** — component structure extraction, variant reading
- **Variant Authority MCP** — registry seeding

## Inputs

- `--component`: Target component name
- `--truth-structure`: Authority for variant names (default: cva)
- `--truth-visual`: Authority for tokens (default: figma)
- `--truth-conflict-strategy`: Conflict resolution (default: escalate)
- Figma file key (from environment variable or component config)

## Steps

### 1. Extract component from Figma

Call Figma MCP to read the component structure:

- Use `get_design_context` with the component's Figma file key and node ID
- Extract variant properties (names, allowed values, types)
- Extract slot structure (named children, required/optional)
- Extract layout metadata (auto-layout, constraints, spacing)

### 2. Extract token bindings

Read token bindings from the component's Figma data:

- Identify all `boundVariables` references in the component tree
- For each bound variable, record the variable ID and the property it binds to
- Map variable IDs to DTCG token paths using naming conventions
- Record the category for each token (color, spacing, typography, border, shadow, opacity)

Note: Variable *values* are not available via REST API on Pro plans. Values come from Tokens Studio or pre-sourced DTCG files during the build phase. The design phase captures *bindings* (which variable is bound where), not values.

### 3. Resolve authority

For each extracted property, determine the authority source:

- **Structural properties** (variant names, slot definitions, prop types): governed by `--truth-structure`
- **Visual properties** (tokens, spacing, colors): governed by `--truth-visual`
- If the component already exists in the Variant Authority registry, compare extracted data against the existing manifest
- If conflicts are detected and `--truth-conflict-strategy` is `escalate`, halt and emit a conflict report

### 4. Seed variant manifest

Write the variant manifest to `.variant-authority/{component}.manifest.json`:

- Populate all fields per the `variant-manifest.ts` schema
- Set `authority.structure` and `authority.visual` from flags
- Set `authority.conflictStrategy` from flag
- Set `createdAt` and `updatedAt` to current ISO 8601 timestamp
- Set `version` to `0.1.0` for new components

### 5. Update status registry

Update `.d2c/status-registry.json`:

- Set component status to `"design"`
- Record the phase transition in history
- Set `updatedBy` to `"design"`

## Output artifacts

| Artifact | Location | Schema |
|---|---|---|
| Variant manifest | `.variant-authority/{component}.manifest.json` | `variant-manifest.ts` |
| Status registry | `.d2c/status-registry.json` | `status-registry.ts` |

## Failure modes

- **Figma file not accessible**: Check FIGMA_ACCESS_TOKEN scope. Require `file_content:read`.
- **Component not found in file**: List available components in the file. Ask user to verify the component name and node ID.
- **Variant Authority MCP not connected**: Report missing server. Design phase cannot complete without it.

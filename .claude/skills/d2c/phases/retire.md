---
phase: retire
description: Deprecation signal, codemod generation, migration guide, and removal gate
compatibility: [claude-code, cursor, codex-cli]
---

# Retire Phase

Manage the end-of-life process for a component. Retirement is a process, not a deletion — it involves signaling deprecation, generating migration tooling, and enforcing a removal gate that blocks deletion until all consumers have migrated.

## Required MCP servers

- **Variant Authority MCP** — deprecation signal emission
- **Storybook MCP** — status update to deprecated/retired in story parameters

## Inputs

- `--component`: Target component name (the component being retired)
- `--force-retire`: Override the zero-usage removal gate (default: false)
- `--justification`: Required string when `--force-retire` is true. Logged permanently.
- Variant manifest at `.variant-authority/{component}.manifest.json`

## Prerequisites

- Component must be in `"stable"` status or later
- A replacement component should be identified (or `"none"` if no replacement)

## Steps

### 1. Identify replacement

Check if a replacement component is specified:

- If the variant manifest has `deprecated.replacedBy`, use that
- If not, prompt for the replacement component name
- If no replacement exists, use `"none"` as the sentinel value
- Do not use an empty string — always provide an explicit value

### 2. Emit deprecation signal

Update the Variant Authority registry:

- Set `deprecated: true` in the variant manifest
- Set `replacedBy` to the replacement component name
- Set `deprecatedAt` to current ISO 8601 timestamp
- Set `migrationGuide` to the path where the migration guide will be written

### 3. Generate migration guide

Write `.d2c/migration-guides/{component}-to-{replacement}.md`:

- Document the replacement component and its API differences
- Map old props to new props where applicable
- Map old variants to new variants
- Document any behavioral changes
- Include before/after code examples
- If replacement is `"none"`, document the removal and any alternative patterns

### 4. Generate codemod

Create a migration codemod that:

- Finds all imports of the deprecated component
- Rewrites imports to the replacement component
- Maps props where the mapping is unambiguous
- Flags props with no clear mapping for manual review
- Output to `.d2c/migration-guides/{component}-codemod.ts`

### 5. Query consumer surface map

Check the consumer surface map (populated by the maintain phase):

- Count the number of files that import the deprecated component
- Count the number of unique packages/products that consume it
- If consumer count is zero, the removal gate passes
- If consumer count is greater than zero, the removal gate blocks

### 6. Enforce removal gate

The removal gate prevents deletion of a component that still has consumers:

**If consumers exist and `--force-retire` is false:**
- Report the consumer count and list affected files
- Set status to `"deprecated"` (not `"retired"`)
- Message: "Component deprecated. {N} consumers remain. Run consumers through the codemod before retiring."
- Do not advance to `"retired"` status

**If consumers exist and `--force-retire` is true:**
- Require `--justification` string (error if missing)
- Log the justification permanently in the status registry history
- Set status to `"retired"` with a record of the forced retirement
- Message: "Component force-retired with justification: {justification}. {N} consumers still reference this component."

**If zero consumers:**
- Set status to `"retired"`
- Message: "Component retired. Zero consumers confirmed."

### 7. Update Storybook status

Use Storybook MCP to update the component's story:

- Set `parameters.status` to `"deprecated"` or `"retired"`
- This updates the visual indicator in the Storybook sidebar

### 8. Update status registry

- Set status to `"deprecated"` or `"retired"` per the removal gate outcome
- Record the transition in history
- If force-retired, include the `--justification` in the history entry

## Output artifacts

| Artifact | Location | Schema |
|---|---|---|
| Migration guide | `.d2c/migration-guides/{component}-to-{replacement}.md` | — |
| Codemod | `.d2c/migration-guides/{component}-codemod.ts` | — |
| Variant manifest | `.variant-authority/{component}.manifest.json` (updated with deprecation) | `variant-manifest.ts` |
| Status registry | `.d2c/status-registry.json` | `status-registry.ts` |

## Failure modes

- **Component not in stable status**: Error — only stable components can be retired. Report current status.
- **--force-retire without --justification**: Error — justification is required for forced retirement. Do not proceed.
- **Variant Authority MCP not connected**: Cannot emit deprecation signal. Error with install instructions.
- **Consumer surface map not populated**: Warn that consumer data is unavailable. Recommend running maintain phase first. If proceeding, treat consumer count as unknown and block removal gate (safe default).

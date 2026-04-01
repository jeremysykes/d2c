---
phase: maintain
description: On-demand drift detection and consumer tracking
compatibility: [claude-code, cursor, codex-cli]
---

# Maintain Phase

Detect drift between the Figma design source and the code implementation. This phase runs on-demand by invocation — it is not a continuous webhook listener. Continuous drift detection is an infrastructure concern outside the scope of this skill.

## Required MCP servers

- **Figma MCP** — current component state extraction
- **Playwright MCP** — visual re-comparison against baseline

## Inputs

- `--component`: Target component name
- `--truth-structure`: Authority for structural properties (default: cva)
- `--truth-visual`: Authority for visual properties (default: figma)
- `--truth-conflict-strategy`: Conflict resolution (default: escalate)
- Variant manifest at `.variant-authority/{component}.manifest.json`

## Prerequisites

- Component must be in `"alpha"` status or later (must have been shipped at least once)

## On-demand invocation model

This phase checks current state when invoked. It does not poll, watch, or subscribe to events. The architectural reasoning:

- Webhook-based drift detection requires a persistent listener service — that is infrastructure, not a skill
- On-demand invocation is correct for a skill: the user decides when to check
- For continuous monitoring, a companion service can call this phase on Figma file change events
- See Figma webhook documentation: https://www.figma.com/developers/api#webhooks_v2

## Steps

### 1. Re-extract Figma state

Call Figma MCP to read the current component structure:

- Extract current variant properties
- Extract current token bindings (variable ID references)
- Extract current slot structure

### 2. Compare against variant manifest

Diff the current Figma state against the stored variant manifest:

**Structural comparison** (governed by `--truth-structure`):
- Variant names added or removed
- Variant values added or removed
- Slot definitions changed
- Prop types changed

**Visual comparison** (governed by `--truth-visual`):
- Token bindings changed (different variable bound to same property)
- Spacing values changed
- Color values changed

### 3. Compare token values

Read current token values from the resolved token source and compare against the variant manifest's recorded token bindings:

- For each token in the manifest, check if the current value matches
- Record mismatches as drift entries

### 4. Apply truth authority

For each detected drift entry, determine the resolution based on the authority flags:

| Authority | Drift direction | Resolution |
|---|---|---|
| `--truth-visual figma` | Figma changed, code unchanged | `auto-fix-code` — code should update |
| `--truth-visual figma` | Code changed, Figma unchanged | `escalate` — code deviated from authority |
| `--truth-visual cva` | Code changed, Figma unchanged | `auto-fix-figma` — Figma should update |
| `--truth-visual cva` | Figma changed, code unchanged | `escalate` — Figma deviated from authority |
| `--truth-conflict-strategy escalate` | Both changed | `escalate` — human decision required |
| `--truth-conflict-strategy figma-wins` | Both changed | `auto-fix-code` |
| `--truth-conflict-strategy cva-wins` | Both changed | `auto-fix-figma` |

### 5. Run visual re-comparison

Use Playwright MCP to capture current screenshots and compare against baselines:

- If visual delta exceeds thresholds, add to drift report
- This catches rendering drift that token comparison alone cannot detect

### 6. Generate drift report

Write `.d2c/drift-report.json` per the `drift-report.ts` schema:

- `status`: "clean" if no drift, "drifted" if drift detected with clear authority, "conflict" if escalation needed
- `entries`: one entry per drifted token or property
- `summary`: counts of total checked, drifted, conflicts

### 7. Update status registry

- If `status` is "clean": no change to lifecycle status
- If `status` is "drifted" or "conflict": set component to `"blocked"` with `blockedReason` summarizing the drift
- Record the maintain check in history regardless of outcome

## Consumer surface map

Track which products or packages consume this component:

- Scan for import statements matching the component name across the workspace
- Record consumer file paths, versions referenced, and usage patterns
- Store in the drift report as supplementary data
- This data feeds the retire phase's removal gate

## PR impact estimation

When drift is detected on a component with known consumers:

- Estimate the blast radius: how many consumer files would be affected
- Flag breaking changes (variant removals, prop type changes)
- Surface this in the drift report for human review

## Output artifacts

| Artifact | Location | Schema |
|---|---|---|
| Drift report | `.d2c/drift-report.json` | `drift-report.ts` |
| Current screenshots | `.d2c/diff-results/{component}/current/` | — |
| Status registry | `.d2c/status-registry.json` | `status-registry.ts` |

## Failure modes

- **Figma file changed structure significantly**: Large drift detected. Report as "conflict" status. Do not auto-resolve.
- **Token source not available**: Error — cannot compare tokens without a source. Run build phase to establish token source.
- **Component not yet shipped**: Error — maintain phase requires alpha status or later. Report current status.

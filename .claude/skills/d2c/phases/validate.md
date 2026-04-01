---
phase: validate
description: Run three validation gates — visual diff, token delta, and a11y/interaction tests
compatibility: [claude-code, cursor, codex-cli]
---

# Validate Phase

Run three independent validation gates. All three must pass for the component to advance past validate. Any failure sets the component to `blocked` status.

## Required MCP servers

- **Playwright MCP** — screenshot capture and visual diff
- **Figma MCP** — frame export for comparison
- **Storybook MCP** — a11y and interaction test execution

## Inputs

- `--component`: Target component name
- `--diff-threshold-pixel`: Max % of changed pixels (default: 0.1)
- `--diff-threshold-region`: Max contiguous changed region in px² (default: 15)
- `--diff-threshold-token`: Token mismatches allowed (default: 0, hard zero, no override)
- `--viewport`: Locked viewport (default: 1440x900)
- Variant manifest at `.variant-authority/{component}.manifest.json`
- Storybook running at `STORYBOOK_URL`

## Prerequisites

- Component must be in `"build"` status or later
- Component code and story file must exist
- Storybook must be running and accessible

## Steps

### 1. Capture current screenshots

Use Playwright MCP to screenshot each story variant:

- Navigate to the Storybook URL for each story
- Set viewport to the configured size (default: 1440x900)
- Wait for the component to render fully
- Capture screenshot
- Save to `.d2c/diff-results/{component}/current/`

### 2. Gate 1 — Pixel diff

Compare current screenshots against baselines in `.d2c/diff-baseline/{component}/`:

- If no baseline exists (first run), establish the current screenshots as baseline. Gate passes automatically on first run.
- If baseline exists, compute pixel-level diff
- Calculate `pixelDelta` as percentage of changed pixels
- **Pass condition**: `pixelDelta <= --diff-threshold-pixel`

### 3. Gate 2 — Region diff

Analyze the diff image for contiguous changed regions:

- Identify connected components of changed pixels
- Calculate the area of the largest contiguous region in px²
- **Pass condition**: `regionDelta <= --diff-threshold-region`

This catches localized regressions that a global pixel percentage misses (e.g., a corner radius change on a small element).

### 4. Gate 3 — Token delta

Compare token values between the variant manifest and the current token source:

- Read token bindings from the variant manifest
- Read current token values from the resolved token source
- Count mismatches
- **Pass condition**: `tokenDelta == 0` (hard zero, no override via flag)

A token mismatch means the component is visually incorrect by definition — the rendered output cannot match the design spec if the tokens are wrong.

### 5. Run Storybook tests

Use Storybook MCP to run:

- **Accessibility audit**: Check all stories against WCAG 2.1 AA
- **Interaction tests**: Run any interaction tests defined in the story file

Report results but do not gate on them for v1 — a11y and interaction results are advisory. They are included in the diff result output for review.

### 6. Evaluate gates

All three gates must pass for the component to advance:

```
passed = gate1.passed AND gate2.passed AND gate3.passed
```

Write the result to `.d2c/diff-results/{component}-latest.json` per the `diff-result.ts` schema.

### 7. Update status registry

- If all gates pass: set status to `"validate"`
- If any gate fails: set status to `"blocked"` with `blockedReason` listing which gates failed and their delta values

## Output artifacts

| Artifact | Location | Schema |
|---|---|---|
| Current screenshots | `.d2c/diff-results/{component}/current/` | — |
| Diff images | `.d2c/diff-results/{component}/diff/` | — |
| Diff result | `.d2c/diff-results/{component}-latest.json` | `diff-result.ts` |
| Status registry | `.d2c/status-registry.json` | `status-registry.ts` |

## Failure modes

- **Storybook not running**: Error with instructions to start Storybook. Provide the STORYBOOK_URL value being used.
- **Playwright MCP not connected**: Cannot capture screenshots. Error with install instructions.
- **Baseline missing on non-first run**: If baselines were deleted, treat as first run and establish new baselines with a warning.
- **Token source missing**: Error — run build phase to resolve token source first.

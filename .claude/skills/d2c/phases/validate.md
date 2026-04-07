---
phase: validate
description: Run two deterministic validation gates — structural comparison and token delta
compatibility: [claude-code, cursor, codex-cli]
---

# Validate Phase

Run two deterministic validation gates. Both must pass for the component to advance past validate. Any failure sets the component to `blocked` status.

## Required MCP servers

- **Playwright MCP** — render Storybook stories, extract computed CSS
- **Figma MCP** — frame export for reference screenshot

## Inputs

- `--component`: Target component name
- `--diff-threshold-token`: Token mismatches allowed (default: 0, hard zero, no override)
- `--viewport`: Locked viewport (default: 1440x900)
- Variant manifest at `.variant-authority/{component}.manifest.json`

## Prerequisites

- Component must be in `"build"` status or later
- Component code and story file must exist

## Steps

### 1. Start Storybook if not running

1. Fetch `STORYBOOK_URL` (default: `http://localhost:6006`) to check if Storybook is already running
2. If not running, spawn `npm run storybook` as a detached child process
3. Poll the URL every 2 seconds, timeout after 60 seconds
4. If timeout, fail with error: "Storybook failed to start. Check `npm run storybook` manually."
5. Track whether the validate phase started Storybook (for cleanup in step 6)

### 2. Gate 1 — Structural comparison

Use Playwright MCP to navigate to the Storybook story URL for the primary variant. The gate discovers what to check by reading the component's `semantic.css` file (located via `semanticTokenFile` in the variant manifest).

**Convention-driven discovery:**

The gate reads every CSS custom property declaration from `semantic.css` and derives the CSS property and target element from the naming convention:

| Token pattern | CSS property | Target |
|---|---|---|
| `--{prefix}-{variant}` (no suffix) | `backgroundColor` | Root element |
| `--{prefix}-{variant}-foreground` | `color` | Text element |
| `--{prefix}-{variant}-hover` | Skip (state-dependent) | — |
| `--{prefix}-{variant}-active` | Skip (state-dependent) | — |
| `--{prefix}-spacing-height-{size}` | `height` | Root element (active size) |
| `--{prefix}-spacing-padding-horizontal` | `paddingLeft` | Root element |
| `--{prefix}-spacing-gap` | `gap` | Root element |
| `--{prefix}-spacing-border-radius` | `borderRadius` | Root element |
| `--{prefix}-spacing-icon-size` | `width`, `height` | Icon element |
| `--{prefix}-typography-font-family` | `fontFamily` | Root element |
| `--{prefix}-typography-font-size` | `fontSize` | Root element |
| `--{prefix}-typography-font-weight` | `fontWeight` | Root element |
| `--{prefix}-typography-line-height` | `lineHeight` | Root element |
| `--{prefix}-typography-letter-spacing` | `letterSpacing` | Root element |

A new component type needs only a `semantic.css` and a Storybook story — no gate configuration.

**Fixed layout checks** (not convention-derived):
- Vertical alignment: text center within 2px of container center
- Icon position: for components with icon slots in default type, icon trailing edge within 2px of expected position
- Icon-only aspect ratio: for icon-only variants, button width must equal button height (square)

**Comparison rules:**
- Colors: normalized to RGB, exact match, tolerance of rgb +/-2 per channel for rounding
- Dimensions: normalized to px, exact match, tolerance of +/-1px for subpixel rounding
- Font family: string-contains check (computed style returns full font stack)
- Font weight: numeric comparison
- Vertical alignment: text center within 2px of container center

**Pass condition:** Zero mismatches with severity `"error"`.

### 3. Gate 2 — Token delta

Compare token values between the variant manifest and the current token source:

- Read token bindings from the variant manifest
- Read current token values from the resolved token source (DTCG JSON)
- Count mismatches
- **Pass condition**: `tokenDelta == 0` (hard zero, no override)

### 4. Export Figma reference screenshot

Call Figma MCP to export the component's primary variant as PNG. Save to `.d2c/diff-results/{component}/figma-reference.png`. This is included in the report for human review — it is not an automated gate.

### 5. Evaluate gates

Both gates must pass for the component to advance:

```
passed = gate1.passed AND gate2.passed
```

Write the result to `.d2c/diff-results/{component}-latest.json` per the `diff-result.ts` schema.

### 6. Cleanup

If the validate phase started Storybook in step 1, kill the spawned process. Do not kill a pre-existing Storybook instance.

### 7. Update status registry

- If both gates pass: set status to `"validate"`
- If any gate fails: set status to `"blocked"` with `blockedReason` listing which gate failed and the specific mismatches

## Output artifacts

| Artifact | Location | Schema |
|---|---|---|
| Figma reference | `.d2c/diff-results/{component}/figma-reference.png` | — |
| Diff result | `.d2c/diff-results/{component}-latest.json` | `diff-result.ts` |
| Status registry | `.d2c/status-registry.json` | `status-registry.ts` |

## Failure modes

- **Storybook fails to start**: Error after 60s timeout. Provide the `STORYBOOK_URL` value being used and suggest running `npm run storybook` manually.
- **Playwright MCP not connected**: Cannot extract computed CSS. Error with install instructions.
- **Font not loaded**: Structural gate will catch this — fontFamily mismatch. Note in report: "Font not loaded — check @font-face or font import."
- **Token source missing**: Error — run build phase to resolve token source first.

# Validate Phase Redesign

## Problem

The validate phase as originally implemented does not perform real visual comparison between the Figma design and the rendered component. The pixel diff gate compared Storybook screenshots against previous Storybook screenshots (self-referencing baseline), auto-passing on first run. The token delta gate compared manifest values against DTCG source values on paper, without verifying that the CSS actually applies those values in the browser.

This allowed a Carbon Button with broken vertical text alignment and incorrect font weight to pass all three gates.

## Solution

Replace the three-gate system (pixel diff, region diff, token delta) with two deterministic gates plus a reference screenshot:

1. **Structural gate** — Playwright loads the rendered Storybook story, extracts computed CSS properties via `page.evaluate()`, compares each value against the corresponding manifest token. Zero tolerance. Deterministic pass/fail.

2. **Token delta gate** — Manifest token values compared against DTCG source file. Zero tolerance. Unchanged from original.

3. **Figma reference screenshot** — Figma frame export saved to the diff report for human review. Not an automated gate.

## Structural Gate

### What gets compared

Playwright navigates to the Storybook story URL, waits for the component to render, then runs `page.evaluate()` to extract computed styles from the rendered component element.

| Category | Extraction method | Compared against |
|---|---|---|
| Background color | `getComputedStyle(el).backgroundColor` | `tokens.color.button.primary.background` |
| Text color | `getComputedStyle(el).color` | `tokens.color.text.on-color` |
| Font family | `getComputedStyle(el).fontFamily` | `tokens.typography.button.font-family` |
| Font size | `getComputedStyle(el).fontSize` | `tokens.typography.button.font-size` |
| Font weight | `getComputedStyle(el).fontWeight` | Figma extraction (400 = Regular) |
| Line height | `getComputedStyle(el).lineHeight` | `tokens.typography.button.line-height` |
| Letter spacing | `getComputedStyle(el).letterSpacing` | `tokens.typography.button.letter-spacing` |
| Padding left | `getComputedStyle(el).paddingLeft` | `tokens.spacing.button.padding.left` |
| Padding right | `getComputedStyle(el).paddingRight` | `tokens.spacing.button.padding.right` |
| Height | `el.offsetHeight` | `tokens.spacing.button.height.{size}` |
| Vertical text alignment | Text element `offsetTop` relative to button center | Figma layout (centered or top-aligned per size) |

### Comparison rules

- **Colors**: Normalized to RGB. Exact match required. `rgb(15, 98, 254)` is the only valid match for `#0f62fe`. Tolerance: `rgb ±2` per channel for rounding only.
- **Dimensions**: Normalized to px. Exact match required. Tolerance: `±1px` for subpixel rounding only.
- **Font family**: String contains check — `getComputedStyle` returns a font stack, so `"IBM Plex Sans"` must appear in the returned value.
- **Font weight**: Numeric comparison — `400` must equal `400`.
- **Vertical alignment**: Text element center must be within 2px of button center for sizes that specify centered alignment.

### Output format

```json
{
  "gate": "structural",
  "passed": false,
  "mismatches": [
    {
      "property": "fontFamily",
      "expected": "IBM Plex Sans",
      "actual": "Times New Roman",
      "severity": "error",
      "note": "Font not loaded — check @font-face or font import"
    },
    {
      "property": "verticalAlignment",
      "expected": "centered (offsetTop within 2px of center)",
      "actual": "top-aligned (12px off center)",
      "severity": "error"
    }
  ]
}
```

The structural gate passes only if zero `error` severity mismatches exist.

## Token Delta Gate

Unchanged from original design. Manifest token values compared against DTCG source file. Zero tolerance (`--diff-threshold-token` = 0, no override). Deterministic.

## Figma Reference Screenshot

The Figma frame is exported via Figma MCP `get_screenshot` and saved to `.d2c/diff-results/{component}/figma-reference.png`. This is included in the diff report for human review but is not an automated gate. No pixel comparison, no thresholds.

## Storybook Auto-Start

The validate phase manages its own Storybook dependency:

1. Check if Storybook is already running at `STORYBOOK_URL` (default `http://localhost:6006`) via HTTP fetch
2. If not running, spawn `npm run storybook` as a detached child process
3. Poll the URL every 2 seconds, timeout after 60 seconds
4. If timeout, fail with error: "Storybook failed to start. Check `npm run storybook` manually."
5. After validation completes (pass or fail), kill the spawned process only if the validate phase started it. Do not kill a pre-existing Storybook instance.

## What Gets Removed

- `--diff-threshold-pixel` flag, default value, and threshold constant
- `--diff-threshold-region` flag, default value, and threshold constant
- Pixel diff gate from `diff-result.ts` schema
- Region diff gate from `diff-result.ts` schema
- Three-threshold diff strategy from `mcps/playwright.md`
- Self-referencing baseline system (`.d2c/diff-baseline/` directory is no longer used by validate)

## What Gets Added

- Structural gate definition in `phases/validate.md`
- Structural result shape in `diff-result.ts` schema (property comparison array)
- Storybook auto-start logic in `phases/validate.md`
- Storybook health check (HTTP fetch before proceeding)

## What Stays

- `--diff-threshold-token` flag (hard zero, no override)
- `--viewport` flag (Playwright viewport for consistent rendering)
- Token delta gate (unchanged)
- Figma screenshot export (repurposed as reference, not a gate)

## Updated diff-result.ts Schema

```typescript
interface DiffResult {
  component: string;
  viewport: string;
  passed: boolean;
  gates: {
    structural: StructuralGateResult;
    token: TokenGateResult;
  };
  figmaReference: string; // path to saved Figma screenshot
  storybook: {
    autoStarted: boolean;
    url: string;
  };
  generatedAt: string;
}

interface StructuralGateResult {
  passed: boolean;
  mismatches: StructuralMismatch[];
}

interface StructuralMismatch {
  property: string;
  expected: string;
  actual: string;
  severity: "error";
  note?: string;
}

interface TokenGateResult {
  threshold: 0;
  actual: number;
  unit: "count";
  passed: boolean;
  details?: string;
}
```

## Status Rollback

Button's current `alpha` status is invalid — it was promoted based on a validate phase that didn't catch real visual issues. Roll back:

- Set Button status to `build` in `status-registry.json`
- Add history entry: `alpha → build`, reason: "Rolled back — validate phase redesigned. Previous validation did not perform real Figma-vs-rendered comparison."
- The validate and ship transitions remain in history as a record of what happened

## Updated Gate Summary

```
Gate 1: Structural — computed CSS vs manifest tokens (deterministic, zero tolerance)
Gate 2: Token delta — manifest vs DTCG source (deterministic, hard zero)

Reference: Figma screenshot saved for human review (not a gate)

passed = gate1.passed AND gate2.passed
```

## Files Affected

- `phases/validate.md` — rewrite gate definitions
- `schemas/diff-result.ts` — new schema shape
- `config/defaults.ts` — remove pixel/region defaults
- `config/thresholds.ts` — remove pixel/region constants
- `SKILL.md` — remove pixel/region flags from table
- `README.md` — remove three-threshold diff references, update design decisions section
- `mcps/playwright.md` — rewrite diff strategy section for structural comparison
- `.d2c/status-registry.json` — roll back Button status
- `.d2c/diff-results/button-latest.json` — regenerated after re-validation

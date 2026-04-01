---
mcp: playwright
description: Playwright MCP patterns for visual diff with three-threshold strategy
compatibility: [claude-code, cursor, codex-cli]
---

# Playwright MCP

The visual truth layer for d2c. Captures screenshots of rendered Storybook stories at a locked viewport, diffs against Figma frame exports and established baselines, and enforces a three-threshold gate strategy.

## Browser configuration

- **Browser**: Chromium (required — consistent rendering across environments)
- **Mode**: Headless
- **Viewport**: Locked at 1440x900 by default (configurable via `--viewport`)
- Viewport is locked — stories that set their own viewport are overridden to ensure consistent diffing

## Viewport configuration

The viewport is locked for all captures to ensure pixel-perfect comparison:

```
Default: 1440x900
Flag: --viewport (format: WIDTHxHEIGHT)
```

The viewport must be identical between baseline capture and comparison capture. If the viewport changes between runs, baselines must be re-established.

## Screenshot capture pattern

For each story variant of a component:

```
1. Navigate to the Storybook story URL: {STORYBOOK_URL}/iframe.html?id={storyId}
2. Wait for the component to render (network idle + DOM stable)
3. Set viewport to the configured size
4. Capture full-page screenshot as PNG
5. Save to the appropriate directory:
   - Baseline: .d2c/diff-baseline/{component}/{variant}.png
   - Current: .d2c/diff-results/{component}/current/{variant}.png
   - Diff: .d2c/diff-results/{component}/diff/{variant}.png
```

## Three-threshold diff strategy

d2c uses three independent thresholds, not one. Each catches a different failure mode:

### Threshold 1: Pixel percentage (`--diff-threshold-pixel`)

- **Default**: 0.1 (0.1% of total pixels)
- **Unit**: % (percentage of total pixels changed)
- **What it catches**: Global visual changes — color shifts, font changes, layout reflows
- **Limitation**: A 2% delta on a full-bleed component (thousands of pixels) is very different from 2% on a 24×24 icon (eleven pixels). Percentage alone cannot distinguish these cases.

### Threshold 2: Region area (`--diff-threshold-region`)

- **Default**: 15 (15 px²)
- **Unit**: px² (area of the largest contiguous changed region)
- **What it catches**: Localized regressions — a corner radius change, a border width change, a shadow offset shift
- **Why it exists**: A change that affects 0.05% of total pixels can still be a significant regression if those pixels form a visible cluster. The region threshold catches the "one corner changed" case that percentage misses.

### Threshold 3: Token delta (`--diff-threshold-token`)

- **Default**: 0 (hard zero — no override allowed)
- **Unit**: count (number of token value mismatches)
- **What it catches**: Token drift — the component uses a different value than what the design spec defines
- **Why hard zero**: A token mismatch means the component is visually incorrect by definition. Even if the rendered output looks similar, using the wrong token means the component will break when the token value changes. There is no acceptable level of token drift.

## Gate evaluation

```
passed = (pixelDelta <= threshold_pixel)
     AND (regionDelta <= threshold_region)
     AND (tokenDelta <= threshold_token)
```

All three must pass. A component cannot advance past validate if any gate fails.

## Baseline management

**First run (no baseline exists):**
- Current screenshots become the baseline
- All gates pass automatically (no diff to compute)
- Message: "Baseline established for {component}. Re-run validate to diff against this baseline."

**Subsequent runs:**
- Diff current against baseline
- Compute pixel delta, region delta, token delta
- Generate diff images highlighting changed areas

**Baseline update:**
- Baselines are updated when a component passes validate and advances through ship
- After a successful ship, current screenshots replace the baseline
- Manual baseline reset: delete `.d2c/diff-baseline/{component}/` and re-run validate

## Diff image generation

When any pixel delta is detected:
- Generate a diff image highlighting changed pixels in red
- Save to `.d2c/diff-results/{component}/diff/{variant}.png`
- The diff image is referenced in the `DiffResult.screenshots.diff` field

## Output schema

All diff results conform to the `diff-result.ts` schema:

```typescript
{
  component: string,
  generatedAt: string,        // ISO 8601
  viewport: "1440x900",
  passed: boolean,
  gates: {
    pixel: { name: "pixel", threshold: 0.1, actual: number, passed: boolean, unit: "%" },
    region: { name: "region", threshold: 15, actual: number, passed: boolean, unit: "px²" },
    token: { name: "token", threshold: 0, actual: number, passed: boolean, unit: "count" }
  },
  screenshots: {
    baseline: string,
    current: string,
    diff?: string
  }
}
```

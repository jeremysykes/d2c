# Validate Phase Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the pixel/region diff gates with a deterministic structural comparison gate that extracts computed CSS from the rendered Storybook story and compares against manifest token values.

**Architecture:** The validate phase gets two deterministic gates: (1) structural — Playwright extracts computed CSS via `page.evaluate()` and compares against manifest tokens, (2) token delta — manifest vs DTCG source (unchanged). Pixel/region thresholds are removed from the entire codebase. Storybook is auto-started if not running. Button status is rolled back from `alpha` to `build`.

**Tech Stack:** TypeScript (strict, ESM), Vitest, Playwright MCP, Figma MCP

**Spec:** `specs/validate-phase-redesign.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `.claude/skills/d2c/schemas/diff-result.ts` | Rewrite | New schema: StructuralGateResult, StructuralMismatch, TokenGateResult |
| `.claude/skills/d2c/config/defaults.ts` | Modify | Remove `diffThresholdPixel`, `diffThresholdRegion` |
| `.claude/skills/d2c/config/thresholds.ts` | Rewrite | Remove pixel/region constants, keep token only |
| `.claude/skills/d2c/phases/validate.md` | Rewrite | Structural gate, Storybook auto-start, no pixel/region |
| `.claude/skills/d2c/mcps/playwright.md` | Rewrite | Structural comparison via evaluate(), no three-threshold |
| `.claude/skills/d2c/SKILL.md` | Modify | Remove pixel/region flags from table |
| `README.md` | Modify | Update design decisions section, "What to look for", "What's next" |
| `.d2c/status-registry.json` | Modify | Roll back Button from `alpha` to `build` |
| `.d2c/diff-results/button-latest.json` | Delete | Invalid result from old validate |
| `tests/phase-1-schemas.test.ts` | Modify | Update diff-result.ts tests for new schema |
| `tests/phase-4-config.test.ts` | Modify | Remove pixel/region threshold tests, update defaults tests |

---

### Task 1: Update diff-result.ts schema

**Files:**
- Modify: `.claude/skills/d2c/schemas/diff-result.ts`
- Modify: `tests/phase-1-schemas.test.ts:148-179`

- [ ] **Step 1: Write the failing tests**

Replace the diff-result.ts test block in `tests/phase-1-schemas.test.ts` lines 148-179 with:

```typescript
// --- diff-result.ts ---

describe("diff-result.ts", () => {
  it("exports DiffResult interface", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+DiffResult/);
  });

  it("exports StructuralGateResult", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+StructuralGateResult/);
  });

  it("exports StructuralMismatch", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+StructuralMismatch/);
  });

  it("exports TokenGateResult", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+TokenGateResult/);
  });

  it("exports isDiffResult type guard", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/export\s+function\s+isDiffResult/);
  });

  it("has structural and token gates, not pixel or region", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toContain("structural");
    expect(content).toContain("token");
    expect(content).not.toMatch(/gates\s*:\s*\{[^}]*pixel/s);
    expect(content).not.toMatch(/gates\s*:\s*\{[^}]*region/s);
  });

  it("StructuralMismatch has property, expected, actual, severity", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/property:\s*string/);
    expect(content).toMatch(/expected:\s*string/);
    expect(content).toMatch(/actual:\s*string/);
    expect(content).toMatch(/severity:\s*"error"/);
  });

  it("DiffResult has figmaReference field", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/figmaReference:\s*string/);
  });

  it("DiffResult has storybook field with autoStarted boolean", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/autoStarted:\s*boolean/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/phase-1-schemas.test.ts`
Expected: FAIL — `StructuralGateResult`, `StructuralMismatch`, `TokenGateResult` don't exist, `pixel`/`region` still present.

- [ ] **Step 3: Rewrite diff-result.ts**

Replace the entire contents of `.claude/skills/d2c/schemas/diff-result.ts` with:

```typescript
export interface DiffResult {
  component: string;
  viewport: string;
  passed: boolean;
  gates: {
    structural: StructuralGateResult;
    token: TokenGateResult;
  };
  figmaReference: string;
  storybook: {
    autoStarted: boolean;
    url: string;
  };
  generatedAt: string;
}

export interface StructuralGateResult {
  passed: boolean;
  mismatches: StructuralMismatch[];
}

export interface StructuralMismatch {
  property: string;
  expected: string;
  actual: string;
  severity: "error";
  note?: string;
}

export interface TokenGateResult {
  threshold: 0;
  actual: number;
  unit: "count";
  passed: boolean;
  details?: string;
}

export function isDiffResult(
  value: unknown
): value is DiffResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.component === "string" &&
    typeof v.viewport === "string" &&
    typeof v.passed === "boolean" &&
    typeof v.gates === "object" &&
    v.gates !== null &&
    typeof v.figmaReference === "string" &&
    typeof v.storybook === "object" &&
    v.storybook !== null &&
    typeof v.generatedAt === "string"
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/phase-1-schemas.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/d2c/schemas/diff-result.ts tests/phase-1-schemas.test.ts
git commit -m "feat: replace pixel/region gates with structural gate in diff-result schema"
```

---

### Task 2: Update config — remove pixel/region defaults and thresholds

**Files:**
- Modify: `.claude/skills/d2c/config/defaults.ts`
- Modify: `.claude/skills/d2c/config/thresholds.ts`
- Modify: `tests/phase-4-config.test.ts`

- [ ] **Step 1: Update tests for defaults.ts**

In `tests/phase-4-config.test.ts`, add two new tests inside the `describe("defaults.ts")` block:

```typescript
  it("does not have diffThresholdPixel", () => {
    const content = readFile("defaults.ts");
    expect(content).not.toMatch(/diffThresholdPixel/);
  });

  it("does not have diffThresholdRegion", () => {
    const content = readFile("defaults.ts");
    expect(content).not.toMatch(/diffThresholdRegion/);
  });
```

- [ ] **Step 2: Update tests for thresholds.ts**

Replace the `describe("thresholds.ts")` block in `tests/phase-4-config.test.ts` (lines 83-117) with:

```typescript
describe("thresholds.ts", () => {
  it("exports token threshold of 0", () => {
    const content = readFile("thresholds.ts");
    expect(content).toMatch(/token/i);
    expect(content).toMatch(/:\s*0[,;\s\n]|=\s*0[,;\s\n]/);
  });

  it("documents that token threshold cannot be overridden", () => {
    const content = readFile("thresholds.ts");
    expect(content).toMatch(/override|immutable|cannot|hard zero/i);
  });

  it("documents token threshold unit as count", () => {
    const content = readFile("thresholds.ts");
    expect(content).toContain("count");
  });

  it("does not export pixel threshold", () => {
    const content = readFile("thresholds.ts");
    expect(content).not.toMatch(/PIXEL_THRESHOLD/);
  });

  it("does not export region threshold", () => {
    const content = readFile("thresholds.ts");
    expect(content).not.toMatch(/REGION_THRESHOLD/);
  });

  it("does not reference % or px² units", () => {
    const content = readFile("thresholds.ts");
    expect(content).not.toContain('"%"');
    expect(content).not.toContain('"px²"');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/phase-4-config.test.ts`
Expected: FAIL — pixel/region still present in both files.

- [ ] **Step 4: Update defaults.ts**

Replace the entire contents of `.claude/skills/d2c/config/defaults.ts` with:

```typescript
export const D2C_DEFAULTS = {
  truthStructure: "cva" as const,
  truthVisual: "figma" as const,
  truthConflictStrategy: "escalate" as const,
  diffThresholdToken: 0,
  viewport: "1440x900",
  figmaWritePreflight: true,
  framework: "react" as const,
  forceRetire: false,
  runAll: false,
  preflightOnly: false,
  tokenSource: "auto" as const,
  storybookUrl: "http://localhost:6006",
} as const;

export type D2cDefaults = typeof D2C_DEFAULTS;
```

- [ ] **Step 5: Update thresholds.ts**

Replace the entire contents of `.claude/skills/d2c/config/thresholds.ts` with:

```typescript
/**
 * Validate phase threshold constants.
 *
 * The structural gate (computed CSS vs manifest tokens) is deterministic —
 * no configurable threshold. Values either match or they don't.
 *
 * The token delta gate uses a hard-zero threshold that cannot be overridden.
 */

/** Token value mismatches allowed. Unit: count. Hard zero — cannot be overridden. */
export const TOKEN_THRESHOLD_DEFAULT = 0;
export const TOKEN_THRESHOLD_UNIT = "count";

/**
 * Token threshold override flag.
 * This is always false. Even if a user passes --diff-threshold-token with a
 * non-zero value, the effective threshold must remain 0.
 * A token mismatch means the component is visually incorrect by definition.
 */
export const TOKEN_THRESHOLD_OVERRIDE = false;
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/phase-4-config.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/d2c/config/defaults.ts .claude/skills/d2c/config/thresholds.ts tests/phase-4-config.test.ts
git commit -m "feat: remove pixel/region thresholds from config, keep token-only"
```

---

### Task 3: Rewrite validate.md phase doc

**Files:**
- Modify: `.claude/skills/d2c/phases/validate.md`

- [ ] **Step 1: Rewrite validate.md**

Replace the entire contents of `.claude/skills/d2c/phases/validate.md` with:

```markdown
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

Use Playwright MCP to navigate to the Storybook story URL for the primary variant. Extract computed CSS properties via `page.evaluate()` and compare against manifest token values.

**Properties extracted and compared:**

| Property | Extraction | Compared against |
|---|---|---|
| Background color | `getComputedStyle(el).backgroundColor` | Manifest token `color.button.{kind}.background` |
| Text color | `getComputedStyle(el).color` | Manifest token `color.text.on-color` |
| Font family | `getComputedStyle(el).fontFamily` | Manifest token `typography.button.font-family` |
| Font size | `getComputedStyle(el).fontSize` | Manifest token `typography.button.font-size` |
| Font weight | `getComputedStyle(el).fontWeight` | Figma extraction value (400 = Regular) |
| Line height | `getComputedStyle(el).lineHeight` | Manifest token `typography.button.line-height` |
| Letter spacing | `getComputedStyle(el).letterSpacing` | Manifest token `typography.button.letter-spacing` |
| Padding left | `getComputedStyle(el).paddingLeft` | Manifest token `spacing.button.padding.left` |
| Padding right | `getComputedStyle(el).paddingRight` | Manifest token `spacing.button.padding.right` |
| Height | `el.offsetHeight + "px"` | Manifest token `spacing.button.height.{size}` |
| Vertical alignment | Text `offsetTop` vs button center | Figma layout spec (centered ±2px for center-aligned sizes) |

**Comparison rules:**
- Colors: normalized to RGB, exact match, ±2 per channel for rounding
- Dimensions: normalized to px, exact match, ±1px for subpixel rounding
- Font family: string-contains check (computed style returns full font stack)
- Font weight: numeric comparison (400 = 400)
- Vertical alignment: text center within 2px of button center

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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/d2c/phases/validate.md
git commit -m "docs: rewrite validate phase — structural gate replaces pixel/region diff"
```

---

### Task 4: Rewrite playwright.md MCP doc

**Files:**
- Modify: `.claude/skills/d2c/mcps/playwright.md`

- [ ] **Step 1: Rewrite playwright.md**

Replace the entire contents of `.claude/skills/d2c/mcps/playwright.md` with:

```markdown
---
mcp: playwright
description: Playwright MCP patterns for structural comparison and visual reference
compatibility: [claude-code, cursor, codex-cli]
---

# Playwright MCP

The validation layer for d2c. Navigates to rendered Storybook stories, extracts computed CSS properties for deterministic comparison against manifest tokens, and captures reference screenshots.

## Browser configuration

- **Browser**: Chromium (required — consistent rendering across environments)
- **Mode**: Headless
- **Viewport**: Locked at 1440x900 by default (configurable via `--viewport`)

## Structural comparison pattern

The primary validation tool. Playwright loads a Storybook story, then extracts computed CSS to compare against the variant manifest.

### Navigation

```
1. Navigate to: {STORYBOOK_URL}/iframe.html?id={storyId}
2. Wait for network idle + DOM stable
3. Set viewport to configured size (default: 1440x900)
```

### CSS extraction

Use `page.evaluate()` to extract computed styles from the rendered component:

```javascript
const el = document.querySelector('[data-node-id]') || document.querySelector('button');
const styles = getComputedStyle(el);
const textEl = el.querySelector('span') || el;

return {
  backgroundColor: styles.backgroundColor,
  color: styles.color,
  fontFamily: styles.fontFamily,
  fontSize: styles.fontSize,
  fontWeight: styles.fontWeight,
  lineHeight: styles.lineHeight,
  letterSpacing: styles.letterSpacing,
  paddingLeft: styles.paddingLeft,
  paddingRight: styles.paddingRight,
  height: el.offsetHeight + "px",
  textOffsetTop: textEl.offsetTop,
  buttonHeight: el.offsetHeight,
};
```

### Comparison rules

- **Colors**: Normalize hex to RGB. `#0f62fe` becomes `rgb(15, 98, 254)`. Tolerance: ±2 per channel for rounding.
- **Dimensions**: Compare as px numbers. `"16px"` matches `"16px"`. Tolerance: ±1px for subpixel rounding.
- **Font family**: String-contains check. Computed style returns a font stack like `"IBM Plex Sans", sans-serif`. The manifest value `IBM Plex Sans` must appear in the string.
- **Font weight**: Numeric comparison. `"400"` must equal `"400"`.
- **Vertical alignment**: For center-aligned sizes, `|textCenter - buttonCenter| <= 2px`. Where `textCenter = textOffsetTop + textHeight/2` and `buttonCenter = buttonHeight/2`.

### Output

Each comparison produces a `StructuralMismatch` if the values don't match:

```json
{
  "property": "fontFamily",
  "expected": "IBM Plex Sans",
  "actual": "\"Times New Roman\"",
  "severity": "error",
  "note": "Font not loaded — check @font-face import"
}
```

## Figma reference screenshot

Playwright can also capture a screenshot of the rendered story for side-by-side comparison with the Figma frame export. This is saved as reference material for human review — it is not used for automated gating.

```
1. Navigate to story URL
2. Wait for render
3. Capture screenshot
4. Save to .d2c/diff-results/{component}/storybook-screenshot.png
```

## What Playwright does NOT do in d2c

- **No pixel-level image diffing** — cross-renderer comparison (Figma vs browser) is too noisy for deterministic gating
- **No baseline management** — the structural gate compares against manifest values, not previous screenshots
- **No region detection** — contiguous changed pixel analysis was removed; structural comparison is more precise
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/d2c/mcps/playwright.md
git commit -m "docs: rewrite playwright MCP doc — structural comparison, no pixel diff"
```

---

### Task 5: Remove pixel/region flags from SKILL.md

**Files:**
- Modify: `.claude/skills/d2c/SKILL.md:30-31`

- [ ] **Step 1: Remove the two flag rows from the configuration table**

In `.claude/skills/d2c/SKILL.md`, delete these two lines from the configuration flags table:

```
| `--diff-threshold-pixel` | `0.1` | `number` | Max % of changed pixels |
| `--diff-threshold-region` | `15` | `number` | Max contiguous changed region in px² |
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/d2c/SKILL.md
git commit -m "docs: remove pixel/region flags from SKILL.md"
```

---

### Task 6: Update README.md

**Files:**
- Modify: `README.md:193-195` (design decision #2)
- Modify: `README.md:387` ("What to look for")
- Modify: `README.md:449` ("What's next")

- [ ] **Step 1: Replace design decision #2**

Replace the section "### 2. Three diff thresholds, not one" (lines 193-195) with:

```markdown
### 2. Deterministic structural comparison, not pixel diffing

The original validate phase used pixel-level image comparison with configurable thresholds. This failed in practice — cross-renderer differences (Figma vs browser) require loose tolerances that hide real bugs, and same-renderer regression baselines only detect that something changed, not that it's correct. A Carbon Button with broken vertical text alignment and wrong font weight passed all three original gates.

The redesigned validate phase uses deterministic structural comparison: Playwright extracts computed CSS properties from the rendered component and compares them against manifest token values. `fontFamily` is either `"IBM Plex Sans"` or it isn't. `backgroundColor` is either `rgb(15, 98, 254)` or it isn't. No thresholds, no tolerance bands — values match or the gate fails. Token delta remains a separate gate with hard-zero tolerance.
```

- [ ] **Step 2: Update "What to look for" section**

Replace the line at ~387:
```
**The three-threshold diff in step 5** shows why a single percentage is insufficient. Open the diff result and look at `pixelDelta` vs `regionDelta` — they tell different stories about the same diff.
```
with:
```
**The structural comparison in step 5** shows deterministic validation in action. Open the diff result and look at the `structural.mismatches` array — each entry shows a specific CSS property, the expected value from Figma, and the actual rendered value.
```

- [ ] **Step 3: Update "What's next" section**

Replace the line at ~449:
```
**Playwright visual diff execution.** The three-threshold diff strategy is fully specified in `mcps/playwright.md` but not yet wired to live Playwright runs. Baselines and diff results use the schema but are populated by the demo, not by actual screenshot comparison.
```
with:
```
**Playwright structural validation.** The structural comparison gate is specified in `mcps/playwright.md` and `phases/validate.md`. It requires Playwright MCP to extract computed CSS from rendered Storybook stories. The gate definitions are complete; wiring to live Playwright `evaluate()` calls happens when the validate phase runs.
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: update README — structural comparison replaces three-threshold diff"
```

---

### Task 7: Roll back Button status and delete invalid diff result

**Files:**
- Modify: `.d2c/status-registry.json`
- Delete: `.d2c/diff-results/button-latest.json`

- [ ] **Step 1: Update status-registry.json**

In `.d2c/status-registry.json`, change Button's status:

```json
"Button": {
  "status": "build",
  "previousStatus": "alpha",
```

And add a new history entry at the end of the Button history array:

```json
{
  "from": "alpha",
  "to": "build",
  "at": "2026-04-06T00:00:00.000Z",
  "by": "validate-redesign",
  "reason": "Rolled back — validate phase redesigned. Previous validation did not perform real Figma-vs-rendered structural comparison. Pixel/region gates removed."
}
```

- [ ] **Step 2: Delete the invalid diff result**

```bash
rm .d2c/diff-results/button-latest.json
```

- [ ] **Step 3: Commit**

```bash
git add .d2c/status-registry.json
git rm .d2c/diff-results/button-latest.json
git commit -m "fix: roll back Button to build — previous validate was non-deterministic"
```

---

### Task 8: Run full test suite and verify

**Files:** None (verification only)

- [ ] **Step 1: Run full d2c test suite**

Run: `npm run validate`
Expected: ALL PASS (296 tests). If any fail, investigate — the test updates in Tasks 1-2 should cover all schema/config test changes.

- [ ] **Step 2: Verify no stale pixel/region references remain**

Run: `grep -r "diff-threshold-pixel\|diff-threshold-region\|PIXEL_THRESHOLD\|REGION_THRESHOLD\|pixelDelta\|regionDelta" .claude/skills/d2c/ README.md BRIEF.md --include="*.ts" --include="*.md" | grep -v node_modules | grep -v specs/validate-phase-redesign.md`
Expected: No output (the spec file is excluded since it documents the history).

- [ ] **Step 3: Verify diff-result.ts has no pixel/region references**

Run: `grep -c "pixel\|region" .claude/skills/d2c/schemas/diff-result.ts`
Expected: `0`

- [ ] **Step 4: Commit verification results (if any cleanup was needed)**

Only commit if steps 2-3 found stale references that needed cleaning.

---

## Self-Review

**Spec coverage check:**
- Structural gate definition → Task 1 (schema) + Task 3 (validate.md)
- Token delta gate unchanged → Task 1 preserves TokenGateResult
- Figma reference screenshot (not a gate) → Task 3 (validate.md step 4)
- Storybook auto-start → Task 3 (validate.md step 1)
- Remove pixel/region flags → Task 2 (config) + Task 5 (SKILL.md)
- Remove pixel/region from playwright.md → Task 4
- Update README design decisions → Task 6
- Status rollback → Task 7
- Delete invalid diff result → Task 7

**Placeholder scan:** No TBDs, TODOs, or "implement later" found.

**Type consistency:** `StructuralGateResult`, `StructuralMismatch`, `TokenGateResult` — names match between Task 1 (schema), Task 3 (validate.md references), and Task 4 (playwright.md references).

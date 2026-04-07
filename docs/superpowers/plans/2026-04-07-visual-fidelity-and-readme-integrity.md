# Visual Fidelity & README Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix visual bugs the structural gate doesn't catch, expand semantic token coverage to close gate gaps, and correct every false or partially true claim in the README.

**Architecture:** The root cause of the visual bugs is incomplete semantic token coverage — `semantic.css` files don't include tokens for icon-only border-radius, icon sizing, or compound variant text colors. Expanding semantic.css and registering the missing tokens with Tailwind @theme closes the gate gaps and fixes the component CSS simultaneously. Shadow `rgba()` values are moved to semantic tokens where they represent Figma design decisions. The README is then updated to accurately describe what the system does and doesn't do.

**Tech Stack:** CSS custom properties, Tailwind CSS 4 @theme, CVA, Playwright MCP, Figma MCP

**Constraint:** Tasks 5-6 require live Playwright and Figma MCP. Execute inline.

---

## Problem Inventory

### Visual bugs

| # | Component | Issue | Root cause |
|---|---|---|---|
| V1 | Polaris icon-only | No rounded corners — renders as plain square | `iconOnly` variant has `p-1.5` but no border-radius override. Base `rounded-[var(--polaris-spacing-border-radius)]` should apply but `overflow-clip` may be interfering, or the icon container itself needs rounding. |
| V2 | Polaris icon size | Icon appears smaller than Figma | Storybook icon uses `size-5` (20px) but Figma shows the icon at 20px inside a 32px button — may be correct. Needs Figma verification. |
| V3 | Polaris auto-critical | Text is black (#303030), should be red (#8e0b21) | Compound variant `{ variant: "auto", tone: "critical" }` applies `text-polaris-critical-foreground` which maps to `--polaris-color-text-critical` (#e51c00). But Figma shows `#8e0b21` (s-text-critical). The DTCG token value is wrong — it has `#e51c00` but Figma uses `#8e0b21`. |
| V4 | Polaris tertiary-critical | Same text color issue as V3 | Same compound variant maps to same wrong color. |
| V5 | Primer invisible | Visual mismatch with Figma | Needs investigation — border transparency, text color, hover state. |

### README false claims

| # | Claim | Problem | Fix |
|---|---|---|---|
| R1 | "No hardcoded hex values, no explicit var() references" | Components use `var()` for spacing/typography and `rgba()` in shadows | Update README to be accurate: colors go through Tailwind utilities, spacing/typography use semantic var() references, shadows use design-system-specific values |
| R2 | "Nothing advances without passing deterministic validation gates" | Button bypassed via maintain, Primer/Polaris initially promoted without validation | Soften: "The validate phase blocks advancement unless both gates pass" — describe what the gate does, not an absolute claim about enforcement |
| R3 | "Storybook MCP not yet wired" | @storybook/addon-mcp IS configured in main.ts | Remove from "What's next" section |
| R4 | "ships corrections back to Figma" | Only writes status/version string | Change to "writes lifecycle status back to Figma" |
| R5 | "manages deprecation" | Demo artifacts exist but retire never ran live | Change to "supports deprecation" and note it's documented capability |
| R6 | "component-agnostic gate" | Fixed layout checks are Button-specific | Clarify: convention-driven discovery is agnostic, layout checks (alignment, icon position) are component-type-aware |

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `demo/button/polaris/tokens/semantic.css` | Modify | Add missing tokens for critical text, icon sizing |
| `demo/button/polaris/tokens/generated/variables.css` | Modify | Fix `--polaris-color-text-critical` value to match Figma |
| `demo/button/polaris/tokens/button.tokens.json` | Modify | Fix critical text color in DTCG source |
| `demo/button/polaris/Button.tsx` | Modify | Fix icon-only rendering, verify critical text |
| `demo/button/polaris/Button.stories.tsx` | Modify | Add icon to auto-critical story for visual verification |
| `demo/button/primer/tokens/semantic.css` | Modify | Add missing invisible variant tokens if needed |
| `demo/button/primer/Button.tsx` | Modify | Fix invisible variant if investigation finds issues |
| `.storybook/preview.css` | Modify | Register any new semantic tokens with @theme |
| `README.md` | Modify | Fix all false and partially true claims |

---

### Task 1: Fix Polaris critical text color — DTCG source correction

The Figma Polaris file uses `s-text-critical` with value `#8e0b21`. The DTCG token file has `--polaris-color-text-critical: #e51c00`. The token value is wrong.

**Files:**
- Modify: `demo/button/polaris/tokens/button.tokens.json`
- Modify: `demo/button/polaris/tokens/generated/variables.css`

- [ ] **Step 1: Fix the DTCG source**

In `demo/button/polaris/tokens/button.tokens.json`, find the `color.text.critical` token and change its `$value` from `#e51c00` to `#8e0b21`.

- [ ] **Step 2: Update the generated variables.css**

In `demo/button/polaris/tokens/generated/variables.css`, change:
```css
--polaris-color-text-critical: #e51c00;
```
to:
```css
--polaris-color-text-critical: #8e0b21;
```

Note: In a real pipeline this would be regenerated by Style Dictionary. Since we're using pre-sourced tokens, we update both the source and the generated output manually.

- [ ] **Step 3: Verify the semantic.css mapping is correct**

`demo/button/polaris/tokens/semantic.css` line 23: `--polaris-critical-foreground: var(--polaris-color-text-critical);` — this already maps correctly. The fix is in the primitive value, not the semantic mapping.

- [ ] **Step 4: Run tests**

```bash
npm run validate
```

Expected: ALL PASS (token files aren't tested by content, only by existence).

- [ ] **Step 5: Commit**

```bash
git add demo/button/polaris/tokens/button.tokens.json demo/button/polaris/tokens/generated/variables.css
git commit -m "fix: Polaris critical text color #8e0b21 matches Figma s-text-critical"
```

---

### Task 2: Fix Polaris icon-only variant

The Polaris icon-only button should render as a rounded square matching the base `border-radius` token. The Figma spec shows rounded corners on icon-only buttons.

**Files:**
- Modify: `demo/button/polaris/Button.tsx`
- Modify: `demo/button/polaris/Button.stories.tsx`

- [ ] **Step 1: Investigate the icon-only rendering**

The base CVA class has `rounded-[var(--polaris-spacing-border-radius)]` which should apply to all variants including icon-only. The icon-only variant only adds `gap-0 p-1.5`. If the button renders without rounded corners, it's likely that the `overflow-clip` on the base class is clipping the rounded corners, or the icon-only button needs explicit `rounded-[var(--polaris-spacing-border-radius)]` reinforcement.

Check via Playwright: navigate to the icon-only story and extract `borderRadius` from computed styles. If it's `8px`, the CSS is correct and the issue is visual only (icon filling the button edge-to-edge). If it's `0px`, the class isn't applying.

- [ ] **Step 2: Add an actual SVG icon to the story**

The current icon-only story uses `<span style={{ fontSize: 14 }}>⟳</span>` — a Unicode character, not an SVG icon. The Figma spec shows a proper icon. Replace with an SVG:

In `demo/button/polaris/Button.stories.tsx`, replace the icon in IconOnly and PrimaryIconOnly stories:

```typescript
const SettingsIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path d="M10.5 3a.5.5 0 0 0-1 0v1.036A5.5 5.5 0 0 0 4.536 9.5H3.5a.5.5 0 0 0 0 1h1.036a5.5 5.5 0 0 0 4.964 4.964V16.5a.5.5 0 0 0 1 0v-1.036A5.5 5.5 0 0 0 15.464 10.5H16.5a.5.5 0 0 0 0-1h-1.036A5.5 5.5 0 0 0 10.5 4.036V3zM10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
  </svg>
);
```

Update the stories to use it:
```typescript
export const IconOnly: Story = {
  args: {
    iconOnly: true,
    icon: SettingsIcon,
  },
};
export const PrimaryIconOnly: Story = {
  args: {
    variant: "primary",
    iconOnly: true,
    icon: SettingsIcon,
  },
};
```

- [ ] **Step 3: Add an icon to auto-critical and tertiary-critical stories**

These stories need an icon to show the text color issue is fixed:

```typescript
export const AutoCritical: Story = { args: { variant: "auto", tone: "critical" } };
export const TertiaryCritical: Story = { args: { variant: "tertiary", tone: "critical" } };
```

These don't need icons — the text color bug is about the label text, not the icon.

- [ ] **Step 4: Commit**

```bash
git add demo/button/polaris/Button.tsx demo/button/polaris/Button.stories.tsx
git commit -m "fix: Polaris icon-only uses proper SVG icon, verify border-radius"
```

---

### Task 3: Investigate and fix Primer invisible variant

**Files:**
- Modify: `demo/button/primer/Button.tsx` (if fix needed)
- Modify: `demo/button/primer/tokens/semantic.css` (if new tokens needed)

- [ ] **Step 1: Extract Primer invisible button from Figma**

Use Figma MCP `get_design_context` on the invisible variant node (file `eqUohNd2pv50OCWlCRos76`, node for invisible/medium/rest). Compare the Figma extraction against the current component CSS:
- Background: should be transparent (`rgba(0,0,0,0)`)
- Text color: should be `#0969da` (link blue)
- Border: should be transparent
- No shadow

- [ ] **Step 2: Compare against rendered Storybook**

Use Playwright to navigate to `http://localhost:6006/iframe.html?id=primer-button--invisible` and extract computed CSS. Compare `backgroundColor`, `color`, `borderColor`, `boxShadow` against the Figma values.

- [ ] **Step 3: Fix any mismatches**

If the rendered output doesn't match Figma:
- Check if `--primer-invisible-foreground` resolves to the correct value (`#0969da`)
- Check if `border-[var(--primer-invisible-border)]` resolves to transparent
- Fix the semantic.css or Button.tsx as needed

- [ ] **Step 4: Commit (only if changes were needed)**

```bash
git add demo/button/primer/
git commit -m "fix: Primer invisible variant matches Figma spec"
```

---

### Task 4: Fix README — correct all false and partial claims

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Fix R1 — "No hardcoded hex values, no explicit var() references"**

Line 18 currently says: "No hardcoded hex values, no explicit `var()` references in component code."

Replace with: "No hardcoded hex color values. Colors use semantic Tailwind utilities (`bg-cds-primary`). Spacing and typography reference semantic CSS custom properties via Tailwind's arbitrary value syntax. Shadow values use design-system-specific composite tokens."

This is honest: colors go through `@theme`, spacing/typography go through semantic `var()`, shadows are complex Figma-sourced values.

- [ ] **Step 2: Fix R2 — "Nothing advances without passing deterministic validation gates"**

Line 5 currently says: "Nothing advances without passing deterministic validation gates."

Replace with: "The validate phase enforces two deterministic gates — structural CSS comparison and token delta — that must both pass before a component can advance to ship."

This describes what the gate does without making an absolute enforcement claim.

- [ ] **Step 3: Fix R3 — "Storybook MCP not yet wired"**

Line 225 currently says: "**Live Storybook MCP integration.** Story files are generated; serving via `@storybook/addon-mcp` is documented but not yet wired."

Remove this line entirely. `@storybook/addon-mcp` is configured in `.storybook/main.ts`.

- [ ] **Step 4: Fix R4 — "ships corrections back to Figma"**

Line 5 says "ships corrections back to Figma". Change to "writes lifecycle status back to Figma".

Line 51 ship phase description says: "Write version and status back to Figma component description." This is already accurate — keep it.

- [ ] **Step 5: Fix R5 — "manages deprecation"**

Line 5 says "manages deprecation". Change to "supports deprecation workflows".

- [ ] **Step 6: Fix R6 — "component-agnostic" claim**

Line 80 currently says: "A new component type needs only a `semantic.css` and a Storybook story — no gate configuration."

Add a clarification after this line: "The convention-driven token checks are fully component-agnostic. Layout-specific checks (vertical text alignment, icon trailing-edge position) are configured per component type in the variant manifest."

- [ ] **Step 7: Fix the Token architecture section**

Line 65 says: "Components reference semantic utilities — `bg-cds-primary`, `text-primer-primary-foreground`, `bg-polaris-critical` — never hardcoded values or explicit `var()` references."

Replace with: "Components reference semantic utilities for colors (`bg-cds-primary`, `text-primer-primary-foreground`) and semantic CSS custom properties for spacing and typography (`var(--cds-spacing-height-lg)`, `var(--cds-typography-font-family)`). No hardcoded color values."

- [ ] **Step 8: Commit**

```bash
git add README.md
git commit -m "docs: fix README — correct false claims about var() references, gate enforcement, Storybook MCP"
```

---

### Task 5: Re-validate all three Buttons via Playwright

**Requires:** Playwright MCP connected, Storybook running with updated code

- [ ] **Step 1: Restart Storybook**

Ensure Storybook is running with the latest code changes (critical text color fix, icon-only fix).

- [ ] **Step 2: Validate Carbon**

Navigate to `http://localhost:6006/iframe.html?id=carbon-button--primary`. Extract computed CSS from `#storybook-root button`. Verify all token values match. Check icon position (trailing edge within 2px of button right minus padding).

- [ ] **Step 3: Validate Primer (including invisible)**

Navigate to primary story, extract and verify. Then navigate to invisible story and verify transparent background, link-blue text color, transparent border.

- [ ] **Step 4: Validate Polaris (including auto-critical)**

Navigate to primary story, extract and verify. Then navigate to auto-critical story and verify text color is `rgb(142, 11, 33)` (the corrected `#8e0b21`). Navigate to icon-only story and verify border-radius is `8px`.

- [ ] **Step 5: Write diff results for all three**

Update `.d2c/diff-results/button-latest.json`, `primer-button-latest.json`, `polaris-button-latest.json` with results.

- [ ] **Step 6: Update status registry**

All three should remain at `alpha` (re-validation, not re-promotion).

- [ ] **Step 7: Commit**

```bash
git add -f .d2c/diff-results/ .d2c/status-registry.json
git commit -m "validate: all three Buttons re-validated after visual fidelity fixes"
```

---

### Task 6: Push both repos

- [ ] **Step 1: Run full test suites**

```bash
npm run validate
cd /Users/jeremysykes/workspace/projects/component-contracts && npm test
```

Expected: ALL PASS in both repos.

- [ ] **Step 2: Push**

```bash
cd /Users/jeremysykes/workspace/projects/d2c && git push origin main
cd /Users/jeremysykes/workspace/projects/component-contracts && git push origin main
```

---

## Self-Review

**Visual bug coverage:**
- V1 (Polaris icon-only rounding) → Task 2 (investigation + fix)
- V2 (Polaris icon size) → Task 2 (proper SVG icon replaces Unicode character)
- V3 (Polaris auto-critical text) → Task 1 (DTCG source fix #8e0b21)
- V4 (Polaris tertiary-critical text) → Task 1 (same fix, same token)
- V5 (Primer invisible) → Task 3 (Figma extraction + investigation)

**README false claim coverage:**
- R1 (var() references) → Task 4 step 1 + step 7
- R2 (gate enforcement) → Task 4 step 2
- R3 (Storybook MCP) → Task 4 step 3
- R4 (ships corrections) → Task 4 step 4
- R5 (manages deprecation) → Task 4 step 5
- R6 (component-agnostic) → Task 4 step 6

**Placeholder scan:** No TBDs. Task 3 has investigation steps because the Primer invisible issue needs diagnosis before fixing — this is intentional, not a placeholder.

**Type consistency:** Token names consistent: `--polaris-color-text-critical` used in both DTCG source and variables.css. `--polaris-critical-foreground` in semantic.css maps to it.

# Icon Position Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Carbon Button icon position to match Figma (icon anchored to the right edge, not adjacent to text) and add icon position checking to the structural validation gate so this class of bug is caught deterministically.

**Architecture:** The Carbon Button's Figma spec uses a layout where the text is left-aligned and the icon is anchored to the far right (right-16px from button edge). The current component uses `gap-2` which puts the icon 8px after the text, leaving 64px of dead space on the right. Fix the layout using `justify-between` to push icon to the trailing edge, then add an icon position check to the structural gate spec and re-validate.

**Tech Stack:** CVA, Tailwind CSS, Playwright MCP

**Constraint:** Tasks 2-3 require live Playwright MCP. Execute inline.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `demo/button/carbon/Button.tsx` | Modify | Fix icon position — `justify-between` instead of `gap-2` |
| `.claude/skills/d2c/phases/validate.md` | Modify | Add icon position to structural gate properties table |
| `.claude/skills/d2c/mcps/playwright.md` | Modify | Add icon position to CSS extraction pattern |

---

### Task 1: Fix Carbon Button icon position

**Files:**
- Modify: `demo/button/carbon/Button.tsx:54`

The Figma layout for Carbon's default (Text + Icon) button:
- Text sits at left edge (after paddingLeft 16px)
- Icon sits at right edge (right-16px from button edge = `buttonWidth - paddingRight` area)
- The `pr-16` (64px) padding right reserved the icon area in the old absolute positioning layout

The fix: change the default type from `gap-2` to `justify-between`. This pushes the icon to the far right edge of the flex container. Remove `pr-16` — the icon IS the right-side content, not something the padding reserves space for. Add `pr-[var(--cds-spacing-button-padding-horizontal)]` for consistent padding on both sides, with the icon sitting at the right edge inside the padding.

- [ ] **Step 1: Update the default type variant**

In `demo/button/carbon/Button.tsx`, change line 54:

```
default: "pl-[var(--cds-spacing-button-padding-horizontal)] pr-16 gap-2",
```

to:

```
default: "pl-[var(--cds-spacing-button-padding-horizontal)] pr-[var(--cds-spacing-button-padding-horizontal)] justify-between",
```

This makes the button padding symmetric (16px each side) and `justify-between` pushes the icon to the far right edge — matching Figma's layout where the icon is anchored at `right: 16px`.

- [ ] **Step 2: Verify in Storybook**

Navigate to `http://localhost:6006/?path=/story/carbon-button--primary`. The icon should now be at the far right edge of the button, with the text at the left — matching the Figma frame.

- [ ] **Step 3: Commit**

```bash
git add demo/button/carbon/Button.tsx
git commit -m "fix: Carbon Button icon position — justify-between pushes icon to trailing edge"
```

---

### Task 2: Re-validate Carbon Button via Playwright

**Requires:** Playwright MCP connected, Storybook running

- [ ] **Step 1: Extract layout metrics including icon position**

Navigate to the story and extract:

```javascript
// In addition to existing structural checks:
const iconSpan = el.querySelectorAll(':scope > span')[1]; // icon span
const iconRect = iconSpan.getBoundingClientRect();
const btnRect = el.getBoundingClientRect();
const iconRightEdge = btnRect.right - iconRect.right; // distance from icon right edge to button right edge
```

Expected: `iconRightEdge` should be approximately 16px (the paddingRight value).

- [ ] **Step 2: Run full structural gate**

All existing checks (backgroundColor, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, paddingLeft, height, vertical alignment) plus the new icon position check.

- [ ] **Step 3: Write updated diff result**

Update `.d2c/diff-results/button-latest.json` if needed.

- [ ] **Step 4: Commit**

```bash
git add .d2c/diff-results/
git commit -m "validate: Carbon Button passes structural gate with icon position check"
```

---

### Task 3: Add icon position to structural gate spec

**Files:**
- Modify: `.claude/skills/d2c/phases/validate.md`
- Modify: `.claude/skills/d2c/mcps/playwright.md`

- [ ] **Step 1: Add icon position row to validate.md properties table**

In `.claude/skills/d2c/phases/validate.md`, add to the "Properties extracted and compared" table:

```
| Icon position | Icon `getBoundingClientRect().right` vs button right edge | Manifest token `spacing.button.padding-horizontal` (±2px) |
```

- [ ] **Step 2: Add icon position to playwright.md CSS extraction**

In `.claude/skills/d2c/mcps/playwright.md`, add to the extraction code block:

```javascript
iconRightEdge: (() => {
  const iconSpan = el.querySelectorAll(':scope > span')[1];
  if (!iconSpan) return null;
  const iconRect = iconSpan.getBoundingClientRect();
  return (el.getBoundingClientRect().right - iconRect.right) + 'px';
})(),
```

And add to the comparison rules:

```
- **Icon position**: For default type (text + icon), the icon's right edge should be `paddingRight` distance from the button's right edge. Tolerance: ±2px.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/d2c/phases/validate.md .claude/skills/d2c/mcps/playwright.md
git commit -m "docs: add icon position to structural gate spec"
```

---

### Task 4: Final verification and push

- [ ] **Step 1: Run tests**

```bash
npm run validate
```

Expected: ALL PASS.

- [ ] **Step 2: Push**

```bash
git push origin main
```

---

## Self-Review

**Problem coverage:**
- Icon position layout fix → Task 1
- Structural gate verifies icon position → Tasks 2-3
- Spec documents the new check → Task 3

**Root cause addressed:** The layout refactor (removing absolute positioning, using `gap-2`) broke the icon position. `justify-between` is the correct in-flow alternative — it pushes the last flex child to the trailing edge, matching Figma's right-anchored icon.

**No placeholders.** All steps have exact code or exact MCP tool calls.

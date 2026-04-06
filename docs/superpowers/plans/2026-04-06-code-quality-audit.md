# Code Quality Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the gap between the documented architecture and the implementation — connect the token pipeline to the component code, fix layout patterns, load fonts explicitly, update documentation for clarity, and run all three demo components through the full validated pipeline.

**Architecture:** Carbon Button gets the quality fixes first (token refs, layout, font), then re-validates. The pattern is applied to Primer and Polaris during their pipeline runs. Both READMEs are rewritten to lead with value rather than config. component-contracts README is updated for the current schema and tools.

**Tech Stack:** TypeScript (strict, ESM), CVA, Tailwind CSS, CSS custom properties, Google Fonts, Playwright MCP, Figma MCP, Variant Authority MCP

**Spec:** `specs/code-quality-audit.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `demo/button/carbon/Button.tsx` | Rewrite | Token variable refs, horizontal flex layout, font via token |
| `.storybook/preview.css` | Modify | Add Google Fonts import for IBM Plex Sans |
| `demo/button/carbon/Button.stories.tsx` | Modify | Update status parameter after re-validation |
| `/Users/jeremysykes/workspace/projects/component-contracts/README.md` | Rewrite | Current schema, tools, Vue support, value-first structure |
| `README.md` | Rewrite | Value-first structure, technical detail below the fold |
| `demo/button/primer/Button.tsx` | Modify | Token variable refs, font via token variable |
| `demo/button/polaris/Button.tsx` | Modify | Token variable refs, font via token variable |

---

### Task 1: Carbon Button — token variable references

**Files:**
- Modify: `demo/button/carbon/Button.tsx`

- [ ] **Step 1: Replace all hardcoded hex values with CSS custom property references**

Replace the entire `buttonVariants` definition. Every hardcoded color becomes its `--cds-*` variable from `tokens/generated/variables.css`:

```typescript
const buttonVariants = cva(
  [
    "cds-btn inline-flex items-center overflow-clip cursor-pointer border-0",
    "font-[family-name:var(--cds-typography-button-font-family)]",
    "text-[length:var(--cds-typography-button-font-size)]",
    "leading-[var(--cds-typography-button-line-height)]",
    "tracking-[var(--cds-typography-button-letter-spacing)]",
    "font-[number:var(--cds-typography-button-font-weight)]",
  ].join(" "),
  {
    variants: {
      kind: {
        primary:
          "bg-[var(--cds-color-button-primary-background)] text-[var(--cds-color-text-on-color)] hover:bg-[var(--cds-color-button-primary-hover)] active:bg-[var(--cds-color-button-primary-active)]",
        secondary:
          "bg-[var(--cds-color-button-secondary-background)] text-[var(--cds-color-text-on-color)] hover:bg-[var(--cds-color-button-secondary-hover)] active:bg-[var(--cds-color-button-secondary-active)]",
        tertiary:
          "bg-[var(--cds-color-button-tertiary-background)] text-[var(--cds-color-text-interactive)] shadow-[inset_0_0_0_1px_var(--cds-color-border-interactive)] hover:bg-[var(--cds-color-button-tertiary-hover)] hover:text-[var(--cds-color-text-on-color)] hover:shadow-none active:bg-[var(--cds-color-button-tertiary-active)] active:text-[var(--cds-color-text-on-color)] active:shadow-none",
        ghost:
          "bg-transparent text-[var(--cds-color-text-interactive)] hover:bg-[var(--cds-color-button-ghost-hover)] active:bg-[var(--cds-color-button-ghost-active)]",
        "danger-primary":
          "bg-[var(--cds-color-button-danger-background)] text-[var(--cds-color-text-on-color)] hover:bg-[var(--cds-color-button-danger-hover)] active:bg-[var(--cds-color-button-danger-active)]",
        "danger-tertiary":
          "bg-transparent text-[var(--cds-color-button-danger-background)] shadow-[inset_0_0_0_1px_var(--cds-color-button-danger-background)] hover:bg-[var(--cds-color-button-danger-background)] hover:text-[var(--cds-color-text-on-color)] hover:shadow-none active:bg-[var(--cds-color-button-danger-active)] active:text-[var(--cds-color-text-on-color)] active:shadow-none",
        "danger-ghost":
          "bg-transparent text-[var(--cds-color-button-danger-background)] hover:bg-[var(--cds-color-button-ghost-hover)] active:bg-[var(--cds-color-button-ghost-active)]",
      },
      size: {
        xs: "h-[var(--cds-spacing-button-height-sm)] items-center",
        sm: "h-[var(--cds-spacing-button-height-sm)] items-center",
        md: "h-[var(--cds-spacing-button-height-md)] items-center",
        lg: "h-[var(--cds-spacing-button-height-lg)] items-center",
        xl: "h-[var(--cds-spacing-button-height-xl)] items-start pt-4",
        "2xl": "h-[var(--cds-spacing-button-height-2xl)] items-start pt-4",
        expressive: "h-[var(--cds-spacing-button-height-lg)] items-center text-base leading-[22px] tracking-normal",
      },
      type: {
        default: "pl-[var(--cds-spacing-button-padding-horizontal)] pr-16 gap-2",
        "icon-only": "justify-center items-center",
      },
      disabled: {
        true: "bg-[var(--cds-color-button-disabled-background)] text-[var(--cds-color-text-on-color-disabled)] cursor-not-allowed shadow-none hover:bg-[var(--cds-color-button-disabled-background)] active:bg-[var(--cds-color-button-disabled-background)]",
        false: "",
      },
    },
    compoundVariants: [
      { type: "icon-only", size: "xs", className: "size-6" },
      { type: "icon-only", size: "sm", className: "size-8" },
      { type: "icon-only", size: "md", className: "size-10" },
      { type: "icon-only", size: "lg", className: "size-12" },
      { type: "icon-only", size: "xl", className: "size-16" },
      { type: "icon-only", size: "2xl", className: "size-20" },
      { type: "icon-only", size: "expressive", className: "size-12" },
    ],
    defaultVariants: {
      kind: "primary",
      size: "lg",
      type: "default",
      disabled: false,
    },
  }
);
```

Key changes:
- Base class uses token variables for all typography (`font-family`, `font-size`, `line-height`, `letter-spacing`, `font-weight`)
- Every `bg-[#hex]` becomes `bg-[var(--cds-*)]`
- Every `text-[#hex]` becomes `text-[var(--cds-*)]`
- `flex-col` removed from default type — replaced with `gap-2` for horizontal flex
- `justify-center` removed from sizes — no longer needed without `flex-col`
- `relative` removed from base (was only needed for absolute icon positioning)

- [ ] **Step 2: Rewrite the component JSX — remove absolute positioning, remove inline style**

```typescript
export function Button({
  label,
  icon,
  kind,
  size,
  type = "default",
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  const isIconOnly = type === "icon-only";

  return (
    <button
      className={buttonVariants({ kind, size, type, disabled, className })}
      disabled={disabled || undefined}
      {...props}
    >
      {!isIconOnly && (
        <span className="whitespace-nowrap">{label}</span>
      )}
      {icon && (
        <span className="size-[var(--cds-spacing-button-icon-size)] shrink-0 flex items-center justify-center">
          {icon}
        </span>
      )}
    </button>
  );
}
```

Key changes:
- Inline `style={{ fontFamily: ... }}` removed — font-family now in CVA base class via token variable
- Icon no longer uses `absolute right-4 top-1/2 -translate-y-1/2` — it's an in-flow flex child
- Icon uses token variable for size: `size-[var(--cds-spacing-button-icon-size)]`
- No more `z-[1]`, `z-[2]`, `relative` — all layout escape hatches removed

- [ ] **Step 3: Update the JSDoc comment**

Update the comment at the top of the file to reflect the new approach:

```typescript
/**
 * Carbon Button — CVA variants consuming CSS custom properties from the d2c token pipeline.
 *
 * Figma source: component set 1854:1776
 *
 * All color, spacing, and typography values reference CSS custom properties
 * generated by Style Dictionary from DTCG token files. No hardcoded hex values.
 *
 * Layout: horizontal flex with in-flow icon (no absolute positioning).
 * Font: loaded via Google Fonts @import in Storybook preview CSS.
 */
```

- [ ] **Step 4: Commit**

```bash
git add demo/button/carbon/Button.tsx
git commit -m "refactor: Carbon Button — token variable refs, horizontal flex layout, no inline styles"
```

---

### Task 2: Font loading via Storybook preview CSS

**Files:**
- Modify: `.storybook/preview.css`

- [ ] **Step 1: Add Google Fonts imports**

Replace the contents of `.storybook/preview.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;550;600&display=swap');
@import "tailwindcss";
```

This loads IBM Plex Sans (Carbon), Inter (Polaris). Primer uses the system font stack — no import needed.

- [ ] **Step 2: Commit**

```bash
git add .storybook/preview.css
git commit -m "feat: load IBM Plex Sans and Inter via Google Fonts in Storybook"
```

---

### Task 3: Re-validate Carbon Button

**Files:** None (pipeline execution, not code)

- [ ] **Step 1: Run Storybook and verify the button renders correctly**

```bash
npm run storybook
```

Open `http://localhost:6006/?path=/story/carbon-button--primary`. Verify:
- Blue background, white text, "+" icon visible
- Text is vertically centered
- Font is IBM Plex Sans (not system fallback)
- Icon is to the right of text, in flow (not absolutely positioned)

- [ ] **Step 2: Run validate phase**

```
/d2c --component Button --phase validate
```

Expected: structural gate PASS (all 11 CSS properties match manifest tokens). If it fails, read the mismatch report and fix before proceeding.

- [ ] **Step 3: Commit any test updates if needed**

Only if validate phase changes require test file updates.

---

### Task 4: component-contracts README

**Files:**
- Modify: `/Users/jeremysykes/workspace/projects/component-contracts/README.md`

- [ ] **Step 1: Rewrite README.md**

Replace the entire file. Structure:

1. **Title + one-line description** — what this package is
2. **Two-paragraph overview** — Variant Authority (engineering contract), Radix Primitives (accessibility foundation). How they relate to d2c.
3. **Tool surface table** — 5 variant-authority tools + 4 radix-primitives tools, one line each. Remove `deprecate_variant`, rename `validate_props` → `validate_usage`.
4. **Schema section** — show the aligned VariantManifest with all current fields (figmaFileKey, figmaNodeId, slots, tokens, authority, etc.). Show PrimitiveCapability with vuePackage.
5. **Installation** — Claude Code, Cursor, Codex CLI config blocks
6. **Development** — npm scripts, test commands, project structure
7. **Relationship to d2c** — this is the authority layer, d2c is the operator

Remove stale content: old schema fields (status, props, consumers), old tool names, Badge references.

- [ ] **Step 2: Commit**

```bash
cd /Users/jeremysykes/workspace/projects/component-contracts
git add README.md
git commit -m "docs: rewrite README — current schema, tools, value-first structure"
```

---

### Task 5: d2c README rewrite

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Restructure README.md**

Keep all technical content but reorganize:

**Above the fold (first screen):**
1. Title + one-sentence description
2. "The problem it solves" — 3 sentences max (design systems drift, handoffs are one-directional, nobody notices until something breaks)
3. "What d2c is" — 2 sentences (a Claude Code skill, not an app; an instruction layer that coordinates MCP servers across 6 lifecycle phases)
4. Pipeline diagram — `DESIGN → BUILD → VALIDATE → SHIP → MAINTAIN → RETIRE` with one-line descriptions
5. "POC result" — 3 Buttons from 3 design systems validated against Figma with deterministic structural comparison. The validate phase caught a vertical alignment bug that pixel diffing missed.

**Below the fold:**
- Architecture (MCP servers, skill file structure) — existing content, tightened
- Configuration flags — existing table, minus removed pixel/region flags
- Output artifacts — existing content
- Design decisions — updated #2 for structural comparison (already done)
- POC walkthrough — existing "Try it yourself" section
- Requirements — existing content
- What's next — honest gaps, updated

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README — value-first structure, technical detail below the fold"
```

---

### Task 6: Primer Button — token refs + pipeline run

**Files:**
- Modify: `demo/button/primer/Button.tsx`

- [ ] **Step 1: Replace hardcoded hex values with CSS custom property references**

Same pattern as Carbon. Every `bg-[#hex]` becomes `bg-[var(--primer-*)]`. Remove inline `style={{ fontFamily: ... }}` — use token variable in CVA base class. Primer already uses horizontal flex with in-flow icon (no layout fix needed).

Key variable mappings:
- `bg-[#f6f8fa]` → `bg-[var(--primer-color-button-default-background)]`
- `bg-[#1f883d]` → `bg-[var(--primer-color-button-primary-background)]`
- `text-[#25292e]` → `text-[var(--primer-color-text-primary)]`
- `text-white` → `text-[var(--primer-color-text-on-emphasis)]`
- `text-[#cf222e]` → `text-[var(--primer-color-button-danger-foreground)]`
- Font family, size, weight, line-height all via `--primer-typography-button-*` variables

- [ ] **Step 2: Run the full pipeline**

```
/d2c --component PrimerButton --phase design
/d2c --component PrimerButton --phase build
/d2c --component PrimerButton --phase validate
/d2c --component PrimerButton --phase ship
```

Fix any structural gate failures between validate runs.

- [ ] **Step 3: Commit**

```bash
git add demo/button/primer/Button.tsx .d2c/status-registry.json .variant-authority/primer-button.manifest.json
git commit -m "refactor: Primer Button — token variable refs, full pipeline to alpha"
```

---

### Task 7: Polaris Button — token refs + pipeline run

**Files:**
- Modify: `demo/button/polaris/Button.tsx`

- [ ] **Step 1: Replace hardcoded hex values with CSS custom property references**

Same pattern. Key variable mappings:
- `bg-[#303030]` → `bg-[var(--polaris-color-button-primary-background)]`
- `text-[#303030]` → `text-[var(--polaris-color-text-primary)]`
- `text-white` → `text-[var(--polaris-color-text-on-fill)]`
- `bg-[#c70a24]` → `bg-[var(--polaris-color-button-critical-background)]`
- `text-[#8e0b21]` → `text-[var(--polaris-color-text-critical)]`
- Font family, size, weight via `--polaris-typography-button-*` variables
- Remove inline `style={{ fontFamily: ... }}` — use token variable in CVA base class

- [ ] **Step 2: Run the full pipeline**

```
/d2c --component PolarisButton --phase design
/d2c --component PolarisButton --phase build
/d2c --component PolarisButton --phase validate
/d2c --component PolarisButton --phase ship
```

Fix any structural gate failures between validate runs.

- [ ] **Step 3: Commit**

```bash
git add demo/button/polaris/Button.tsx .d2c/status-registry.json .variant-authority/polaris-button.manifest.json
git commit -m "refactor: Polaris Button — token variable refs, full pipeline to alpha"
```

---

### Task 8: Final verification and push

**Files:** None (verification only)

- [ ] **Step 1: Run full d2c test suite**

```bash
npm run validate
```

Expected: ALL PASS.

- [ ] **Step 2: Verify all three Buttons are at alpha**

```bash
node -e "const r = JSON.parse(require('fs').readFileSync('.d2c/status-registry.json','utf-8')); Object.entries(r.components).forEach(([k,v]) => console.log(k, v.status));"
```

Expected:
```
Button alpha
PrimerButton alpha
PolarisButton alpha
```

- [ ] **Step 3: Run component-contracts tests**

```bash
cd /Users/jeremysykes/workspace/projects/component-contracts && npm test
```

Expected: ALL PASS.

- [ ] **Step 4: Push both repos**

```bash
cd /Users/jeremysykes/workspace/projects/d2c && git push origin main
cd /Users/jeremysykes/workspace/projects/component-contracts && git push origin main
```

---

## Self-Review

**Spec coverage:**
- Token pipeline integration → Task 1 (Carbon), Task 6 (Primer), Task 7 (Polaris)
- Layout model fix → Task 1 (remove flex-col, remove absolute positioning)
- Font loading → Task 2 (Google Fonts in preview.css)
- Carbon re-validation → Task 3
- component-contracts README → Task 4
- d2c README → Task 5
- Primer pipeline → Task 6
- Polaris pipeline → Task 7
- Final verification → Task 8

**Placeholder scan:** No TBDs. Task 6 and 7 include specific variable mappings rather than "similar to Task 1."

**Type consistency:** `--cds-*` prefix for Carbon, `--primer-*` for Primer, `--polaris-*` for Polaris — matches the generated variables.css files.

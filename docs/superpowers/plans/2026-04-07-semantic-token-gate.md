# Semantic Token Layer & Component-Agnostic Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a semantic token layer between the Style Dictionary primitives and the component code, then redesign the structural validation gate to discover checks automatically from semantic token naming conventions — making it work for any component type without per-component configuration.

**Architecture:** Each design system gets a `semantic.css` that maps standard token names (prefixed by system) to its system-specific CSS custom properties. Components use Tailwind utilities referencing these semantic tokens. The structural gate reads `semantic.css`, derives CSS property checks from the naming convention, and validates the rendered component against resolved token values.

**Tech Stack:** CSS custom properties, Tailwind CSS 4 `@theme`, CVA, Playwright MCP, Figma MCP, Variant Authority MCP

**Spec:** `specs/semantic-token-gate.md`

**Constraint:** Tasks 7-8 require live MCP interaction (Playwright, Figma). Execute inline, not via subagents.

---

## File Map

### d2c repo

| File | Action |
|---|---|
| `demo/button/carbon/tokens/semantic.css` | Create |
| `demo/button/primer/tokens/semantic.css` | Create |
| `demo/button/polaris/tokens/semantic.css` | Create |
| `demo/button/carbon/Button.tsx` | Rewrite |
| `demo/button/primer/Button.tsx` | Rewrite |
| `demo/button/polaris/Button.tsx` | Rewrite |
| `.storybook/preview.css` | Modify |
| `.claude/skills/d2c/schemas/variant-manifest.ts` | Modify |
| `.claude/skills/d2c/schemas/diff-result.ts` | Modify |
| `.claude/skills/d2c/phases/validate.md` | Rewrite |
| `.claude/skills/d2c/mcps/playwright.md` | Rewrite |
| `tests/phase-1-schemas.test.ts` | Modify |

### component-contracts repo

| File | Action |
|---|---|
| `src/shared/schemas.ts` | Modify |
| `tests/schema-alignment.test.ts` | Modify |
| `README.md` | Modify |

---

### Task 1: Add `semanticTokenFile` to variant manifest schema (both repos)

**Files:**
- Modify: `d2c/.claude/skills/d2c/schemas/variant-manifest.ts`
- Modify: `d2c/tests/phase-1-schemas.test.ts`
- Modify: `component-contracts/src/shared/schemas.ts`
- Modify: `component-contracts/tests/schema-alignment.test.ts`

- [ ] **Step 1: Add failing test in d2c**

In `tests/phase-1-schemas.test.ts`, find the variant-manifest describe block and add:

```typescript
  it("has optional semanticTokenFile field", () => {
    const content = readSchema("variant-manifest.ts");
    expect(content).toMatch(/semanticTokenFile\?:\s*string/);
  });
```

- [ ] **Step 2: Run test to verify fail**

```bash
npx vitest run tests/phase-1-schemas.test.ts
```

Expected: FAIL — `semanticTokenFile` doesn't exist yet.

- [ ] **Step 3: Add field to d2c schema**

In `.claude/skills/d2c/schemas/variant-manifest.ts`, add after the `deprecated?` field (line 10):

```typescript
  semanticTokenFile?: string;
```

- [ ] **Step 4: Run test to verify pass**

```bash
npx vitest run tests/phase-1-schemas.test.ts
```

- [ ] **Step 5: Add failing test in component-contracts**

In `component-contracts/tests/schema-alignment.test.ts`, add inside the "VariantManifest schema alignment" describe block:

```typescript
  it("has optional semanticTokenFile field", () => {
    expect(schemasContent).toMatch(/semanticTokenFile\?:\s*string/);
  });
```

- [ ] **Step 6: Run test to verify fail**

```bash
cd /Users/jeremysykes/workspace/projects/component-contracts && npx vitest run tests/schema-alignment.test.ts
```

- [ ] **Step 7: Add field to component-contracts schema**

In `component-contracts/src/shared/schemas.ts`, add `semanticTokenFile?: string;` after the `deprecated?` field in the VariantManifest interface.

- [ ] **Step 8: Run test to verify pass**

```bash
npx vitest run tests/schema-alignment.test.ts
```

- [ ] **Step 9: Verify isVariantManifest type guard doesn't break**

The type guard only checks required fields. `semanticTokenFile` is optional, so it should pass without changes. Verify:

```bash
npx tsc --noEmit
```

- [ ] **Step 10: Rebuild component-contracts**

```bash
npm run build
```

- [ ] **Step 11: Commit both repos**

```bash
# d2c
cd /Users/jeremysykes/workspace/projects/d2c
git add .claude/skills/d2c/schemas/variant-manifest.ts tests/phase-1-schemas.test.ts
git commit -m "feat: add semanticTokenFile optional field to variant manifest schema"

# component-contracts
cd /Users/jeremysykes/workspace/projects/component-contracts
git add src/shared/schemas.ts tests/schema-alignment.test.ts
git commit -m "feat: add semanticTokenFile optional field to variant manifest schema"
```

---

### Task 2: Create semantic.css for Carbon

**Files:**
- Create: `demo/button/carbon/tokens/semantic.css`

- [ ] **Step 1: Create the semantic token mapping**

Create `demo/button/carbon/tokens/semantic.css`:

```css
/**
 * Carbon Button — semantic token layer.
 *
 * Maps standard semantic token names to Carbon-specific CSS custom properties
 * generated by Style Dictionary. Components reference these semantic tokens
 * via Tailwind utilities (e.g., bg-cds-primary).
 *
 * The structural validation gate reads this file to discover which CSS
 * properties to check and what values they should resolve to.
 */

:root {
  /* Color — primary variant */
  --cds-primary: var(--cds-color-button-primary-background);
  --cds-primary-hover: var(--cds-color-button-primary-hover);
  --cds-primary-active: var(--cds-color-button-primary-active);
  --cds-primary-foreground: var(--cds-color-text-on-color);

  /* Color — secondary variant */
  --cds-secondary: var(--cds-color-button-secondary-background);
  --cds-secondary-hover: var(--cds-color-button-secondary-hover);
  --cds-secondary-active: var(--cds-color-button-secondary-active);
  --cds-secondary-foreground: var(--cds-color-text-on-color);

  /* Color — tertiary variant */
  --cds-tertiary: var(--cds-color-button-tertiary-background);
  --cds-tertiary-hover: var(--cds-color-button-tertiary-hover);
  --cds-tertiary-active: var(--cds-color-button-tertiary-active);
  --cds-tertiary-foreground: var(--cds-color-text-interactive);
  --cds-tertiary-border: var(--cds-color-border-interactive);

  /* Color — ghost variant */
  --cds-ghost: transparent;
  --cds-ghost-hover: var(--cds-color-button-ghost-hover);
  --cds-ghost-active: var(--cds-color-button-ghost-active);
  --cds-ghost-foreground: var(--cds-color-text-interactive);

  /* Color — danger-primary variant */
  --cds-danger: var(--cds-color-button-danger-background);
  --cds-danger-hover: var(--cds-color-button-danger-hover);
  --cds-danger-active: var(--cds-color-button-danger-active);
  --cds-danger-foreground: var(--cds-color-text-on-color);

  /* Color — disabled */
  --cds-disabled: var(--cds-color-button-disabled-background);
  --cds-disabled-foreground: var(--cds-color-text-on-color-disabled);

  /* Spacing */
  --cds-spacing-height-sm: var(--cds-spacing-button-height-sm);
  --cds-spacing-height-md: var(--cds-spacing-button-height-md);
  --cds-spacing-height-lg: var(--cds-spacing-button-height-lg);
  --cds-spacing-height-xl: var(--cds-spacing-button-height-xl);
  --cds-spacing-height-2xl: var(--cds-spacing-button-height-2xl);
  --cds-spacing-padding-horizontal: var(--cds-spacing-button-padding-horizontal);
  --cds-spacing-icon-size: var(--cds-spacing-button-icon-size);

  /* Typography */
  --cds-typography-font-family: var(--cds-typography-button-font-family);
  --cds-typography-font-size: var(--cds-typography-button-font-size);
  --cds-typography-font-weight: var(--cds-typography-button-font-weight);
  --cds-typography-line-height: var(--cds-typography-button-line-height);
  --cds-typography-letter-spacing: var(--cds-typography-button-letter-spacing);
}
```

- [ ] **Step 2: Commit**

```bash
git add demo/button/carbon/tokens/semantic.css
git commit -m "feat: Carbon semantic token layer — maps standard names to system variables"
```

---

### Task 3: Create semantic.css for Primer

**Files:**
- Create: `demo/button/primer/tokens/semantic.css`

- [ ] **Step 1: Create the semantic token mapping**

Create `demo/button/primer/tokens/semantic.css`:

```css
/**
 * Primer Button — semantic token layer.
 */

:root {
  /* Color — primary variant */
  --primer-primary: var(--primer-color-button-primary-background);
  --primer-primary-hover: var(--primer-color-button-primary-hover);
  --primer-primary-active: var(--primer-color-button-primary-active);
  --primer-primary-foreground: var(--primer-color-text-on-emphasis);

  /* Color — secondary (default) variant */
  --primer-secondary: var(--primer-color-button-default-background);
  --primer-secondary-hover: var(--primer-color-button-default-hover);
  --primer-secondary-active: var(--primer-color-button-default-active);
  --primer-secondary-foreground: var(--primer-color-text-primary);
  --primer-secondary-border: var(--primer-color-border-default);

  /* Color — danger variant */
  --primer-danger: var(--primer-color-button-danger-background);
  --primer-danger-hover: var(--primer-color-button-danger-hover);
  --primer-danger-active: var(--primer-color-button-danger-active);
  --primer-danger-foreground: var(--primer-color-button-danger-foreground);

  /* Color — invisible variant */
  --primer-invisible: var(--primer-color-button-invisible-background);
  --primer-invisible-hover: var(--primer-color-button-invisible-hover);
  --primer-invisible-active: var(--primer-color-button-invisible-active);
  --primer-invisible-foreground: var(--primer-color-button-outline-foreground);
  --primer-invisible-border: var(--primer-color-border-transparent);

  /* Color — disabled */
  --primer-disabled: var(--primer-color-button-disabled-background);
  --primer-disabled-foreground: var(--primer-color-text-disabled);

  /* Spacing */
  --primer-spacing-height-sm: var(--primer-spacing-button-height-sm);
  --primer-spacing-height-md: var(--primer-spacing-button-height-md);
  --primer-spacing-height-lg: var(--primer-spacing-button-height-lg);
  --primer-spacing-padding-horizontal: var(--primer-spacing-button-padding-horizontal);
  --primer-spacing-padding-horizontal-sm: var(--primer-spacing-button-padding-horizontal-sm);
  --primer-spacing-gap: var(--primer-spacing-button-gap);

  /* Typography */
  --primer-typography-font-family: var(--primer-typography-button-font-family);
  --primer-typography-font-size: var(--primer-typography-button-font-size);
  --primer-typography-font-weight: var(--primer-typography-button-font-weight);
  --primer-typography-line-height: var(--primer-typography-button-line-height);
}
```

- [ ] **Step 2: Commit**

```bash
git add demo/button/primer/tokens/semantic.css
git commit -m "feat: Primer semantic token layer — maps standard names to system variables"
```

---

### Task 4: Create semantic.css for Polaris

**Files:**
- Create: `demo/button/polaris/tokens/semantic.css`

- [ ] **Step 1: Create the semantic token mapping**

Create `demo/button/polaris/tokens/semantic.css`:

```css
/**
 * Polaris Button — semantic token layer.
 */

:root {
  /* Color — primary variant */
  --polaris-primary: var(--polaris-color-button-primary-background);
  --polaris-primary-hover: var(--polaris-color-button-primary-hover);
  --polaris-primary-active: var(--polaris-color-button-primary-active);
  --polaris-primary-foreground: var(--polaris-color-text-on-fill);

  /* Color — auto (default) variant */
  --polaris-secondary: white;
  --polaris-secondary-foreground: var(--polaris-color-text-primary);

  /* Color — tertiary variant */
  --polaris-tertiary: var(--polaris-color-button-tertiary-background);
  --polaris-tertiary-hover: var(--polaris-color-button-tertiary-hover);
  --polaris-tertiary-active: var(--polaris-color-button-tertiary-active);
  --polaris-tertiary-foreground: var(--polaris-color-text-primary);

  /* Color — critical tone */
  --polaris-critical: var(--polaris-color-button-critical-background);
  --polaris-critical-hover: var(--polaris-color-button-critical-hover);
  --polaris-critical-active: var(--polaris-color-button-critical-active);
  --polaris-critical-foreground: var(--polaris-color-text-critical);

  /* Color — disabled */
  --polaris-disabled: var(--polaris-color-button-disabled-background);
  --polaris-disabled-foreground: var(--polaris-color-text-disabled);

  /* Spacing */
  --polaris-spacing-padding-horizontal: var(--polaris-spacing-button-padding-horizontal);
  --polaris-spacing-border-radius: var(--polaris-spacing-button-border-radius);
  --polaris-spacing-gap: var(--polaris-spacing-button-gap);

  /* Typography */
  --polaris-typography-font-family: var(--polaris-typography-button-font-family);
  --polaris-typography-font-size: var(--polaris-typography-button-font-size);
  --polaris-typography-font-weight: var(--polaris-typography-button-font-weight);
  --polaris-typography-line-height: var(--polaris-typography-button-line-height);
}
```

- [ ] **Step 2: Commit**

```bash
git add demo/button/polaris/tokens/semantic.css
git commit -m "feat: Polaris semantic token layer — maps standard names to system variables"
```

---

### Task 5: Register semantic tokens with Tailwind and rewrite all three Buttons

**Files:**
- Modify: `.storybook/preview.css`
- Rewrite: `demo/button/carbon/Button.tsx`
- Rewrite: `demo/button/primer/Button.tsx`
- Rewrite: `demo/button/polaris/Button.tsx`

- [ ] **Step 1: Register semantic tokens in Tailwind via preview.css**

Replace `.storybook/preview.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
@import "tailwindcss";

@theme {
  /* Carbon semantic colors */
  --color-cds-primary: var(--cds-primary);
  --color-cds-primary-hover: var(--cds-primary-hover);
  --color-cds-primary-active: var(--cds-primary-active);
  --color-cds-primary-foreground: var(--cds-primary-foreground);
  --color-cds-secondary: var(--cds-secondary);
  --color-cds-secondary-hover: var(--cds-secondary-hover);
  --color-cds-secondary-active: var(--cds-secondary-active);
  --color-cds-secondary-foreground: var(--cds-secondary-foreground);
  --color-cds-tertiary: var(--cds-tertiary);
  --color-cds-tertiary-hover: var(--cds-tertiary-hover);
  --color-cds-tertiary-active: var(--cds-tertiary-active);
  --color-cds-tertiary-foreground: var(--cds-tertiary-foreground);
  --color-cds-ghost: var(--cds-ghost);
  --color-cds-ghost-hover: var(--cds-ghost-hover);
  --color-cds-ghost-active: var(--cds-ghost-active);
  --color-cds-ghost-foreground: var(--cds-ghost-foreground);
  --color-cds-danger: var(--cds-danger);
  --color-cds-danger-hover: var(--cds-danger-hover);
  --color-cds-danger-active: var(--cds-danger-active);
  --color-cds-danger-foreground: var(--cds-danger-foreground);
  --color-cds-disabled: var(--cds-disabled);
  --color-cds-disabled-foreground: var(--cds-disabled-foreground);

  /* Primer semantic colors */
  --color-primer-primary: var(--primer-primary);
  --color-primer-primary-hover: var(--primer-primary-hover);
  --color-primer-primary-active: var(--primer-primary-active);
  --color-primer-primary-foreground: var(--primer-primary-foreground);
  --color-primer-secondary: var(--primer-secondary);
  --color-primer-secondary-hover: var(--primer-secondary-hover);
  --color-primer-secondary-active: var(--primer-secondary-active);
  --color-primer-secondary-foreground: var(--primer-secondary-foreground);
  --color-primer-danger: var(--primer-danger);
  --color-primer-danger-hover: var(--primer-danger-hover);
  --color-primer-danger-active: var(--primer-danger-active);
  --color-primer-danger-foreground: var(--primer-danger-foreground);
  --color-primer-invisible: var(--primer-invisible);
  --color-primer-invisible-hover: var(--primer-invisible-hover);
  --color-primer-invisible-active: var(--primer-invisible-active);
  --color-primer-invisible-foreground: var(--primer-invisible-foreground);
  --color-primer-disabled: var(--primer-disabled);
  --color-primer-disabled-foreground: var(--primer-disabled-foreground);

  /* Polaris semantic colors */
  --color-polaris-primary: var(--polaris-primary);
  --color-polaris-primary-hover: var(--polaris-primary-hover);
  --color-polaris-primary-active: var(--polaris-primary-active);
  --color-polaris-primary-foreground: var(--polaris-primary-foreground);
  --color-polaris-secondary: var(--polaris-secondary);
  --color-polaris-secondary-foreground: var(--polaris-secondary-foreground);
  --color-polaris-tertiary: var(--polaris-tertiary);
  --color-polaris-tertiary-hover: var(--polaris-tertiary-hover);
  --color-polaris-tertiary-active: var(--polaris-tertiary-active);
  --color-polaris-tertiary-foreground: var(--polaris-tertiary-foreground);
  --color-polaris-critical: var(--polaris-critical);
  --color-polaris-critical-foreground: var(--polaris-critical-foreground);
  --color-polaris-disabled: var(--polaris-disabled);
  --color-polaris-disabled-foreground: var(--polaris-disabled-foreground);
}
```

- [ ] **Step 2: Rewrite Carbon Button.tsx**

Replace `demo/button/carbon/Button.tsx`:

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";
import "./tokens/semantic.css";

/**
 * Carbon Button — CVA variants using semantic token utilities.
 *
 * Figma source: component set 1854:1776
 *
 * Colors, spacing, and typography reference semantic tokens defined in
 * tokens/semantic.css, registered with Tailwind via @theme in preview.css.
 * The structural validation gate reads semantic.css to discover checks.
 */

const buttonVariants = cva(
  [
    "cds-btn inline-flex items-center overflow-clip cursor-pointer border-0",
    "font-[family-name:var(--cds-typography-font-family)]",
    "text-[length:var(--cds-typography-font-size)]",
    "leading-[var(--cds-typography-line-height)]",
    "tracking-[var(--cds-typography-letter-spacing)]",
    "font-[number:var(--cds-typography-font-weight)]",
  ].join(" "),
  {
    variants: {
      kind: {
        primary:
          "bg-cds-primary text-cds-primary-foreground hover:bg-cds-primary-hover active:bg-cds-primary-active",
        secondary:
          "bg-cds-secondary text-cds-secondary-foreground hover:bg-cds-secondary-hover active:bg-cds-secondary-active",
        tertiary:
          "bg-cds-tertiary text-cds-tertiary-foreground shadow-[inset_0_0_0_1px_var(--cds-tertiary-border)] hover:bg-cds-tertiary-hover hover:text-cds-primary-foreground hover:shadow-none active:bg-cds-tertiary-active active:text-cds-primary-foreground active:shadow-none",
        ghost:
          "bg-cds-ghost text-cds-ghost-foreground hover:bg-cds-ghost-hover active:bg-cds-ghost-active",
        "danger-primary":
          "bg-cds-danger text-cds-danger-foreground hover:bg-cds-danger-hover active:bg-cds-danger-active",
        "danger-tertiary":
          "bg-transparent text-cds-danger shadow-[inset_0_0_0_1px_var(--cds-danger)] hover:bg-cds-danger hover:text-cds-primary-foreground hover:shadow-none active:bg-cds-danger-active active:text-cds-primary-foreground active:shadow-none",
        "danger-ghost":
          "bg-transparent text-cds-danger hover:bg-cds-ghost-hover active:bg-cds-ghost-active",
      },
      size: {
        xs: "h-6 items-center",
        sm: "h-[var(--cds-spacing-height-sm)] items-center",
        md: "h-[var(--cds-spacing-height-md)] items-center",
        lg: "h-[var(--cds-spacing-height-lg)] items-center",
        xl: "h-[var(--cds-spacing-height-xl)] items-start pt-4",
        "2xl": "h-[var(--cds-spacing-height-2xl)] items-start pt-4",
        expressive: "h-[var(--cds-spacing-height-lg)] items-center text-base leading-[22px] tracking-normal",
      },
      type: {
        default: "pl-[var(--cds-spacing-padding-horizontal)] pr-[var(--cds-spacing-padding-horizontal)] justify-between",
        "icon-only": "justify-center items-center",
      },
      disabled: {
        true: "bg-cds-disabled text-cds-disabled-foreground cursor-not-allowed shadow-none hover:bg-cds-disabled active:bg-cds-disabled",
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

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled">,
    ButtonVariants {
  label: string;
  icon?: ReactNode;
}

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
        <span className="size-[var(--cds-spacing-icon-size)] shrink-0 flex items-center justify-center">
          {icon}
        </span>
      )}
    </button>
  );
}

export { buttonVariants };
```

Key changes from previous version:
- Imports `semantic.css`
- CVA uses `bg-cds-primary` instead of `bg-[var(--cds-color-button-primary-background)]`
- Default type: `justify-between` instead of `gap-2` (icon position fix)
- Default type: symmetric padding (`pr-[var(--cds-spacing-padding-horizontal)]` instead of `pr-16`)
- Typography references semantic layer (`--cds-typography-font-family` instead of `--cds-typography-button-font-family`)

- [ ] **Step 3: Rewrite Primer Button.tsx**

Replace `demo/button/primer/Button.tsx`:

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";
import "./tokens/semantic.css";

/**
 * Primer Button — CVA variants using semantic token utilities.
 *
 * Figma source: component set 30258:5582
 */

const buttonVariants = cva(
  [
    "primer-btn inline-flex items-center rounded-md border border-solid cursor-pointer select-none transition-colors duration-100",
    "font-[family-name:var(--primer-typography-font-family)]",
    "text-[length:var(--primer-typography-font-size)]",
    "leading-[var(--primer-typography-line-height)]",
    "font-[number:var(--primer-typography-font-weight)]",
    "gap-[var(--primer-spacing-gap)]",
  ].join(" "),
  {
    variants: {
      variant: {
        secondary:
          "bg-primer-secondary text-primer-secondary-foreground border-[var(--primer-secondary-border)] shadow-[0_1px_0_0_rgba(31,35,40,0.04)] hover:bg-primer-secondary-hover active:bg-primer-secondary-active",
        primary:
          "bg-primer-primary text-primer-primary-foreground border-[var(--primer-invisible-border)] shadow-[0_1px_0_0_rgba(31,35,40,0.04)] hover:bg-primer-primary-hover active:bg-primer-primary-active",
        danger:
          "bg-primer-danger text-primer-danger-foreground border-[var(--primer-secondary-border)] shadow-[0_1px_0_0_rgba(31,35,40,0.04)] hover:bg-primer-danger-hover hover:text-primer-primary-foreground active:bg-primer-danger-active active:text-primer-primary-foreground",
        invisible:
          "bg-primer-invisible text-primer-invisible-foreground border-[var(--primer-invisible-border)] shadow-none hover:bg-primer-invisible-hover active:bg-primer-invisible-active",
      },
      size: {
        sm: "h-[var(--primer-spacing-height-sm)] px-[var(--primer-spacing-padding-horizontal-sm)] text-xs",
        md: "h-[var(--primer-spacing-height-md)] px-[var(--primer-spacing-padding-horizontal)]",
        lg: "h-[var(--primer-spacing-height-lg)] px-[var(--primer-spacing-padding-horizontal)]",
      },
      alignContent: {
        center: "justify-center",
        start: "justify-start",
      },
      block: {
        true: "w-full",
        false: "",
      },
      disabled: {
        true: "bg-primer-disabled text-primer-disabled-foreground border-[var(--primer-secondary-border)] cursor-not-allowed opacity-50 hover:bg-primer-disabled active:bg-primer-disabled",
        false: "",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
      alignContent: "center",
      block: false,
      disabled: false,
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    ButtonVariants {
  label: string;
  leadingVisual?: ReactNode;
  trailingVisual?: ReactNode;
}

export function Button({
  label,
  leadingVisual,
  trailingVisual,
  variant,
  size,
  alignContent,
  block,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, alignContent, block, disabled, className })}
      disabled={disabled || undefined}
      {...props}
    >
      {leadingVisual && (
        <span className="shrink-0 size-4 flex items-center justify-center overflow-clip">
          {leadingVisual}
        </span>
      )}
      <span className="whitespace-nowrap">{label}</span>
      {trailingVisual && (
        <span className="shrink-0 size-4 flex items-center justify-center overflow-clip">
          {trailingVisual}
        </span>
      )}
    </button>
  );
}

export { buttonVariants };
```

- [ ] **Step 4: Rewrite Polaris Button.tsx**

Replace `demo/button/polaris/Button.tsx`:

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";
import "./tokens/semantic.css";

/**
 * Polaris Button — CVA variants using semantic token utilities.
 *
 * Figma source: component set 37:12833
 */

const buttonVariants = cva(
  [
    "polaris-btn inline-flex items-center justify-center overflow-clip border-0 cursor-pointer select-none transition-all duration-100",
    "font-[family-name:var(--polaris-typography-font-family)]",
    "text-[length:var(--polaris-typography-font-size)]",
    "leading-[var(--polaris-typography-line-height)]",
    "font-[number:var(--polaris-typography-font-weight)]",
    "rounded-[var(--polaris-spacing-border-radius)]",
    "gap-[var(--polaris-spacing-gap)]",
    "px-[var(--polaris-spacing-padding-horizontal)]",
    "py-1.5",
  ].join(" "),
  {
    variants: {
      variant: {
        auto: "bg-polaris-secondary text-polaris-secondary-foreground shadow-[inset_0px_-1px_0px_0px_var(--polaris-color-border-secondary),inset_0px_0px_0px_1px_rgba(0,0,0,0.1),inset_0px_0.5px_0px_1.5px_white]",
        primary: "text-polaris-primary-foreground shadow-[inset_0px_-1px_0px_1px_rgba(0,0,0,0.8),inset_0px_0px_0px_1px_var(--polaris-primary),inset_0px_0.5px_0px_1.5px_rgba(255,255,255,0.25)]",
        tertiary: "bg-polaris-tertiary text-polaris-tertiary-foreground shadow-none hover:bg-polaris-tertiary-hover active:bg-polaris-tertiary-active",
      },
      tone: {
        neutral: "",
        critical: "",
      },
      iconOnly: {
        true: "gap-0 p-1.5",
        false: "",
      },
      disabled: {
        true: "text-polaris-disabled-foreground shadow-none cursor-not-allowed",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        tone: "neutral",
        disabled: false,
        className: "bg-polaris-primary",
      },
      {
        variant: "primary",
        tone: "critical",
        disabled: false,
        className: "bg-polaris-critical shadow-[inset_0px_-1px_0px_1px_rgba(142,11,33,0.8),inset_0px_0px_0px_1px_rgba(163,10,36,0.8),inset_0px_0.5px_0px_1.5px_rgba(247,128,134,0.64)]",
      },
      {
        variant: "auto",
        tone: "critical",
        disabled: false,
        className: "text-polaris-critical-foreground",
      },
      {
        variant: "tertiary",
        tone: "critical",
        disabled: false,
        className: "text-polaris-critical-foreground",
      },
      {
        variant: "auto",
        disabled: true,
        className: "bg-polaris-disabled",
      },
      {
        variant: "primary",
        disabled: true,
        className: "bg-polaris-disabled",
      },
      {
        variant: "tertiary",
        disabled: true,
        className: "bg-polaris-disabled",
      },
    ],
    defaultVariants: {
      variant: "auto",
      tone: "neutral",
      iconOnly: false,
      disabled: false,
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    ButtonVariants {
  label: string;
  icon?: ReactNode;
}

export function Button({
  label,
  icon,
  variant = "auto",
  tone,
  iconOnly,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  const isPrimary = variant === "primary" && !disabled;
  const gradientStyle: React.CSSProperties | undefined = isPrimary
    ? {
        backgroundImage:
          "linear-gradient(180deg, rgba(48,48,48,0) 63.5%, rgba(255,255,255,0.15) 100%)",
      }
    : undefined;

  return (
    <button
      className={buttonVariants({ variant, tone, iconOnly, disabled, className })}
      disabled={disabled || undefined}
      style={gradientStyle}
      {...props}
    >
      {iconOnly
        ? icon && <span className="size-5 flex items-center justify-center">{icon}</span>
        : (
          <>
            {icon && <span className="shrink-0 size-4 flex items-center justify-center">{icon}</span>}
            <span className="whitespace-nowrap">{label}</span>
          </>
        )
      }
    </button>
  );
}

export { buttonVariants };
```

- [ ] **Step 5: Verify Storybook builds**

```bash
npm run build-storybook 2>&1 | tail -5
```

Expected: Clean build.

- [ ] **Step 6: Run tests**

```bash
npm run validate
```

Expected: ALL PASS.

- [ ] **Step 7: Commit**

```bash
git add .storybook/preview.css demo/button/carbon/Button.tsx demo/button/primer/Button.tsx demo/button/polaris/Button.tsx
git commit -m "refactor: all Buttons use semantic token utilities — bg-cds-primary, bg-primer-primary, bg-polaris-primary"
```

---

### Task 6: Update structural gate docs and diff-result schema

**Files:**
- Modify: `.claude/skills/d2c/schemas/diff-result.ts`
- Rewrite: `.claude/skills/d2c/phases/validate.md`
- Rewrite: `.claude/skills/d2c/mcps/playwright.md`

- [ ] **Step 1: Add semanticTokensChecked to StructuralGateResult**

In `.claude/skills/d2c/schemas/diff-result.ts`, add to the `StructuralGateResult` interface:

```typescript
export interface StructuralGateResult {
  passed: boolean;
  semanticTokensChecked: number;
  mismatches: StructuralMismatch[];
}
```

- [ ] **Step 2: Rewrite validate.md**

Update `.claude/skills/d2c/phases/validate.md` gate description to reference semantic token discovery:

In the "Gate 1 — Structural comparison" section, replace the properties table and comparison rules with the convention-driven discovery pattern from the spec. The gate reads the component's `semantic.css` (located via `semanticTokenFile` in the manifest), parses token declarations, and derives CSS property checks from the naming convention.

Add the convention table:

```
| Token pattern | CSS property | Target |
|---|---|---|
| --{prefix}-primary (no suffix) | backgroundColor | Root |
| --{prefix}-primary-foreground | color | Text |
| --{prefix}-*-hover | Skip (state) | — |
| --{prefix}-*-active | Skip (state) | — |
| --{prefix}-spacing-height-* | height | Root (active size) |
| --{prefix}-spacing-padding-* | paddingLeft/Right | Root |
| --{prefix}-spacing-gap | gap | Root |
| --{prefix}-spacing-border-radius | borderRadius | Root |
| --{prefix}-spacing-icon-size | width, height | Icon element |
| --{prefix}-typography-font-family | fontFamily | Root |
| --{prefix}-typography-font-size | fontSize | Root |
| --{prefix}-typography-font-weight | fontWeight | Root |
| --{prefix}-typography-line-height | lineHeight | Root |
| --{prefix}-typography-letter-spacing | letterSpacing | Root |
```

- [ ] **Step 3: Rewrite playwright.md**

Update the CSS extraction and comparison rules sections to reference the semantic token convention. The extraction code now reads semantic.css to know what to check rather than using a hardcoded property list.

- [ ] **Step 4: Update component-contracts README**

Add `semanticTokenFile` to the VariantManifest schema section.

- [ ] **Step 5: Commit**

```bash
# d2c
git add .claude/skills/d2c/schemas/diff-result.ts .claude/skills/d2c/phases/validate.md .claude/skills/d2c/mcps/playwright.md
git commit -m "feat: component-agnostic structural gate — discovers checks from semantic token conventions"

# component-contracts
cd /Users/jeremysykes/workspace/projects/component-contracts
git add README.md
git commit -m "docs: add semanticTokenFile to VariantManifest schema docs"
```

---

### Task 7: Re-validate all three Buttons via Playwright

**Requires:** Playwright MCP connected, Storybook running with updated code

- [ ] **Step 1: Restart Storybook to pick up semantic.css changes**

Verify Storybook is serving updated code.

- [ ] **Step 2: Validate Carbon**

Navigate to `http://localhost:6006/iframe.html?id=carbon-button--primary`. Extract computed CSS from `#storybook-root button`. Compare:
- `backgroundColor` vs resolved `--cds-primary` (should be `rgb(15, 98, 254)`)
- `color` (text) vs resolved `--cds-primary-foreground` (should be `rgb(255, 255, 255)`)
- `fontFamily` contains `IBM Plex Sans`
- `fontSize` = `14px`, `fontWeight` = `400`, `lineHeight` = `18px`, `letterSpacing` = `0.16px`
- `height` = `48px` (lg default)
- Vertical alignment: text centered (delta ≤ 2px)
- Icon position: icon trailing edge within 2px of button right edge minus padding (verify `justify-between` works)

- [ ] **Step 3: Validate Primer**

Navigate to `http://localhost:6006/iframe.html?id=primer-button--primary`. Same extraction. Compare against Primer semantic tokens.

- [ ] **Step 4: Validate Polaris**

Navigate to `http://localhost:6006/iframe.html?id=polaris-button--primary`. Same extraction. Compare against Polaris semantic tokens.

- [ ] **Step 5: Write diff results for all three**

Create/update `.d2c/diff-results/button-latest.json`, `primer-button-latest.json`, `polaris-button-latest.json`.

- [ ] **Step 6: Update status registry**

All three should be at `validate` status after passing gates.

- [ ] **Step 7: Commit**

```bash
git add -f .d2c/diff-results/ .d2c/status-registry.json
git commit -m "validate: all three Buttons pass component-agnostic structural gate"
```

---

### Task 8: Re-ship all three with Figma write-back

**Requires:** Figma MCP connected

- [ ] **Step 1: Figma write preflight for all three files**

No-op PATCH on Carbon (`LIVjw0uC7eSnQAeOETXiv0`), Primer (`eqUohNd2pv50OCWlCRos76`), Polaris (`QoLsm4KFD0ncjo9C1ycTVb`).

- [ ] **Step 2: Update component descriptions in Figma**

Write version, validation method (semantic token gate), and code pointers to each component's description.

- [ ] **Step 3: Generate changelogs**

Append entries to all three changelog files noting the semantic token migration and structural gate update.

- [ ] **Step 4: Update manifests via Variant Authority MCP**

Add `semanticTokenFile: "tokens/semantic.css"` to each manifest. Bump versions.

- [ ] **Step 5: Update status to alpha**

All three → `alpha` with history entries.

- [ ] **Step 6: Run full test suite**

```bash
npm run validate
cd /Users/jeremysykes/workspace/projects/component-contracts && npm test
```

- [ ] **Step 7: Commit and push both repos**

```bash
cd /Users/jeremysykes/workspace/projects/d2c
git add .d2c/ .variant-authority/
git commit -m "ship: all three Buttons to alpha with semantic token gate and Figma write-back"
git push origin main

cd /Users/jeremysykes/workspace/projects/component-contracts
git push origin main
```

---

## Self-Review

**Spec coverage:**
- Semantic.css per design system → Tasks 2, 3, 4
- Tailwind @theme registration → Task 5 step 1
- Component CVA rewrite → Task 5 steps 2-4
- Carbon icon position fix → Task 5 step 2 (`justify-between`)
- Primer/Polaris icon position verification → Task 7 steps 3-4
- Manifest schema update → Task 1 (both repos)
- Structural gate spec update → Task 6
- diff-result.ts schema update → Task 6 step 1
- component-contracts schema alignment → Task 1 steps 5-10
- component-contracts README → Task 6 step 4
- component-contracts dist rebuild → Task 1 step 10
- Re-validate via Playwright → Task 7
- Re-ship with Figma write-back → Task 8
- Token pipeline unchanged → Verified: semantic.css imports on top of variables.css

**Placeholder scan:** No TBDs. All component code is complete. All CSS is complete.

**Type consistency:** `semanticTokenFile` spelled consistently. `StructuralGateResult.semanticTokensChecked` added in Task 6, referenced in Tasks 7-8.

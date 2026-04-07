# Semantic Token Layer and Component-Agnostic Structural Gate

## Problem

The structural validation gate is component-specific. It hardcodes which CSS properties to check, which DOM elements to target, and which tokens to compare against. Adding a new component (Checkbox, Select) requires manually wiring each comparison. This doesn't scale.

The component code also uses explicit CSS variable references (`bg-[var(--cds-color-button-primary-background)]`) instead of semantic utility classes. This makes CVA definitions verbose and couples components to system-specific variable names.

## Solution

Adopt a two-layer token architecture (modeled after the futra-financial pattern) with a convention-driven structural gate.

### Layer 1: System-specific primitives (already exists)

Style Dictionary generates `--cds-*`, `--primer-*`, `--polaris-*` custom properties from DTCG source files. No changes needed here.

### Layer 2: Semantic tokens (new)

Each design system gets a `semantic.css` file that maps a standard set of token names to its system-specific variables:

```css
/* demo/button/carbon/tokens/semantic.css */
:root {
  --color-primary: var(--cds-color-button-primary-background);
  --color-primary-foreground: var(--cds-color-text-on-color);
  --spacing-height-lg: var(--cds-spacing-button-height-lg);
  --typography-font-family: var(--cds-typography-button-font-family);
}
```

Components reference semantic tokens via Tailwind utilities: `bg-primary`, `text-primary-foreground`, `h-[var(--spacing-height-lg)]`. Same CVA classes work across all three design systems — only the semantic.css mapping differs.

### Component-agnostic structural gate

The validate phase reads the component's `semantic.css`, parses every declaration, and derives what to check from the token naming convention:

| Token prefix | CSS property | Target element |
|---|---|---|
| `--color-{variant}` (no suffix) | `backgroundColor` | Root element |
| `--color-{variant}-foreground` | `color` | Text element |
| `--color-{variant}-hover` | Skipped (state-dependent) |
| `--color-{variant}-active` | Skipped (state-dependent) |
| `--color-disabled` | `backgroundColor` | Root element (disabled state) |
| `--color-disabled-foreground` | `color` | Text element (disabled state) |
| `--spacing-height-{size}` | `height` | Root element (for active size) |
| `--spacing-padding-horizontal` | `paddingLeft` | Root element |
| `--spacing-icon-size` | `width` and `height` | Icon element |
| `--spacing-border-radius` | `borderRadius` | Root element |
| `--spacing-gap` | `gap` | Root element |
| `--typography-font-family` | `fontFamily` | Root element |
| `--typography-font-size` | `fontSize` | Root element |
| `--typography-font-weight` | `fontWeight` | Root element |
| `--typography-line-height` | `lineHeight` | Root element |
| `--typography-letter-spacing` | `letterSpacing` | Root element |

The gate discovers checks automatically from the semantic.css file. A new component type (Checkbox, Select) just needs a semantic.css and a Storybook story — no gate reconfiguration.

### Fixed checks (not convention-derived)

Two layout checks remain hardcoded because they can't be expressed as single-property token comparisons:

- **Vertical alignment**: text center within 2px of container center. Applies to any component with a text slot.
- **Icon position**: for components with an icon slot in the default (non-icon-only) type, the icon trailing edge should be within 2px of expected position.

## Component Rewrite

All three Button components move from explicit variable references to semantic utility classes:

**Before:**
```typescript
primary: "bg-[var(--cds-color-button-primary-background)] text-[var(--cds-color-text-on-color)] hover:bg-[var(--cds-color-button-primary-hover)]",
```

**After:**
```typescript
primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
```

Carbon Button also fixes icon position: `gap-2` → `justify-between` to push the icon to the trailing edge.

## Tailwind Integration

Semantic tokens are registered with Tailwind so utility classes like `bg-primary` resolve correctly. Each component's semantic.css uses a `@theme` block or the tokens are declared in `:root` scope and referenced via Tailwind's arbitrary value syntax. The approach must allow multiple design systems to coexist in the same Storybook instance without token name conflicts.

**Scoping strategy**: since all three design systems render simultaneously in Storybook, semantic token names must be system-prefixed to avoid collisions. Each system's semantic.css declares tokens like `--cds-primary`, `--primer-primary`, `--polaris-primary`. Tailwind utilities are registered per system: `bg-cds-primary`, `bg-primer-primary`, `bg-polaris-primary`. This is slightly more verbose than futra's single-brand `bg-primary`, but it's the correct approach when multiple systems coexist. A real consumer using only one design system could alias these to unprefixed names.

The structural gate handles prefixed tokens by stripping the system prefix when deriving the CSS property — `--cds-primary` and `--primer-primary` both map to `backgroundColor` on the root element via the same `--{prefix}-primary` convention.

## Manifest Update

The variant manifest gets a new optional field:

```typescript
interface VariantManifest {
  // ... existing fields ...
  semanticTokenFile?: string; // relative path to semantic.css, e.g. "tokens/semantic.css"
}
```

The validate phase uses this field to locate the semantic token file. If absent, the gate falls back to the existing manual comparison behavior.

## Files Affected

### d2c repo

| File | Action | Purpose |
|---|---|---|
| `demo/button/carbon/tokens/semantic.css` | Create | Semantic token mapping for Carbon |
| `demo/button/primer/tokens/semantic.css` | Create | Semantic token mapping for Primer |
| `demo/button/polaris/tokens/semantic.css` | Create | Semantic token mapping for Polaris |
| `demo/button/carbon/Button.tsx` | Rewrite CVA | Semantic utilities + icon position fix |
| `demo/button/primer/Button.tsx` | Rewrite CVA | Semantic utilities |
| `demo/button/polaris/Button.tsx` | Rewrite CVA | Semantic utilities |
| `.claude/skills/d2c/phases/validate.md` | Rewrite | Convention-driven gate discovery |
| `.claude/skills/d2c/mcps/playwright.md` | Rewrite | Semantic token extraction pattern |
| `.claude/skills/d2c/schemas/diff-result.ts` | Modify | Add semanticTokensChecked to structural gate |
| `.claude/skills/d2c/schemas/variant-manifest.ts` | Modify | Add semanticTokenFile optional field |
| `.storybook/preview.css` or Tailwind config | Modify | Register semantic token utilities |

### component-contracts repo

| File | Action | Purpose |
|---|---|---|
| `src/shared/schemas.ts` | Modify | Add `semanticTokenFile?: string` to VariantManifest |
| `src/variant-authority/server.ts` | Verify | `isVariantManifest()` type guard allows optional field — verify no breakage |
| `tests/schema-alignment.test.ts` | Modify | Add test for semanticTokenFile field |
| `README.md` | Modify | Update VariantManifest schema docs to include semanticTokenFile |

## Icon Position

The Carbon Button icon position is wrong — `gap-2` puts the icon 8px after the text instead of anchoring it to the trailing edge. Fix: `justify-between` on the default type variant. This is included in the Carbon CVA rewrite.

Primer and Polaris icon positions must also be verified during re-validation. Primer uses `leadingVisual`/`trailingVisual` as in-flow flex children with `gap-[var(--primer-spacing-button-gap)]` — verify this matches the Figma spec. Polaris uses in-flow icons with `gap-[var(--polaris-spacing-button-gap)]` — verify this matches. If either is wrong, fix it in the same rewrite pass.

## component-contracts MCP Server Changes

The `isVariantManifest()` type guard validates required fields. Since `semanticTokenFile` is optional, the type guard doesn't need to check it — but verify that `set_manifest` accepts manifests with the new field without error. If the server does strict unknown-property rejection, update the validation logic.

Rebuild `component-contracts` dist after the schema change and verify d2c's `npm install` resolves the updated local dependency.

## Token Pipeline

The semantic layer sits on top of the existing Style Dictionary output — it does not replace or modify the DTCG source files or the `sd.config.ts` pipeline. However, verify that the generated `variables.css` files still load correctly when the component also imports `semantic.css`. If there are CSS custom property conflicts or load order issues, document the required import order.

## Acceptance Criteria

- [ ] Each design system has a `semantic.css` mapping standard token names to system-specific variables
- [ ] All three Button CVA definitions use semantic utility classes, not explicit variable references
- [ ] Carbon Button icon position is fixed (`justify-between`)
- [ ] Primer and Polaris icon positions verified against Figma spec
- [ ] The structural gate reads `semantic.css` and derives checks from token naming conventions
- [ ] The gate works without any component-specific configuration
- [ ] All three Buttons pass the convention-driven structural gate via Playwright
- [ ] All three Buttons re-shipped to alpha with Figma write-back
- [ ] Variant manifest schema has `semanticTokenFile` optional field in both repos
- [ ] component-contracts schema, type guard, tests, and README updated
- [ ] component-contracts dist rebuilt and d2c dependency resolves
- [ ] Token pipeline (Style Dictionary) output unchanged — semantic layer imports on top
- [ ] A new component type could be validated by adding only a `semantic.css` and a Storybook story

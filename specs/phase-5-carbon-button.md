# Phase 5 — Carbon Button Demo

## Purpose

Demonstrate the d2c skill's design, build, and validate phases using the IBM Carbon Design System's Button component. This is the first end-to-end demo — it exercises Figma extraction, token pipeline (pre-sourced), component scaffolding, story generation, and the seeded fault for drift detection.

Demo component changed from Badge to Button per Jeremy's direction — Button has a richer variant surface, maps to more design token categories, and exercises the framework scaffolding more thoroughly.

---

## Inputs

- **Figma file**: `https://www.figma.com/design/LIVjw0uC7eSnQAeOETXiv0` (Jeremy's Carbon v11 copy)
- **Figma node ID**: `1854:1776` (Button component)
- **Token source**: `TOKEN_SOURCE=presourced` (Carbon open-source tokens, transformed to DTCG)
- **Framework**: `--framework react` (default)

---

## Outputs

### 1. Pre-sourced DTCG token file

`demo/button/carbon/tokens/button.tokens.json`

DTCG-format JSON containing Carbon Button tokens from their open-source repo:

**Color tokens** (White theme):
- `color.button.primary.background` → #0f62fe (blue-60)
- `color.button.primary.hover` → #0043ce (blue-70)
- `color.button.primary.active` → #002d9c (blue-80)
- `color.button.secondary.background` → #393939 (gray-70)
- `color.button.secondary.hover` → #474747
- `color.button.secondary.active` → #6f6f6f
- `color.button.tertiary.background` → transparent
- `color.button.tertiary.hover` → #0353e9
- `color.button.tertiary.active` → #002d9c
- `color.button.danger.background` → #da1e28 (red-60)
- `color.button.danger.hover` → #ba1b23
- `color.button.danger.active` → #750e13
- `color.button.ghost.hover` → #e8e8e8
- `color.button.disabled.background` → #c6c6c6
- `color.text.on-color` → #ffffff
- `color.text.on-color-disabled` → #8d8d8d
- `color.text.primary` → #161616

**Spacing tokens**:
- `spacing.button.height.sm` → 32px
- `spacing.button.height.md` → 40px
- `spacing.button.height.lg` → 48px
- `spacing.button.height.xl` → 64px
- `spacing.button.height.2xl` → 80px
- `spacing.button.padding.horizontal` → 16px (1rem)

**Typography tokens**:
- `typography.button.font-family` → 'IBM Plex Sans'
- `typography.button.font-size` → 14px
- `typography.button.font-weight` → 400
- `typography.button.line-height` → 18px
- `typography.button.letter-spacing` → 0.16px

### 2. Token source README

`demo/button/carbon/tokens/TOKEN_SOURCE_README.md`

Documents where the token file was sourced from, which Carbon packages contain the values, and when it was last updated.

### 3. Variant manifest

`.variant-authority/button.manifest.json`

Per the `variant-manifest.ts` schema, with:
- 4 variants: kind (7 values), size (5 values: sm, md, lg, xl, 2xl), type (2 values), disabled (boolean)
- 2 slots: label (required), icon (optional)
- Token bindings from the DTCG file
- Authority: structure=cva, visual=figma

### 4. Figma spec export

`demo/figma/carbon-button-spec.json`

Extracted component metadata from Figma MCP.

### 5. Component code

`demo/button/carbon/Button.tsx`

React + TypeScript + CVA component scaffolded from the variant manifest.

### 6. Story file

`demo/button/carbon/Button.stories.tsx`

Storybook 10 CSF factories format with stories for each key variant.

### 7. Seeded fault file

`demo/button/carbon/fault/button-token-fault.json`

Modified copy of `button.tokens.json` with one token value changed (e.g., primary background changed from #0f62fe to a different blue).

### 8. Status registry entry

`.d2c/status-registry.json` with Button component tracked through design → build phases.

---

## Edge cases

1. **Figma node ID is for the component set, not a single variant**: The extraction must handle component sets and enumerate all variants within.

2. **Carbon uses 7 style variants but we simplify to match CVA**: The variant names from Figma (e.g., "Danger primary", "Danger tertiary") must be normalized to CVA-friendly names (e.g., "danger-primary", "danger-tertiary").

3. **Skeleton state is excluded from CVA variants**: Skeleton is a loading state, not a semantic variant. It should be documented but not included in the CVA variant definition.

4. **Expressive size excluded**: Carbon's "Expressive" size is a typographic mode, not a dimension size. Excluded from the 5 standard sizes (sm, md, lg, xl, 2xl).

5. **Ghost button has transparent background**: The DTCG token for ghost background must be the string "transparent", not a hex value.

6. **Token values from multiple Carbon packages**: Colors come from @carbon/colors, spacing from @carbon/layout, typography from @carbon/type. The pre-sourced DTCG file flattens these into a single file.

---

## Acceptance criteria

1. `demo/button/carbon/tokens/button.tokens.json` exists and is valid DTCG JSON
2. `demo/button/carbon/tokens/TOKEN_SOURCE_README.md` exists and documents the source
3. `.variant-authority/button.manifest.json` exists and conforms to variant-manifest schema
4. `demo/figma/carbon-button-spec.json` exists with extracted Figma data
5. `demo/button/carbon/Button.tsx` exists as a React + CVA component
6. `demo/button/carbon/Button.stories.tsx` exists in CSF factories format
7. `demo/button/carbon/fault/button-token-fault.json` exists with one modified token
8. `.d2c/status-registry.json` exists with Button component in "build" status
9. Button.tsx has CVA variants for kind (7 values), size (5 values), disabled
10. The seeded fault modifies exactly one token value from the original

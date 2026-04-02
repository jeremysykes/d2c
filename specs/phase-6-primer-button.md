# Phase 6 — Primer Button Demo

## Purpose

Second demo component: GitHub Primer Design System's Button. Demonstrates d2c against a different design system with different variant naming, token format (JSON5/DTCG-native), and color palette. Exercises the same phases as Carbon but proves the skill is design-system-agnostic.

---

## Inputs

- **Figma file**: Primer community file (URL TBD — Jeremy to provide copy)
- **Token source**: `TOKEN_SOURCE=presourced` (Primer primitives, DTCG-compatible)
- **Framework**: `--framework react` (default)

---

## Outputs

### 1. Pre-sourced DTCG token file

`demo/button/primer/tokens/button.tokens.json`

**Color tokens** (Light theme):
- `color.button.primary.background` → #1f883d (green — success emphasis)
- `color.button.primary.hover` → #1c8139
- `color.button.primary.active` → #197935
- `color.button.default.background` → #f6f8fa
- `color.button.default.hover` → #eff2f5
- `color.button.danger.background` → #f6f8fa (rest), hover → #cf222e
- `color.button.danger.foreground` → #d1242f
- `color.button.invisible.background` → transparent
- `color.text.primary` → #25292e
- `color.text.on-emphasis` → #ffffff

**Spacing tokens**: sm (28px), md (32px), lg (40px)

**Typography tokens**: font-family (-apple-system, BlinkMacSystemFont, "Segoe UI", etc.), font-size 14px

### 2. Variant manifest

`.variant-authority/primer-button.manifest.json`

- 4 variants: variant (5 values: default, primary, danger, outline, invisible), size (3: sm, md, lg), block (boolean), disabled (boolean)
- 2 slots: label (required), leadingVisual (optional)

### 3. Component + stories + fault + registry update

Same artifact pattern as Phase 5.

---

## Edge cases

1. **Primer primary is green, not blue**: Unlike most design systems, Primer's primary button is green (success emphasis). The token file must reflect this accurately.
2. **Outline variant hover changes foreground AND background**: At rest, outline is light bg + blue text. On hover, it flips to blue bg + white text. Both states must be in tokens.
3. **Danger variant also flips on hover**: Rest is light bg + red text, hover is red bg + white text.
4. **System font stack**: Primer uses a system font stack, not a custom font. The DTCG fontFamily token contains the full stack.
5. **Primer uses JSON5 natively**: Their token source is already DTCG-like. Our pre-sourced file is a simplified extraction, not a format conversion.

---

## Acceptance criteria

1. `demo/button/primer/tokens/button.tokens.json` exists and is valid DTCG JSON
2. `demo/button/primer/tokens/TOKEN_SOURCE_README.md` exists
3. `.variant-authority/primer-button.manifest.json` exists with variant (5 values), size (3 values)
4. `demo/figma/primer-button-spec.json` exists
5. `demo/button/primer/Button.tsx` exists as a React + CVA component
6. `demo/button/primer/Button.stories.tsx` exists
7. `demo/button/primer/fault/button-token-fault.json` exists with one modified token
8. `.d2c/status-registry.json` has PrimerButton component in "build" status
9. Primary button uses green (#1f883d), not blue
10. Component has 5 variant values: default, primary, danger, outline, invisible

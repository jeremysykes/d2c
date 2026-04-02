# Phase 7 — Polaris Button Demo

## Purpose

Third demo component: Shopify Polaris Design System's Button. Demonstrates d2c against a design system that uses a compound variant+tone API pattern rather than a single variant enum. Exercises the same phases but proves the skill handles different variant modeling approaches.

---

## Inputs

- **Figma file**: Polaris community file (URL TBD)
- **Token source**: `TOKEN_SOURCE=presourced` (Polaris token values from @shopify/polaris-tokens)
- **Framework**: `--framework react` (default)

---

## Outputs

Same artifact pattern as Phase 5/6. Key Polaris-specific details:

### Variant manifest

- **variant**: primary, secondary, tertiary, plain, monochromePlain (5 values)
- **tone**: default, success, critical (3 values — Polaris separates color treatment from visual style)
- **size**: micro, slim, medium, large (4 values)
- **fullWidth**: boolean
- **disabled**: boolean
- 2 slots: label (required), icon (optional)

### Color tokens (Light theme)

Polaris uses semantic CSS custom properties. Resolved values:
- Primary bg: #303030 (dark gray/near-black — Polaris brand)
- Primary hover: #1a1a1a
- Primary text: #ffffff
- Secondary bg: #e3e3e3
- Critical bg: #e51c00
- Critical hover: #c41400
- Success bg: #29845a
- Plain bg: transparent
- Text primary: #303030
- Text on fill: #ffffff

---

## Acceptance criteria

1. `demo/button/polaris/tokens/button.tokens.json` exists and is valid DTCG JSON
2. `demo/button/polaris/tokens/TOKEN_SOURCE_README.md` exists
3. `.variant-authority/polaris-button.manifest.json` exists with variant (5), tone (3), size (4)
4. `demo/figma/polaris-button-spec.json` exists
5. `demo/button/polaris/Button.tsx` exists as React + CVA
6. `demo/button/polaris/Button.stories.tsx` exists
7. `demo/button/polaris/fault/button-token-fault.json` exists with one modified token
8. `.d2c/status-registry.json` has PolarisButton in "build" status
9. Primary button is dark (#303030), not blue or green
10. Component handles the variant+tone compound pattern

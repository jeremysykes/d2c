# Button Changelog

## 0.1.0-alpha.2 (2026-04-06)

**Promoted**: validate → alpha

**Validation**: Passed deterministic structural gate (redesigned validate phase)
- Structural: 0 mismatches — all 11 computed CSS properties match manifest tokens
- Token delta: 0/14 mismatches

**Bug fix**: Vertical text alignment
- Text was top-aligned in center-aligned sizes (xs, sm, md, lg, expressive) due to `flex-col` on default type
- Fix: added `justify-center` to center-aligned size variants
- Structural gate caught this on first validate run, blocked advancement until fixed

**Validate phase redesign**:
- Pixel diff and region diff gates removed (non-deterministic)
- Replaced with structural gate: Playwright extracts computed CSS, compares against manifest tokens
- Gate catches exact property mismatches (font, color, alignment, spacing)

---

## 0.1.0-alpha.1 (2026-04-06)

**Promoted**: validate → alpha

**Variant surface** (from live Figma MCP extraction):
- 7 style variants: primary, secondary, tertiary, ghost, danger-primary, danger-tertiary, danger-ghost
- 7 size variants: xs, sm, md, lg, xl, 2xl, expressive
- 2 type variants: default (text + icon), icon-only
- disabled state (boolean)

**Slots**: label (required), icon (optional, 16x16)

**Tokens**: 14 tokens bound (7 color, 3 spacing, 4 typography)

**Validation gates**:
- Pixel diff: 0.0% (baseline established)
- Region diff: 0 px²
- Token delta: 0/14 mismatches

**Token source**: presourced DTCG (auto resolution — Carbon open-source)

**Changes from previous version**:
- Added `xs` (extra small) and `expressive` size variants from Figma
- Re-extracted from live Figma MCP (previously used static extraction)
- Cleared deprecation (Button was deprecated in favor of ActionButton for retire demo; re-extracted clean)

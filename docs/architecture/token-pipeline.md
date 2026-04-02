# Token Pipeline Architecture

## Overview

The d2c token pipeline transforms design tokens from their source format into consumable CSS custom properties and TypeScript exports. It handles three design systems with different native token formats, normalizing them through a common DTCG JSON intermediate layer.

```
Source (varies per system)
  → DTCG JSON (normalized intermediate)
  → Style Dictionary transform
  → CSS custom properties (per system, prefixed)
  → TypeScript token exports
  → CVA variant definitions
```

## Token source resolution

The `TOKEN_SOURCE` environment variable controls where token values come from:

| Value | Behavior |
|---|---|
| `auto` (default) | Check for Tokens Studio export first, fall back to pre-sourced DTCG files |
| `tokens-studio` | Require Tokens Studio export — error if not found |
| `presourced` | Use committed DTCG JSON files from open-source repos |

### Tokens Studio path (primary)

```
Figma Variables
  → Tokens Studio plugin (manual export)
  → DTCG JSON in demo/{system}/tokens/
```

Tokens Studio reads Variables from Figma regardless of plan tier and exports them as DTCG-compatible JSON. This is an industry-standard approach used by Shopify, GitHub, and other design system teams.

Setup: https://tokens.studio/

### Pre-sourced path (fallback)

```
Open-source design system repo
  → Extract token values manually
  → Commit as DTCG JSON to demo/{system}/tokens/
```

Pre-sourced files are committed to the repo and work out of the box for any reviewer. They are sourced from:

| System | Source |
|---|---|
| Carbon | `@carbon/colors`, `@carbon/themes`, `@carbon/layout`, `@carbon/type` |
| Primer | `@primer/primitives` (JSON5/DTCG-native) |
| Polaris | `@shopify/polaris-tokens` (CSS custom properties, resolved) |

## Style Dictionary transform

The transform pipeline (`scripts/build-tokens.ts`) processes each system independently:

1. Read DTCG JSON from `demo/button/{system}/tokens/button.tokens.json`
2. Apply the `css` transform group (color format, dimension units)
3. Prefix with system namespace (`--cds-`, `--primer-`, `--polaris-`)
4. Output CSS custom properties to `demo/button/{system}/tokens/generated/variables.css`
5. Output TypeScript exports to `demo/button/{system}/tokens/generated/tokens.js`

Run the pipeline: `npm run build-tokens`

## Output format

### CSS custom properties

```css
:root {
  --cds-color-button-primary-background: #0f62fe;
  --cds-spacing-button-height-lg: 48px;
  --cds-typography-button-font-family: 'IBM Plex Sans';
}
```

### TypeScript exports

```typescript
export const CdsColorButtonPrimaryBackground = "#0f62fe";
export const CdsSpacingButtonHeightLg = "48px";
```

## Enterprise upgrade path

If you have an Enterprise Figma account, a `TOKEN_SOURCE=figma-api` option is reserved for future implementation. This would read Variable values directly from the Figma REST API endpoints:

- `GET /v1/files/:key/variables/local`
- `GET /v1/files/:key/variables/published`

This is not implemented. The current pipeline works on any Figma plan.

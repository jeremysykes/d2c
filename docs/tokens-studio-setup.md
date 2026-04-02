# Tokens Studio Setup Guide

## Overview

[Tokens Studio](https://tokens.studio/) is a Figma plugin that reads Variables and Styles from a Figma file and exports them as DTCG-compatible JSON. It is the primary token extraction method for d2c when `TOKEN_SOURCE=tokens-studio` or `TOKEN_SOURCE=auto`.

The free tier is sufficient for d2c's needs.

## Installation

1. Open Figma
2. Go to **Plugins → Browse plugins**
3. Search for "Tokens Studio for Figma"
4. Or install directly: https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma
5. Click **Install**

## Initial setup

### 1. Open the plugin

In your Figma file, go to **Plugins → Tokens Studio for Figma**.

### 2. Connect to the project

Tokens Studio supports multiple sync providers. For d2c, use **Local / JSON** export:

1. In the plugin, click the **Settings** gear icon
2. Under **Token storage**, select **Local document**
3. This stores tokens within the Figma file itself

### 3. Map Variable collections to token sets

Tokens Studio reads Figma Variables and maps them to token sets:

1. Click **Import Variables** in the plugin
2. Select the Variable collections you want to import
3. Each collection becomes a token set
4. Review the imported tokens — verify names and values are correct

### 4. Export to JSON

1. Click the **Export** button (or use the kebab menu → Export)
2. Select **JSON** format
3. Choose DTCG format if prompted
4. Save the file to `demo/button/{system}/tokens/button.tokens.json`

## File placement

Export tokens to the correct directory per design system:

```
demo/
  button/
    carbon/tokens/button.tokens.json    ← Carbon tokens
    primer/tokens/button.tokens.json    ← Primer tokens
    polaris/tokens/button.tokens.json   ← Polaris tokens
```

## Expected DTCG format

The exported JSON should follow the DTCG format with `$type` and `$value` fields:

```json
{
  "color": {
    "button": {
      "primary": {
        "background": {
          "$type": "color",
          "$value": "#0f62fe"
        }
      }
    }
  }
}
```

## Mapping Figma Variable names to DTCG paths

| Figma Variable | DTCG path | Convention |
|---|---|---|
| `button/primary` | `color.button.primary.background` | Category → component → variant → property |
| `text/on-color` | `color.text.on-color` | Category → role |
| `spacing/button-height-lg` | `spacing.button.height.lg` | Category → component → property → size |

Tokens Studio may use different naming conventions depending on how Variables are named in the Figma file. Adjust the export to match the DTCG paths used in the variant manifest.

## Troubleshooting

### Variables not appearing in plugin

- Ensure you have **Editor** access on the file (Viewer access cannot read Variables in the plugin)
- Check that Variables exist in the file (some community files use Styles instead of Variables)
- Try closing and reopening the plugin

### Token values don't match Figma

- Tokens Studio reads the **current mode** of each Variable collection
- Switch to the correct mode (e.g., "Light" theme) before exporting
- Check for Variable aliases — Tokens Studio resolves aliases to final values

### Export format is not DTCG

- In Tokens Studio settings, ensure the export format is set to **W3C / DTCG**
- If using an older version of Tokens Studio, update the plugin
- You can manually convert the output — the key difference is `$type`/`$value` vs `type`/`value`

## After export

After exporting tokens, run the token pipeline to generate CSS custom properties:

```bash
npm run build-tokens
```

This transforms the DTCG JSON into:
- CSS custom properties at `demo/button/{system}/tokens/generated/variables.css`
- TypeScript exports at `demo/button/{system}/tokens/generated/tokens.js`

## References

| Resource | URL |
|---|---|
| Tokens Studio website | https://tokens.studio/ |
| Figma plugin | https://www.figma.com/community/plugin/843461159747178978 |
| DTCG format specification | https://tr.designtokens.org/format/ |
| Style Dictionary | https://styledictionary.com/ |

# Token Source: Shopify Polaris Design System

## Source

These token values are sourced from the Shopify Polaris Design System.

## Origin packages

| Token category | Package | Source |
|---|---|---|
| Tokens | `@shopify/polaris-tokens` | https://github.com/Shopify/polaris/tree/main/polaris-tokens |
| Components | `@shopify/polaris` | https://github.com/Shopify/polaris |

## Theme

All color values are from the **Light** theme (default Polaris theme).

## Polaris version

- Polaris (latest)
- Token values last verified: 2026-04-01

## Format

Polaris uses semantic CSS custom properties (`--p-color-*`). This file resolves those variables to their computed hex values in the Light theme and formats them as DTCG JSON.

## Notes

- Polaris uses a compound variant+tone API: `variant` controls visual style, `tone` controls color treatment (success, critical)
- Primary button is dark (#303030), reflecting Shopify's brand identity
- Font weight 550 is Polaris-specific (Inter variable font)

## How to refresh

1. Check latest Polaris release at https://github.com/Shopify/polaris/releases
2. Inspect resolved CSS custom property values in the Polaris Storybook
3. Update `button.tokens.json` with any changed values
4. Update the "last verified" date above

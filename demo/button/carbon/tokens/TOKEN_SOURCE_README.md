# Token Source: IBM Carbon Design System

## Source

These token values are sourced from the IBM Carbon Design System open-source repositories on GitHub. They are not extracted from Figma — they are pre-sourced DTCG JSON files.

## Origin packages

| Token category | Carbon package | Source |
|---|---|---|
| Colors | `@carbon/colors` | https://github.com/carbon-design-system/carbon/tree/main/packages/colors |
| Themes | `@carbon/themes` | https://github.com/carbon-design-system/carbon/tree/main/packages/themes |
| Spacing/Layout | `@carbon/layout` | https://github.com/carbon-design-system/carbon/tree/main/packages/layout |
| Typography | `@carbon/type` | https://github.com/carbon-design-system/carbon/tree/main/packages/type |

## Theme

All color values are from the **White** theme (`@carbon/themes/src/white.js`).

## Carbon version

- Carbon v11
- Token values last verified: 2026-04-01

## Format

The original Carbon tokens are defined in SCSS and JavaScript. This file transforms them into DTCG (Design Token Community Group) JSON format per the specification at https://tr.designtokens.org/format/.

## How to refresh

1. Check the latest Carbon release at https://github.com/carbon-design-system/carbon/releases
2. Cross-reference token values against the packages listed above
3. Update `button.tokens.json` with any changed values
4. Update the "last verified" date above

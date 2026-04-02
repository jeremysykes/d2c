# Token Source: GitHub Primer Design System

## Source

These token values are sourced from the GitHub Primer Design System open-source repositories.

## Origin packages

| Token category | Package | Source |
|---|---|---|
| Component tokens | `@primer/primitives` | https://github.com/primer/primitives/tree/main/src/tokens/component |
| Base colors | `@primer/primitives` | https://github.com/primer/primitives/tree/main/src/tokens/base |
| Functional colors | `@primer/primitives` | https://github.com/primer/primitives/tree/main/src/tokens/functional |

## Theme

All color values are from the **Light** theme.

## Primer version

- Primer Primitives (latest)
- Token values last verified: 2026-04-01

## Format

Primer natively uses JSON5 with DTCG-compatible structure in their primitives repo. This file is a simplified extraction of the button-specific tokens in standard JSON format.

## How to refresh

1. Check latest Primer Primitives at https://github.com/primer/primitives/releases
2. Reference `src/tokens/component/button.json5` for button-specific tokens
3. Resolve base color references against `src/tokens/base/` and `src/tokens/functional/`
4. Update `button.tokens.json` with any changed values
5. Update the "last verified" date above

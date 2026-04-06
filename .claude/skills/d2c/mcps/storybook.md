---
mcp: storybook
description: Storybook 10 MCP patterns — CSF factories, status badges, a11y testing
compatibility: [claude-code, cursor, codex-cli]
---

# Storybook MCP

The living documentation and test surface for d2c. Receives generated story files from the build phase, runs a11y audits and interaction tests during validate, and serves as the human-readable record of lifecycle status.

## Storybook 10 constraints

This project targets Storybook 10. Key constraints:

- **ESM-only**: All config files must use `import`/`export` syntax. No `require()`, no `module.exports`.
- **Node version**: 20.16+, 22.19+, or 24+ required
- **Empty addon packages**: `@storybook/addon-essentials`, `@storybook/addon-interactions`, `@storybook/addon-links` are empty packages in Storybook 10. Do not include them in dependencies.
- **CSF factories**: The preferred story format for TypeScript projects (see below)
- **`parameters.status`**: Used for lifecycle state display in the sidebar

Reference: https://storybook.js.org/docs/releases/migration-guide

## MCP addon

The Storybook MCP server is an addon, not a standalone server:

- **Package**: `@storybook/addon-mcp`
- **Install**: `npx storybook add @storybook/addon-mcp`
- **Local endpoint**: `http://localhost:6006/mcp`
- **Chromatic endpoint**: `https://main--<appid>.chromatic.com/mcp`

The addon exposes tools for:
- Story generation and preview
- Interaction test creation and execution
- Component metadata and API docs
- Accessibility checking

## URL configuration

The Storybook URL is configured via the `STORYBOOK_URL` environment variable:

- **Default**: `http://localhost:6006`
- **CI override**: Set to the deployed Storybook URL
- **Chromatic**: Set to the Chromatic published URL

## CSF factories format

Storybook 10 introduces CSF factories as the preferred TypeScript story format. d2c generates stories in this format:

```typescript
import { config } from '#.storybook/preview';
import { Button } from './Button';

const { story, meta } = config.meta({
  component: Button,
  title: 'Components/Button',
  parameters: {
    status: { type: 'beta' }  // lifecycle status
  }
});

export default meta;

export const Default = story({});

export const Info = story({
  args: { variant: 'info' }
});

export const Success = story({
  args: { variant: 'success' }
});

// ... one story per variant combination
```

Key differences from CSF3:
- `config.meta()` returns `{ story, meta }` destructured pair
- Stories use the `story()` factory function
- No explicit type annotations needed — types flow from `config.meta()`

## Lifecycle status display

The `parameters.status` field controls the status badge in the Storybook sidebar:

```typescript
parameters: {
  status: {
    type: 'alpha' | 'beta' | 'stable' | 'deprecated' | 'retired'
  }
}
```

d2c updates this field in the story file whenever the component's lifecycle status changes in the status registry. The mapping:

| Registry status | Storybook status |
|---|---|
| draft, design, build, validate | Not displayed (pre-ship) |
| alpha | `alpha` |
| beta | `beta` |
| stable | `stable` |
| deprecated | `deprecated` |
| retired | `retired` |
| blocked | Not changed (keeps previous) |

## Accessibility testing

The Storybook MCP provides a11y testing capabilities:

- Runs against WCAG 2.1 AA criteria
- Tests all rendered stories
- Reports violations with element selectors, rule names, and severity
- In d2c v1, a11y results are **advisory** — they are reported but do not gate lifecycle advancement
- Future versions may promote a11y to a required gate

## Interaction tests

Interaction tests verify component behavior:

- Click handlers, keyboard navigation, state changes
- Defined in the story file using the `play` function
- Executed via the Storybook MCP during validate phase
- In d2c v1, interaction test results are **advisory**

## Story generation rules

When generating stories from the variant manifest:

1. Create one story for each variant value (not every combination — that explodes for multi-variant components)
2. Create one "Default" story with all default values
3. Create one "AllVariants" story showing a grid of key combinations
4. Set `parameters.status` to the current lifecycle phase
5. Do not import `@storybook/addon-essentials` (empty in Storybook 10)
6. Use CSF factories format

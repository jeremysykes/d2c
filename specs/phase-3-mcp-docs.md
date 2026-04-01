# Phase 3 — MCP Docs

## Purpose

Document the tool call patterns, configuration, and usage boundaries for each MCP server that d2c depends on. These docs serve as reference for both the phase docs and for contributors who need to understand how d2c interacts with external systems.

Each MCP doc is a portable reference — it documents tool names, parameters, expected responses, and error handling patterns without using client-specific syntax.

---

## Inputs

None. These are reference documents derived from the MCP server capabilities and the constraints documented in the brief and Amendment 01.

---

## Outputs

All files written to `.claude/skills/d2c/mcps/`.

### 1. `figma.md`

Must document:
- **Available tools**: List all Figma MCP tools used by d2c (get_design_context, get_screenshot, get_metadata, use_figma)
- **Write preflight pattern**: The no-op PATCH pattern for testing actual write capability before any write phase
- **Variables API constraint**: Document that Variables endpoints are Enterprise-only (Amendment 01)
- **Pro plan capabilities**: What can be read/written on a Pro plan
- **Authentication**: FIGMA_ACCESS_TOKEN scope requirements
- **Rate limiting**: Figma API rate limits and how to handle them
- **Error patterns**: Common error responses (403, 404) and what they mean

### 2. `playwright.md`

Must document:
- **Viewport configuration**: Default 1440x900, locked for consistency
- **Three-threshold diff strategy**: pixel %, region px², token delta
- **Screenshot capture pattern**: Navigate to story URL, wait for render, capture
- **Baseline management**: How baselines are established, stored, and updated
- **Diff image generation**: How diff images are computed and stored
- **Browser configuration**: Chromium requirement, headless mode

### 3. `storybook.md`

Must document:
- **Storybook 10 constraints**: ESM-only, empty addon packages, CSF factories
- **MCP addon**: `@storybook/addon-mcp` at `/mcp` endpoint
- **Story generation patterns**: CSF factories format with variant combinations
- **Status badge**: `parameters.status` for lifecycle state display
- **A11y testing**: How accessibility audits are run via the MCP
- **Interaction tests**: How interaction tests are defined and executed
- **URL configuration**: STORYBOOK_URL environment variable

### 4. `variant-authority.md`

Must document:
- **Registry operations**: Read manifest, write manifest, query variants
- **Manifest location**: `.variant-authority/{component}.manifest.json`
- **Deprecation signal**: How deprecation is recorded in the manifest
- **Conflict detection**: How structural conflicts between Figma and CVA are identified
- **component-contracts dependency**: This MCP comes from the component-contracts package

### 5. `radix-primitives.md`

Must document:
- **Primitive capability map**: Which UI primitives are available
- **Component-to-primitive mapping**: How d2c maps a component to its Radix primitive
- **Framework support**: React (@radix-ui/react-*), Vue (@radix-vue)
- **component-contracts dependency**: This MCP comes from the component-contracts package

---

## Edge cases

1. **Figma MCP connected but token expired**: API calls return 401. Document the re-authentication pattern.
2. **Playwright viewport mismatch**: If a story sets its own viewport, the locked viewport should override. Document the override pattern.
3. **Storybook MCP not available but Storybook running**: The MCP addon may not be installed. Document how to verify addon presence.
4. **Variant Authority MCP not yet built**: component-contracts is in development. Document the requirement gate pattern.
5. **Radix primitive not available for component**: Not all components map to a Radix primitive. Document the fallback pattern.

---

## Acceptance criteria

1. All 5 MCP doc files exist at `.claude/skills/d2c/mcps/`
2. `figma.md` documents the write preflight pattern
3. `figma.md` documents the Variables API Enterprise-only constraint
4. `playwright.md` documents all three diff thresholds (pixel, region, token)
5. `playwright.md` documents the locked viewport configuration
6. `storybook.md` documents Storybook 10 ESM-only constraint
7. `storybook.md` documents CSF factories format
8. `storybook.md` documents `parameters.status` for lifecycle display
9. `variant-authority.md` references the component-contracts package
10. `radix-primitives.md` references the component-contracts package
11. No MCP doc uses client-specific syntax (portable format)

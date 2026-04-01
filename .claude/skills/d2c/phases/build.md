---
phase: build
description: Scaffold component code, run token pipeline, generate Storybook stories
compatibility: [claude-code, cursor, codex-cli]
---

# Build Phase

Scaffold the component implementation from the variant manifest, resolve and transform tokens, and generate Storybook story files.

## Required MCP servers

- **Figma MCP** — frame export for baseline screenshots
- **Storybook MCP** — story generation and preview

## Inputs

- `--component`: Target component name
- `--framework`: Scaffold target (react, vue, wc). Default: react
- `TOKEN_SOURCE` environment variable: Token extraction strategy (tokens-studio, presourced, auto)
- Variant manifest at `.variant-authority/{component}.manifest.json`

## Prerequisites

- Component must be in `"design"` status or later in the status registry
- Variant manifest must exist for the component

## Steps

### 1. Resolve token source

Apply the TOKEN_SOURCE resolution strategy:

**Strategy: `tokens-studio`**
- Look for Tokens Studio export at `demo/{component}/tokens/`
- If not found, error with instructions to run Tokens Studio export
- Do not fall back silently

**Strategy: `presourced`**
- Look for pre-sourced DTCG JSON at `demo/{component}/tokens/`
- If not found, error with instructions to source token files

**Strategy: `auto` (default)**
- Check for Tokens Studio export first
- If found, use it
- If not found, check for pre-sourced DTCG files
- If found, use them with a warning: "Using pre-sourced tokens. For live extraction, set up Tokens Studio."
- If neither found, error with instructions for both options

Record the resolution result per the `token-source.ts` schema.

### 2. Validate DTCG JSON

Validate the resolved token file against DTCG format:

- Verify top-level structure has `$type` and `$value` fields at token leaves
- Verify all token paths referenced in the variant manifest exist in the DTCG file
- Report any missing tokens as warnings (not errors — partial token coverage is acceptable for initial build)

### 3. Run Style Dictionary transform

Transform DTCG JSON into consumable formats:

- CSS custom properties
- Tailwind theme extension values
- TypeScript token type definitions

Output to `demo/{component}/tokens/generated/`.

### 4. Scaffold component code

Based on `--framework`:

**React (default):**
- Create `demo/{component}/{Component}.tsx`
- Import CVA and define variants from the variant manifest
- Map variant values to CSS custom properties from the token pipeline
- Create prop interface from variant definitions and slots
- Use Radix primitives where the component maps to a known primitive

**Vue:**
- Create `demo/{component}/{Component}.vue`
- Use `@radix-vue` for primitive layer
- Map CVA variants to Vue props

**Web Components:**
- Create `demo/{component}/{component}-element.ts`
- Use standard Custom Elements API
- Map variants to observed attributes

### 5. Generate Storybook stories

Create story file from the variant manifest:

- Generate a story for each variant combination
- Use CSF factories format (Storybook 10)
- Set `parameters.status` to current lifecycle phase
- Include all slot variations
- Do not import `@storybook/addon-essentials` (empty package in Storybook 10)

Output: `demo/{component}/{Component}.stories.tsx`

### 6. Generate seeded fault file (demo only)

For demo components, create a fault file with one intentionally changed token:

- Copy the token file
- Modify one token value (e.g., change a background color hex value)
- Write to `demo/{component}/fault/{component}-token-fault.json`
- This file is used to demonstrate drift detection in the maintain phase

### 7. Export Figma frames for baseline

Call Figma MCP to export the component's Figma frames as PNG:

- Export at the configured viewport size
- Save to `.d2c/diff-baseline/{component}/`
- These serve as the visual baseline for the validate phase

### 8. Update status registry

Update `.d2c/status-registry.json`:

- Set component status to `"build"`
- Record the phase transition in history

## Output artifacts

| Artifact | Location | Schema |
|---|---|---|
| Component code | `demo/{component}/{Component}.tsx` (or .vue/.ts) | — |
| Token types | `demo/{component}/tokens/generated/` | — |
| Story file | `demo/{component}/{Component}.stories.tsx` | — |
| Seeded fault | `demo/{component}/fault/{component}-token-fault.json` | — |
| Figma baseline | `.d2c/diff-baseline/{component}/` | — |
| Token resolution | logged to console | `token-source.ts` |
| Status registry | `.d2c/status-registry.json` | `status-registry.ts` |

## Failure modes

- **TOKEN_SOURCE=tokens-studio but no export found**: Error with Tokens Studio setup instructions. Link: https://tokens.studio/
- **TOKEN_SOURCE=auto with no sources**: Error listing both Tokens Studio and pre-sourced options
- **Variant manifest missing**: Error — run design phase first
- **Figma frame export fails**: Check FIGMA_ACCESS_TOKEN. Frame export uses GET /v1/images (available on all plans).
- **Storybook MCP not connected**: Story generation skipped with warning. Component code and tokens still generated.

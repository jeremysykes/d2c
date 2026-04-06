# d2c — Project Brief for Claude Code

> This document is the authoritative brief for building the `d2c` Claude Code skill.
> Claude Code must read this entire document before taking any action.
> Do not skip sections. Do not make assumptions where a decision gate is specified.

---

## Project overview

`d2c` is a spec-first, lifecycle-aware Claude Code skill that manages the full UI component lifecycle across four MCP servers: Figma, Storybook, Playwright, and the two servers in `component-contracts` (Variant Authority and Radix Primitives). It covers six phases: Design → Build → Validate → Ship → Maintain → Retire.

The skill is invoked per-component from any MCP-compatible agent (Claude Code, Cursor, Codex CLI) and produces inspectable artifacts at every phase that document the component's lifecycle state.

The public README for `d2c` is the canonical product specification. It lives at `README.md` in the repo root and is the source of truth for what this skill does, how it works, and how to test it. Claude Code must treat the README as a requirements document, not just documentation.

---

## Repository structure

```
d2c/
  README.md                          ← Product spec (authoritative)
  .env.example                       ← Required environment variables
  package.json
  tsconfig.json
  vite.config.ts                     ← Vite config with Tailwind CSS plugin
  sd.config.ts                       ← Style Dictionary token transform config

  .claude/
    skills/
      d2c/
        SKILL.md                     ← Skill entry point
        phases/
          design.md
          build.md
          validate.md
          ship.md
          maintain.md
          retire.md
        mcps/
          figma.md
          playwright.md
          storybook.md
          variant-authority.md
          radix-primitives.md
        schemas/
          variant-manifest.ts
          status-registry.ts
          drift-report.ts
          diff-result.ts
          batch-report.ts
          token-source.ts            ← Token extraction strategy (Amendment 01)
        config/
          defaults.ts
          thresholds.ts

  .storybook/
    main.ts                          ← Storybook 10 ESM config
    preview.ts

  scripts/
    build-tokens.ts                  ← Style Dictionary token pipeline

  docs/
    amendments/
      AMENDMENT-01-figma-plan-constraints.md
    architecture/
      figma-api-boundaries.md
      token-pipeline.md

  demo/
    button/
      carbon/                        ← IBM Carbon Button
        consumers/
          example-consumer.tsx       ← Seeded consumer for retire gate demo
        fault/
          button-token-fault.json    ← Seeded drift for maintain demo
      primer/                        ← GitHub Primer Button
      polaris/                       ← Shopify Polaris Button
    figma/
      carbon-button-spec.json
      primer-button-spec.json
      polaris-button-spec.json
    scopes/
      all-buttons.json               ← Batch mode scope manifest

  .variant-authority/
    button.manifest.json
    primer-button.manifest.json
    polaris-button.manifest.json

  .d2c/
    status-registry.json
    drift-report.json
    diff-baseline/
    diff-results/
    changelogs/
    migration-guides/
    batch-reports/

  specs/                             ← Spec-first: one file per feature
  context/                           ← Context docs: one file per feature
  tests/                             ← Tests: one file per feature

  .github/
    workflows/
      storybook.yml                  ← Build + deploy to GitHub Pages
      validate.yml                   ← CI validation on PR
```

---

## Development philosophy — spec-first

This project follows **spec-first development**. This is a hard constraint, not a preference.

For every feature, Claude Code must complete these steps in order:

### Step 1 — Spec
Write `specs/{feature-name}.md` containing:
- Purpose: what this feature does and why it exists
- Inputs: all parameters, their types, and valid ranges
- Outputs: all artifacts produced, their locations, and their schemas
- Edge cases: at minimum five edge cases with expected behavior
- Acceptance criteria: explicit, testable statements of done

### Step 2 — Tests
Write `tests/{feature-name}.test.ts` containing:
- Unit tests covering all acceptance criteria from the spec
- Tests must fail against a non-existent implementation (red state)
- Tests must cover at least three edge cases from the spec
- Test file must import from the implementation path even though the implementation does not yet exist

### Step 3 — Context
Write `context/{feature-name}.md` containing:
- Which MCP servers are involved and which tools are called
- Which external APIs are touched (Figma REST, Storybook, etc.)
- Which schemas are read or written
- Which other features or phases this feature depends on
- Any library-specific context retrieved via Context7 MCP

### Step 4 — Approval gate
Present the spec, tests, and context document for review.
**Do not write implementation code until you receive explicit approval.**
The approval keyword is: `APPROVED`

### Step 5 — Implementation
Write the implementation. Every implementation file must have a corresponding spec and test file. There are no exceptions.

### Step 6 — Review gate
Present the completed implementation for review.
**Do not advance to the next feature until you receive explicit sign-off.**
The sign-off keyword is: `LGTM`

---

## Gate types

Claude Code will encounter four types of gates during this project. All gates are hard stops.

### Requirement gate
Claude needs something from Jeremy that cannot be inferred or generated.
- State exactly what is needed
- State why it is needed
- State what format it should be in
- Wait. Do not proceed until the requirement is provided.

*Examples: Figma file URL, personal access token, confirmation that Figma Variables have been bound, Chromatic project token*

### Approval gate
Claude has completed spec + tests + context and is ready to implement.
- Present all three documents
- Summarize what the implementation will do
- Wait for `APPROVED`
- Do not write implementation code before receiving it

### Review gate
Claude has completed an implementation.
- Present what was built
- List which acceptance criteria are now passing
- Surface any deviations from the spec and explain why
- Wait for `LGTM` or feedback
- Do not advance to the next feature before receiving it

### Decision gate
Claude has encountered an architectural ambiguity that cannot be resolved from the brief.
- Describe the ambiguity precisely
- Present two or three options with explicit tradeoffs
- Make a recommendation and explain the reasoning
- Wait for a decision
- Do not make an assumption and proceed

---

## MCP dependencies

### Required MCP servers

Claude Code must verify all MCP servers are connected at project start using `mcp list`. If any server is missing, surface a requirement gate immediately.

| Server | Package | Purpose |
|---|---|---|
| `figma` | Figma official MCP | Design extraction, variant reading, write-back |
| `playwright` | `playwright-skill` | Visual regression, screenshot capture, diff |
| `storybook` | Storybook MCP | Story generation, a11y testing, status sync |
| `variant-authority` | `component-contracts` | CVA registry read/write |
| `radix-primitives` | `component-contracts` | Primitive capability map |
| `sequential-thinking` | Sequential Thinking MCP | Multi-step architectural reasoning |
| `context7` | Context7 MCP | Live library documentation retrieval |

### MCP usage rules

**Context7** must be invoked before implementing any feature that calls an external library API. Do not rely on training data for API signatures. Retrieve current documentation first.

**Sequential Thinking** must be invoked before designing any cross-phase logic, any conflict resolution flow, or any schema that will be read by more than one phase.

**Figma MCP** — before any phase that writes to Figma, run the write preflight check. See `mcps/figma.md` for the preflight pattern. Never attempt a Figma write without a successful preflight.

---

## Skill compatibility

The `SKILL.md` and all phase/mcp documentation files must be written in the portable `SKILL.md` format compatible with:

- Claude Code (primary)
- Cursor
- Codex CLI

**Rules for portable skill files:**
- No Claude Code-specific syntax in instruction language
- Include `compatibility` frontmatter listing supported clients
- Use only standard MCP tool calling patterns
- Do not reference Claude Code-specific paths or commands
- Test invocation patterns must be documented for each client in the README

---

## Configuration flags

All flags must be implemented with these exact names and defaults. No deviations without a decision gate.

| Flag | Default | Type | Description |
|---|---|---|---|
| `--component` | required | `string` | Target component name |
| `--phase` | optional | `string` | Single phase to run |
| `--run-all` | `false` | `boolean` | Run all phases in sequence |
| `--truth-structure` | `cva` | `figma \| cva` | Authority for variant names, slots, prop types |
| `--truth-visual` | `figma` | `figma \| cva` | Authority for tokens, spacing, visual spec |
| `--truth-conflict-strategy` | `escalate` | `escalate \| figma-wins \| cva-wins` | Conflict resolution when authority is ambiguous |
| `--diff-threshold-pixel` | `0.1` | `number` | Max % of changed pixels |
| `--diff-threshold-region` | `15` | `number` | Max contiguous changed region in px² |
| `--diff-threshold-token` | `0` | `number` | Token mismatches allowed. Hard zero, no override. |
| `--viewport` | `1440x900` | `string` | Locked Playwright viewport |
| `--figma-write-preflight` | `true` | `boolean` | Preflight check before any Figma write |
| `--framework` | `react` | `react \| vue \| wc` | Scaffold target framework |
| `--scope` | optional | `string` | Batch mode: component tier or manifest path |
| `--force-retire` | `false` | `boolean` | Override zero-usage removal gate |
| `--justification` | required if `--force-retire` | `string` | Logged justification for forced retirement |
| `--preflight-only` | `false` | `boolean` | Run preflight checks only, no phase execution |

---

## Batch mode behavior

When `--scope` is provided:

1. Read the scope manifest to get the list of components
2. Run the specified phase (or all phases) for each component in sequence
3. Each component's lifecycle state is independent — a failure in one does not affect others
4. Never halt on failure — continue to the next component and record the failure
5. On completion, write `.d2c/batch-reports/{timestamp}-batch-report.json`
6. Print a summary table to terminal
7. Exit with code `1` if any component failed (CI catches this)
8. Failed components are flagged as `blocked` in `status-registry.json`
9. Blocked components cannot advance lifecycle status until the failure is resolved

Batch failure does not roll back successful components. Each component's state is independently owned.

---

## Demo: three Figma files

The POC demo runs against three Button components sourced from public design systems.

### Figma file setup (requirement gate — Jeremy provides)

Before the build phase can run, Jeremy must:
1. Duplicate each community file to his Figma drafts
2. Isolate the Button component to its own page
3. Convert any hardcoded style values to Figma Variables

Claude Code's role in this process:
1. Use Figma MCP to extract the component structure from each file
2. Generate a variable-binding checklist for each file — list every token that needs a Figma Variable, its current hardcoded value, and the suggested variable name
3. Surface a requirement gate asking Jeremy to complete the variable bindings
4. After Jeremy confirms, run the preflight check to verify bindings
5. Proceed to the build phase only after all three files pass preflight

### Design system sources

| System | Community file | Notes |
|---|---|---|
| IBM Carbon | [Figma Community](https://www.figma.com/community/file/1157761560874207208) | Button component |
| GitHub Primer | [Figma Community](https://www.figma.com/community/file/1385590547343089046) | Button |
| Shopify Polaris | [Figma Community](https://www.figma.com/community/file/1293611962095941078) | Button |

Claude Code must surface a requirement gate when it needs the duplicated file URLs from Jeremy. Do not proceed with extraction until URLs are provided.

---

## Environment variables

Claude Code must generate `.env.example` with exactly these variables and comments:

```bash
# Figma personal access token
# Generate at: https://www.figma.com/settings → Security → Personal access tokens
# Required scope: File content (read), Library assets (read), Variables (read/write)
FIGMA_ACCESS_TOKEN=

# Figma file URLs for each demo
# Provide after duplicating community files to your Figma drafts
FIGMA_FILE_CARBON=
FIGMA_FILE_PRIMER=
FIGMA_FILE_POLARIS=

# Chromatic project token (for Storybook visual testing, optional)
# Get from: https://www.chromatic.com → Project → Manage → Tokens
CHROMATIC_PROJECT_TOKEN=

# Storybook URL (local dev default, override for CI)
STORYBOOK_URL=http://localhost:6006
```

The `.env.example` comment for `FIGMA_ACCESS_TOKEN` must include the exact URL:
`https://www.figma.com/settings → Security → Personal access tokens`

---

## Amendment 01 — Figma plan constraints

The Figma Variables REST API is Enterprise-only. This amendment documents the token extraction strategy for Pro plan users.

### Token source strategy

The `TOKEN_SOURCE` environment variable controls token extraction:

| Value | Behavior |
|---|---|
| `auto` (default) | Uses Tokens Studio export if present, falls back to pre-sourced DTCG files |
| `tokens-studio` | Requires Tokens Studio export — errors if not found |
| `presourced` | Uses committed DTCG JSON files from open-source repos |

### Additional schema

Phase 1 includes a 6th schema: `token-source.ts` — defines the `TokenSource` type and `TokenResolutionResult` interface for token extraction strategy resolution.

### Additional build infrastructure

- `sd.config.ts` — Style Dictionary configuration for DTCG → CSS/TypeScript token transforms
- `scripts/build-tokens.ts` — Token pipeline build script
- `vite.config.ts` — Vite configuration with Tailwind CSS plugin

---

## GitHub Actions

### Storybook deployment (`storybook.yml`)
- Trigger: push to `main`
- Steps: install → build Storybook → deploy to `gh-pages` branch
- Output: Storybook public URL printed as workflow summary
- Node version: 22.19+ (required for Storybook 10 ESM-only)

### Validation CI (`validate.yml`)
- Trigger: pull request
- Steps: install → run tests → run Playwright diff → check status registry consistency
- Exit code: 1 if any component is in `blocked` state
- Node version: 22.19+

---

## Storybook 10 compatibility

This project targets Storybook 10. Before implementing any Storybook-related feature:

1. Use Context7 to retrieve current Storybook 10 documentation
2. Use the official migration guide: `https://storybook.js.org/docs/releases/migration-guide`

**Key Storybook 10 constraints:**
- ESM-only: all config files must use ESM syntax, not CommonJS
- Node 20.16+, 22.19+, or 24+ required
- `@storybook/addon-essentials`, `@storybook/addon-interactions`, `@storybook/addon-links` are empty packages — do not include them
- CSF factories are the preferred story format for TypeScript projects
- `parameters.status` is used for lifecycle state display in the sidebar

---

## Framework-agnostic scaffolding

The build phase must support three frameworks via `--framework`:

| Flag value | Scaffold target | Notes |
|---|---|---|
| `react` | React + TypeScript + CVA | Default |
| `vue` | Vue 3 + TypeScript + CVA | Use `@radix-vue` for primitive layer |
| `wc` | Web Components + TypeScript | Use `@radix-ui/primitives` where available |

Before implementing Vue or Web Components scaffolding:
1. Use Context7 to retrieve current `@radix-vue` documentation
2. Use Context7 to retrieve current Web Components MCP/API documentation
3. Document framework-specific patterns in `context/framework-{name}.md`

---

## Webhook drift detection — infrastructure note

The maintain phase in `d2c` detects drift by invocation — `/d2c --phase maintain` checks current state on demand. Continuous drift detection (Figma changes automatically triggering re-validation) requires a persistent webhook listener for Figma file change events.

**This is infrastructure, not a skill.** It is intentionally out of scope for `d2c`.

The README must include a dedicated "Webhook drift detection" section that:
- Explains clearly why this is an infrastructure concern and not a skill concern
- Describes what a companion service architecture would look like
- Links to Figma webhook documentation: `https://www.figma.com/developers/api#webhooks_v2`
- Does not present this as a gap or limitation — present it as a deliberate architectural boundary

Do not implement a polling workaround. The on-demand invocation model is correct for a skill.

---

## component-contracts dependency

`component-contracts` is a peer dependency of `d2c`. It provides the `variant-authority` and `radix-primitives` MCP servers.

Repository: `https://github.com/jeremysykes/component-contracts`

During development, reference `component-contracts` as a local path dependency until it is published:

```json
{
  "dependencies": {
    "component-contracts": "file:../component-contracts"
  }
}
```

When `component-contracts` is not yet available, surface a requirement gate. Do not mock the MCP servers inline — the dependency is real and must be installed.

---

## Seeded fault for demo

After the Button build phase completes, Claude Code must generate a seeded fault file at:

```
demo/button/carbon/fault/button-token-fault.json
```

This file contains a modified version of `button.tokens.json` with one token value intentionally changed. It is used in step 6 of the README "Try it yourself" section. The README instructs reviewers to copy this file over `button.tokens.json` to trigger the drift detection demo.

Claude Code must generate this fault file automatically as part of the build phase — it is not a manual step.

---

## Build sequence

Claude Code must build this project in the following order. Do not skip ahead. Each item is a complete spec-first cycle (spec → tests → context → approval → implementation → review).

### Phase 0 — Project scaffolding
1. Repo structure and `package.json`
2. TypeScript configuration
3. `.env.example`
4. GitHub Actions workflows

### Phase 1 — Schemas
1. `variant-manifest.ts`
2. `status-registry.ts`
3. `drift-report.ts`
4. `diff-result.ts`
5. `batch-report.ts`

### Phase 2 — SKILL.md and phase docs
1. `SKILL.md` entry point (portable format, compatibility frontmatter)
2. `phases/design.md`
3. `phases/build.md`
4. `phases/validate.md`
5. `phases/ship.md`
6. `phases/maintain.md`
7. `phases/retire.md`

### Phase 3 — MCP docs
1. `mcps/figma.md` (including preflight pattern)
2. `mcps/playwright.md` (viewport config, three-threshold diff)
3. `mcps/storybook.md` (Storybook 10, CSF factories, status badge)
4. `mcps/variant-authority.md`
5. `mcps/radix-primitives.md`

### Phase 4 — Configuration
1. `config/defaults.ts`
2. `config/thresholds.ts`

### Phase 5 — Demo: Carbon Button
1. Figma extraction → variable-binding checklist → requirement gate
2. Build phase execution
3. Validate phase execution
4. Seeded fault file generation

### Phase 6 — Demo: Primer Button
Same sequence as Phase 5.

### Phase 7 — Demo: Polaris Button
Same sequence as Phase 5.

### Phase 8 — Batch mode
1. Batch runner logic
2. Batch report schema
3. CI integration

### Phase 9 — Retire phase demo
Button → ActionButton deprecation scenario.

### Phase 10 — README finalization
Verify all links, Storybook URL, and live demo references are accurate.

---

## First action

Before doing anything else:

1. Run `mcp list` and report which servers are connected
2. Confirm Node version meets Storybook 10 requirements (22.19+)
3. If any required MCP server from the table above is missing, surface a requirement gate immediately — list which servers are missing and what the install command is for each
4. If all servers are connected, confirm readiness and ask Jeremy to say `BEGIN` to start Phase 0

Do not start Phase 0 until Jeremy says `BEGIN`.

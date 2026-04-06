# d2c — Design-to-code lifecycle skill

> A Claude Code skill that manages the full UI component lifecycle across Figma, Storybook, Playwright, and a Variant Authority registry — from first design token to final deprecation.

---

## The problem it solves

Design systems drift because the handoff between Figma and code is manual, one-directional, and undocumented. A designer renames a token, a developer ships a prop change, a component quietly diverges from its spec — and nobody finds out until a visual regression or a frustrated consumer files a bug. `d2c` makes that handoff bidirectional and automated: Figma changes propagate to code, code corrections propagate back to Figma, and nothing advances lifecycle status without passing three explicit validation gates. It also owns what happens *after* ship — staleness detection, consumer surface mapping, and a gated deprecation flow that blocks removal until usage is confirmed zero.

---

## What d2c is

`d2c` is a Claude Code skill — a `SKILL.md`-based instruction set that Claude reads at invocation time, giving it the context, phase logic, authority rules, and MCP tool patterns needed to act as a lifecycle operator across your design system. It is not a standalone CLI tool. It is not a framework. It is an opinionated, composable instruction layer that sits on top of four MCP servers and coordinates them across six lifecycle phases.

The skill is invoked per-component:

```bash
/d2c --component Button --phase build
/d2c --component Button --phase validate
/d2c --component Button --phase ship
```

Or run as a full pipeline:

```bash
/d2c --component Button --run-all
```

Or batch across multiple components:

```bash
/d2c --scope demo/scopes/all-buttons.json --phase validate
```

---

## Lifecycle phases

```
DESIGN  →  BUILD  →  VALIDATE  →  SHIP  →  MAINTAIN  →  RETIRE
```

| Phase | What happens | MCPs involved |
|---|---|---|
| **Design** | Figma component is extracted — variants, tokens, prop semantics. Variant Authority registry is seeded or synced. | Figma, Variant Authority |
| **Build** | Component code is scaffolded (props, slots, CVA variants). Token pipeline runs (DTCG → Style Dictionary → Tailwind). Storybook story templates are generated from the variant manifest. | Figma, Storybook |
| **Validate** | Three gates must pass: Playwright visual diff against Figma frames, token delta check, Storybook a11y + interaction tests. All three must clear before status can advance. | Playwright, Figma, Storybook |
| **Ship** | Status registry is updated (alpha → beta → stable), semver and changelog are generated, Figma component descriptions are updated with code-side corrections. | Figma, Variant Authority |
| **Maintain** | On-demand drift monitoring — Figma changes trigger re-validation when invoked. Consumer surface map tracks which products use the component and at what version. PR impact estimator flags breaking changes. | Figma, Playwright |
| **Retire** | Variant Authority emits a deprecation signal. Skill generates a codemod and migration guide. Removal gate blocks deletion until usage tracking confirms zero consumers. | Variant Authority, Storybook |

---

## Architecture

### MCP servers

`d2c` depends on four MCP servers. Each owns a distinct authority surface.

**Figma MCP**
The design authority. Source of truth for component structure, variant definitions, token bindings, and visual spec. Used in both directions — reading design state in the build phase, writing descriptions back in the ship phase. Requires Figma Editor access on the target file. Note: Variable *values* are extracted via Tokens Studio, not the Figma Variables REST API (see [Figma plan requirements](#figma-plan-requirements)).

**Component Variant Authority MCP**
The engineering contract layer. Stores the canonical variant manifest: which variants exist, what their allowed values are, what's deprecated, and what the migration path is. Enforces consistency between Figma variant names and code prop types. This is the tiebreaker when design and code conflict on structural decisions.

**Storybook MCP**
The living documentation and test surface. Receives generated story files from the build phase. Runs a11y audits and interaction tests during validate. Serves as the human-readable record of a component's lifecycle status via the `parameters.status` field in each story.

**Playwright MCP**
The visual truth layer. Screenshots rendered stories across a locked viewport (`1440×900`). Diffs against Figma frame exports and established baselines. Three-threshold diff strategy gates promotion from validate to ship.

### Skill file structure

```
.claude/skills/d2c/
  SKILL.md                    ← Entry point. Claude reads this at invocation.
  phases/
    design.md                 ← Figma extraction patterns
    build.md                  ← Scaffold + token pipeline logic
    validate.md               ← Gate sequencing and threshold enforcement
    ship.md                   ← Registry update + publish logic
    maintain.md               ← Drift detection + usage tracking
    retire.md                 ← Deprecation signal + removal gate
  mcps/
    figma.md                  ← Figma MCP tool call patterns and preflight
    playwright.md             ← Viewport config, diff strategy, baseline mgmt
    storybook.md              ← Story generation templates, test runner config
    variant-authority.md      ← Registry read/write patterns
    radix-primitives.md       ← Primitive capability map
  schemas/
    variant-manifest.ts       ← Shared contract between all phases
    status-registry.ts        ← Lifecycle state shape
    drift-report.ts           ← Drift detection output shape
    diff-result.ts            ← Playwright diff output shape
    batch-report.ts           ← Batch mode execution report
    token-source.ts           ← Token extraction strategy resolution
  config/
    defaults.ts               ← Default flag values
    thresholds.ts             ← Diff threshold constants
```

### Configuration flags

All flags can be set at invocation or stored in `.d2c/config.json` at the repo root.

| Flag | Default | Description |
|---|---|---|
| `--truth-structure` | `cva` | Authority for variant names, slots, prop types. `figma` or `cva`. |
| `--truth-visual` | `figma` | Authority for tokens, spacing, visual spec. `figma` or `cva`. |
| `--truth-conflict-strategy` | `escalate` | What to do when neither side is clearly right. `escalate` blocks and emits a diff report. `figma-wins` or `cva-wins` for automated resolution. |
| `--diff-threshold-token` | `0` | Token value mismatches allowed. Always zero — no override. |
| `--viewport` | `1440x900` | Locked viewport for all Playwright captures. |
| `--figma-write-preflight` | `true` | Attempt a no-op Figma write before any phase that requires write access. Fails fast with a clear error rather than mid-pipeline. |
| `--phase` | — | Target a single phase. Omit to run the full pipeline. |
| `--component` | — | Component name. Must match the Figma component key and the Variant Authority registry entry. |
| `--run-all` | `false` | Execute all phases in sequence. |
| `--scope` | — | Batch mode: path to a scope manifest JSON listing target components. |
| `--framework` | `react` | Scaffold target: `react`, `vue`, or `wc`. |
| `--force-retire` | `false` | Override the zero-usage removal gate. Requires `--justification` string. |

**Default invocation:**

```bash
/d2c \
  --component Button \
  --truth-structure cva \
  --truth-visual figma \
  --truth-conflict-strategy escalate \
  --viewport 1440x900 \
  --figma-write-preflight true \
  --run-all
```

---

## Output artifacts

Every phase writes inspectable artifacts to `.d2c/` at the repo root. These are the observable record of the lifecycle.

```
.d2c/
  status-registry.json        ← Current lifecycle status per component
  drift-report.json           ← Populated after maintain phase
  diff-baseline/              ← Playwright screenshot baselines per component
  diff-results/               ← Latest diff output, pass/fail, delta values
  changelogs/                 ← Generated changelogs per ship event
  migration-guides/           ← Generated codemods and docs per retire event
  batch-reports/              ← Batch mode execution reports
```

---

## Figma plan requirements

d2c uses the Figma MCP for component structure extraction and frame export. It does not use the Figma Variables REST API (Enterprise only).

Token values are extracted via [Tokens Studio](https://tokens.studio/) (free tier sufficient) or pre-sourced from open-source design system repos. See [Token pipeline](docs/architecture/token-pipeline.md) for details.

| Feature | Plan required | How d2c handles it |
|---|---|---|
| Component structure | Any | Figma MCP — GET /v1/files |
| Frame export for diff | Any | Figma MCP — GET /v1/images |
| Variable values (read) | Enterprise | Tokens Studio plugin or pre-sourced DTCG JSON |
| Variable write-back | Enterprise | Manual re-import via Tokens Studio |
| Library analytics | Enterprise | Not implemented |

The `TOKEN_SOURCE` environment variable controls the token extraction strategy:

| Value | Behavior |
|---|---|
| `auto` (default) | Uses Tokens Studio export if present, falls back to pre-sourced DTCG files |
| `tokens-studio` | Requires Tokens Studio export — errors if not found |
| `presourced` | Uses committed DTCG JSON files from open-source repos |

---

## Design decisions

These are not defaults — they are explicit choices made after evaluating the failure modes. Each one is documented here so future contributors understand the reasoning.

### 1. Per-artifact truth authority, not a global flag

A single `--truth-figma` flag applied globally would cause Figma to overwrite TypeScript interfaces. A single `--truth-cva` flag would cause CVA to overwrite a designer's intentional token update. The real conflict surface is narrower: structural decisions (variant names, prop types, slot definitions) belong to engineering; visual decisions (tokens, spacing, color) belong to design. `--truth-structure` and `--truth-visual` map to those two surfaces independently.

When neither side is clearly right — a new slot added in code that has no Figma equivalent — the `escalate` strategy blocks the pipeline and emits a human-readable conflict report rather than silently choosing. This is the safest default because silent resolution in either direction produces incorrect artifacts that are hard to detect later.

### 2. Deterministic structural comparison, not pixel diffing

The original validate phase used pixel-level image comparison with configurable thresholds. This failed in practice — cross-renderer differences (Figma vs browser) require loose tolerances that hide real bugs, and same-renderer regression baselines only detect that something changed, not that it's correct. A Carbon Button with broken vertical text alignment and wrong font weight passed all three original gates.

The redesigned validate phase uses deterministic structural comparison: Playwright extracts computed CSS properties from the rendered component and compares them against manifest token values. `fontFamily` is either `"IBM Plex Sans"` or it isn't. `backgroundColor` is either `rgb(15, 98, 254)` or it isn't. No thresholds, no tolerance bands — values match or the gate fails. Token delta remains a separate gate with hard-zero tolerance.

### 3. Figma write preflight over role-checking

Figma's permission model exposes workspace role, not file-scoped permission. A user can be a workspace Editor but have view-only access to a specific library file. Checking role via the API before a write operation gives a false confidence signal — the role check passes, the write fails, and the pipeline is now in a partial-write state with the Variant Authority registry already updated. The preflight flag attempts a no-op write (`PATCH` a description field back to its existing value) before any phase runs. If it returns `403`, the skill emits a clear error with the affected Figma file and required permission level, then halts before touching anything. This tests actual capability rather than claimed role.

---

## POC: Three Button components

The demo in this repo runs `d2c` against three Button components from three major design systems — narrow enough to be readable end-to-end, complex enough to exercise every phase, and diverse enough to prove the skill is design-system-agnostic.

### Design system comparison

| | IBM Carbon | GitHub Primer | Shopify Polaris |
|---|---|---|---|
| Primary color | Blue #0f62fe | Green #1f883d | Dark #303030 |
| Variant model | `kind` (7 values) | `variant` (5 values) | `variant` (5) × `tone` (3) |
| Sizes | sm, md, lg, xl, 2xl | sm, md, lg | micro, slim, medium, large |
| Font | IBM Plex Sans | System stack | Inter |
| CVA pattern | Simple variants | Simple variants | compoundVariants |
| Token format | SCSS (pre-sourced as DTCG) | JSON5/DTCG-native | CSS custom props (pre-sourced as DTCG) |

### What the POC contains

```
demo/
  button/
    carbon/
      Button.tsx              ← Scaffolded component with CVA variants
      Button.stories.tsx      ← Storybook stories
      tokens/
        button.tokens.json    ← Pre-sourced DTCG tokens (White theme)
      fault/
        button-token-fault.json  ← Seeded drift for maintain demo
      consumers/
        example-consumer.tsx  ← Seeded consumer for retire gate demo
    primer/
      Button.tsx              ← Primer Button (green primary, 5 variants)
      Button.stories.tsx
      tokens/
        button.tokens.json    ← Pre-sourced DTCG tokens (Light theme)
      fault/
        button-token-fault.json
    polaris/
      Button.tsx              ← Polaris Button (dark primary, compound variants)
      Button.stories.tsx
      tokens/
        button.tokens.json    ← Pre-sourced DTCG tokens (Light theme)
      fault/
        button-token-fault.json
  scopes/
    all-buttons.json          ← Batch mode scope manifest
  figma/
    carbon-button-spec.json   ← Extracted Figma component data
    primer-button-spec.json
    polaris-button-spec.json

.variant-authority/
  button.manifest.json        ← Carbon Button CVA registry (deprecated)
  primer-button.manifest.json
  polaris-button.manifest.json
```

The POC includes **seeded faults** — each Button's `fault/` directory contains a modified token file with one value changed. Copying the fault file over the original triggers the maintain phase drift detection, demonstrating the skill's core value.

The Carbon Button also includes a **seeded consumer** and a **deprecation demo** (Button → ActionButton) that exercises the retire phase's removal gate.

---

## Try it yourself

### Prerequisites

- [Claude Code](https://claude.ai/code) installed
- Figma account with **Editor access** on the target file
- Node 22.19+
- The following MCP servers configured in your Claude Code environment:
  - `figma` — Figma official MCP
  - `playwright` — Playwright MCP
  - `storybook` — `@storybook/addon-mcp` (installed with Storybook)
  - `variant-authority` — from `component-contracts` package
- [Tokens Studio](https://tokens.studio/) Figma plugin (optional — falls back to pre-sourced tokens)

### 1. Clone and install

```bash
git clone https://github.com/jeremysykes/d2c
cd d2c
npm install
```

### 2. Configure MCPs

Add all four MCP servers to your Claude Code environment. Verify they are connected:

```bash
claude mcp list
```

### 3. Run the design phase

Extract the Button component from Figma and seed the Variant Authority registry:

```bash
/d2c --component Button --phase design
```

Open `.variant-authority/button.manifest.json` and confirm the variant surface was captured.

### 4. Run the build phase

Scaffold the component code, run the token pipeline, and generate the Storybook story:

```bash
/d2c --component Button --phase build
```

Inspect the outputs:
- `demo/button/carbon/Button.tsx` — scaffolded component with CVA variants
- `demo/button/carbon/tokens/button.tokens.json` — DTCG tokens
- `demo/button/carbon/Button.stories.tsx` — story file with all variant combinations

### 5. Run the validate phase

Establish Playwright baselines and run all three validation gates:

```bash
/d2c --component Button --phase validate
```

Open `.d2c/diff-results/button-latest.json`. Both gates should pass:
- `structural.passed` is `true` (all computed CSS properties match manifest tokens)
- `token.actual` equal to `0` (no token mismatches)

### 6. Trigger a drift

Copy the seeded fault file over the original tokens:

```bash
cp demo/button/carbon/fault/button-token-fault.json demo/button/carbon/tokens/button.tokens.json
```

This simulates a developer making a token change without a corresponding Figma update — the most common real-world drift scenario.

### 7. Run the maintain phase

```bash
/d2c --component Button --phase maintain
```

Open `.d2c/drift-report.json`. The skill should have detected the token mismatch and flagged it as a Figma-authoritative conflict. The report will contain the affected token name, the Figma value vs the code value, the recommended resolution, and a `BLOCKED` status preventing advancement to ship.

### 8. Resolve the conflict and ship

Restore the original token value, re-run validate, then ship:

```bash
git checkout demo/button/carbon/tokens/button.tokens.json
/d2c --component Button --phase validate
/d2c --component Button --phase ship
```

### 9. Run batch mode

Run validate across all three Button components:

```bash
/d2c --scope demo/scopes/all-buttons.json --phase validate
```

Open `.d2c/batch-reports/` for the batch report with per-component results.

### 10. Run the retire phase demo

The Carbon Button includes a pre-configured deprecation scenario (Button → ActionButton):

```bash
/d2c --component Button --phase retire
```

Inspect `.d2c/migration-guides/button-to-actionbutton.md` for the generated migration guide and codemod. The removal gate will block because the seeded consumer still imports Button.

---

## What to look for

After running the full POC, these are the specific things that demonstrate the design of the skill:

**The conflict report in step 7** shows the `--truth-structure` / `--truth-visual` split in practice. The skill did not apply a single global rule — it applied different authority logic to different artifact types.

**The structural comparison in step 5** shows deterministic validation in action. Open the diff result and look at the `structural.mismatches` array — each entry shows a specific CSS property, the expected value from Figma, and the actual rendered value.

**The Figma preflight in step 2** shows why role-checking is the wrong abstraction. The preflight tests actual write capability against the actual file, not workspace-level role.

**The removal gate in step 10** shows that retirement is a process, not a deletion. The gate is enforced by the usage surface map — it cannot be bypassed without `--force-retire` and a logged justification string.

**The cross-system comparison** shows that d2c is design-system-agnostic. Carbon's blue primary, Primer's green primary, and Polaris's dark primary are all handled by the same phase logic with different token inputs.

---

## Webhook drift detection

The maintain phase detects drift by on-demand invocation — `/d2c --phase maintain` checks current state when you run it. Continuous drift detection (Figma changes automatically triggering re-validation) requires a persistent webhook listener for Figma file change events.

This is infrastructure, not a skill. It is intentionally out of scope for `d2c`.

A companion service architecture would:
1. Register a webhook listener with the Figma Webhooks V2 API
2. On `FILE_UPDATE` events, extract the affected component IDs
3. Invoke `/d2c --component {name} --phase maintain` for each affected component
4. Route the drift report to a notification channel (Slack, GitHub Issue, etc.)

This is a thin orchestration layer — the actual drift detection logic lives entirely in the d2c skill's maintain phase. The webhook service just decides *when* to run it.

Figma webhook documentation: https://www.figma.com/developers/api#webhooks_v2

---

## Requirements

### System
- Node 22.19+
- Claude Code (latest)

### MCP servers
- Figma MCP — Editor access on target file; Editor access on team library for publish
- Playwright MCP — Chromium available in environment
- Storybook MCP — `@storybook/addon-mcp` addon, Storybook running on `localhost:6006` (configurable)
- Variant Authority MCP — from `component-contracts` package, registry initialized at `.variant-authority/`

### Figma account
- Any paid plan (Pro sufficient)
- Editor role on the component file
- Editor role on the team library file (ship phase only)
- The `--figma-write-preflight true` flag (default) will verify this before any phase runs

### Token extraction
- [Tokens Studio](https://tokens.studio/) Figma plugin (free tier sufficient) — for live token extraction
- Or: pre-sourced DTCG JSON files committed to the repo (demo works out of the box)

---

## What's next

These are honest gaps in the current version of the skill, not planned features.

**Framework-agnostic scaffolding.** The build phase currently scaffolds React with CVA. Vue (`@radix-vue`) and Web Components are documented in the phase docs but not yet exercised in demos.

**Live Storybook integration.** The Storybook MCP addon (`@storybook/addon-mcp`) is documented but Storybook is not yet installed in this repo. Story files are generated but not served.

**component-contracts MCP servers.** The `variant-authority` and `radix-primitives` MCP servers are specified in `mcps/variant-authority.md` and `mcps/radix-primitives.md` but not yet implemented. Manifests are currently read/written as JSON files directly.

**Playwright structural validation.** The structural comparison gate is specified in `mcps/playwright.md` and `phases/validate.md`. It requires Playwright MCP to extract computed CSS from rendered Storybook stories. The gate definitions are complete; wiring to live Playwright `evaluate()` calls happens when the validate phase runs.

---

## Skill compatibility

The `SKILL.md` and all phase/mcp documentation files are written in portable format compatible with:

- Claude Code (primary)
- Cursor
- Codex CLI

---

## License

MIT

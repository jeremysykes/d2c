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
/d2c --component Badge --phase build
/d2c --component Badge --phase validate
/d2c --component Badge --phase ship
```

Or run as a full pipeline:

```bash
/d2c --component Badge --run-all
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
| **Ship** | Status registry is updated (alpha → beta → stable), semver and changelog are generated, Figma library is published back with any code-side corrections. | Figma, Variant Authority |
| **Maintain** | Ongoing drift monitoring — Figma changes trigger re-validation. Consumer surface map tracks which products use the component and at what version. PR impact estimator flags breaking changes. | Figma, Playwright |
| **Retire** | Variant Authority emits a deprecation signal. Skill generates a codemod and migration guide. Removal gate blocks deletion until usage tracking confirms zero consumers. | Variant Authority, Storybook |

---

## Architecture

### MCP servers

`d2c` depends on four MCP servers. Each owns a distinct authority surface.

**Figma MCP**
The design authority. Source of truth for component structure, variant definitions, token bindings, and visual spec. Used in both directions — reading design state in the build phase, writing corrections back in the ship phase. Requires Figma Editor access on the target file. Publishing to a team library requires Editor access on the library file specifically.

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
  schemas/
    variant-manifest.ts       ← Shared contract between all phases
    status-registry.ts        ← Lifecycle state shape
    drift-report.ts           ← Drift detection output shape
    diff-result.ts            ← Playwright diff output shape
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
| `--diff-threshold-pixel` | `0.1` | Max percentage of changed pixels allowed. |
| `--diff-threshold-region` | `15` | Max contiguous changed region in px². Catches corner-only regressions that percentage misses. |
| `--diff-threshold-token` | `0` | Token value mismatches allowed. Always zero — no override. |
| `--viewport` | `1440x900` | Locked viewport for all Playwright captures. |
| `--figma-write-preflight` | `true` | Attempt a no-op Figma write before any phase that requires write access. Fails fast with a clear error rather than mid-pipeline. |
| `--phase` | — | Target a single phase. Omit to run the full pipeline. |
| `--component` | — | Component name. Must match the Figma component key and the Variant Authority registry entry. |
| `--run-all` | `false` | Execute all phases in sequence. |
| `--force-retire` | `false` | Override the zero-usage removal gate. Requires `--justification` string. |

**Default invocation:**

```bash
/d2c \
  --component Badge \
  --truth-structure cva \
  --truth-visual figma \
  --truth-conflict-strategy escalate \
  --diff-threshold-pixel 0.1 \
  --diff-threshold-region 15 \
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
  variant-manifest/           ← CVA registry snapshots per component
  changelogs/                 ← Generated changelogs per ship event
  migration-guides/           ← Generated codemods and docs per retire event
```

---

## Design decisions

These are not defaults — they are explicit choices made after evaluating the failure modes. Each one is documented here so future contributors understand the reasoning.

### 1. Per-artifact truth authority, not a global flag

A single `--truth-figma` flag applied globally would cause Figma to overwrite TypeScript interfaces. A single `--truth-cva` flag would cause CVA to overwrite a designer's intentional token update. The real conflict surface is narrower: structural decisions (variant names, prop types, slot definitions) belong to engineering; visual decisions (tokens, spacing, color) belong to design. `--truth-structure` and `--truth-visual` map to those two surfaces independently.

When neither side is clearly right — a new slot added in code that has no Figma equivalent — the `escalate` strategy blocks the pipeline and emits a human-readable conflict report rather than silently choosing. This is the safest default because silent resolution in either direction produces incorrect artifacts that are hard to detect later.

### 2. Three diff thresholds, not one

A single pixel-percentage threshold hides two important failure modes. A 2% delta on a full-bleed component means thousands of changed pixels — a real regression. A 2% delta on a 24×24 icon means eleven pixels — likely subpixel antialiasing noise. The `--diff-threshold-region` flag catches the "one corner changed significantly" case that percentage alone misses. Token delta is treated separately and is always zero because a token value mismatch is never acceptable noise — it means the component is visually incorrect by definition.

### 3. Figma write preflight over role-checking

Figma's permission model exposes workspace role, not file-scoped permission. A user can be a workspace Editor but have view-only access to a specific library file. Checking role via the API before a write operation gives a false confidence signal — the role check passes, the write fails, and the pipeline is now in a partial-write state with the Variant Authority registry already updated. The preflight flag attempts a no-op write (`PATCH` a description field back to its existing value) before any phase runs. If it returns `403`, the skill emits a clear error with the affected Figma file and required permission level, then halts before touching anything. This tests actual capability rather than claimed role.

---

## POC: Badge component

The demo in this repo runs `d2c` against a single `Badge` component — narrow enough to be readable end-to-end, complex enough to exercise every phase. Badge has a realistic variant surface (`variant: info|success|warning|danger`, `size: sm|md`, `dismissible: boolean`), a clear visual contract that makes Playwright diffs meaningful, and a natural deprecation story used in the retire phase demo.

### What the POC contains

```
demo/
  figma/
    badge-spec.json           ← Exported Figma component data
  components/
    Badge/
      Badge.tsx               ← Scaffolded in build phase
      Badge.stories.tsx       ← Generated by Storybook MCP
      Badge.test.ts           ← Interaction tests
      badge.tokens.json       ← DTCG format token source
  .variant-authority/
    badge.manifest.json       ← CVA registry snapshot
```

The POC includes a **seeded fault** used in step 5 below: the background token in `badge.tokens.json` is intentionally mismatched against `badge-spec.json` to trigger the maintain phase drift detection. This is the clearest demonstration of the skill's value — watching it catch a change that would otherwise ship silently.

---

## Try it yourself

### Prerequisites

- [Claude Code](https://code.claude.com) installed
- Figma account with **Editor access** on the [d2c demo file](#) *(link to public Figma file)*
- Node 20+
- The following MCP servers configured in your Claude Code environment:
  - `figma` — `claude mcp add --transport http figma https://mcp.figma.com/mcp`
  - `playwright` — `npx skills add https://github.com/lackeyjb/playwright-skill --skill playwright-skill`
  - `storybook` — *(link to Storybook MCP setup)*
  - `variant-authority` — *(link to Variant Authority MCP setup)*

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
# Expected: figma, playwright, storybook, variant-authority all listed as connected
```

Verify Figma write access by running the preflight check in isolation:

```bash
/d2c --preflight-only --component Badge
# Expected: ✓ Figma write access confirmed on demo file
```

### 3. Run the design phase

Extract the Badge component from Figma and seed the Variant Authority registry:

```bash
/d2c --component Badge --phase design
```

Open `.d2c/variant-manifest/badge.manifest.json` and confirm the variant surface was captured: `variant`, `size`, `dismissible` with their allowed values.

### 4. Run the build phase

Scaffold the component code, run the token pipeline, and generate the Storybook story:

```bash
/d2c --component Badge --phase build
```

Inspect the outputs:
- `demo/components/Badge/Badge.tsx` — scaffolded component with CVA variants
- `demo/components/Badge/badge.tokens.json` — DTCG tokens extracted from Figma
- `demo/components/Badge/Badge.stories.tsx` — story file with all variant combinations

### 5. Run the validate phase

Establish Playwright baselines and run all three validation gates:

```bash
/d2c --component Badge --phase validate
```

Open `.d2c/diff-results/badge-latest.json`. All three gates should pass:
- `pixelDelta` below `0.1`
- `regionDelta` below `15`
- `tokenDelta` equal to `0`

### 6. Trigger a drift

Open `demo/components/Badge/badge.tokens.json` and change the `info` variant background token value. This simulates a developer making a token change without a corresponding Figma update — the most common real-world drift scenario.

```json
"color-badge-info-background": {
  "$value": "#E0F0FF"   ← change this to any other value
}
```

### 7. Run the maintain phase

```bash
/d2c --component Badge --phase maintain
```

Open `.d2c/drift-report.json`. The skill should have detected the token mismatch and flagged it as a Figma-authoritative conflict (because `--truth-visual figma` is the default). The report will contain:

- The affected token name
- The Figma value vs the code value
- The recommended resolution
- A `BLOCKED` status preventing advancement to ship

This is the skill exercising the `--truth-visual figma` flag — it does not silently accept the code value because visual authority belongs to Figma. A human decision is required before the pipeline can continue.

### 8. Resolve the conflict and ship

Restore the original token value, re-run validate, then ship:

```bash
/d2c --component Badge --phase validate
/d2c --component Badge --phase ship
```

Open `.d2c/status-registry.json` and confirm Badge has advanced to `beta`. Open `.d2c/changelogs/badge-changelog.md` and review the generated release notes.

### 9. Run the retire phase demo

The POC includes a pre-configured deprecation scenario where `Badge` is replaced by `StatusBadge`. Run:

```bash
/d2c --component Badge --phase retire
```

Inspect `.d2c/migration-guides/badge-to-statusbadge.md` for the generated codemod and migration documentation. Note that the removal gate will block if any consumers are still listed in the usage tracking surface — in the POC, Badge has a seeded consumer to demonstrate the gate behavior.

---

## What to look for

After running the full POC, these are the specific things that demonstrate the principal-level design of the skill — they are worth understanding before using `d2c` on a real component:

**The conflict report in step 7** shows the `--truth-structure` / `--truth-visual` split in practice. The skill did not apply a single global rule — it applied different authority logic to different artifact types. That is intentional and documented in the design decisions above.

**The three-threshold diff in step 5** shows why a single percentage is insufficient. Open `.d2c/diff-results/badge-latest.json` and look at `pixelDelta` vs `regionDelta` — they tell different stories about the same diff.

**The Figma preflight in step 2** shows why role-checking is the wrong abstraction. The preflight tests actual write capability against the actual file, not workspace-level role.

**The removal gate in step 9** shows that retirement is a process, not a deletion. The gate is enforced by the usage surface map — it cannot be bypassed without `--force-retire` and a logged justification string.

---

## Requirements

### System
- Node 20+
- Claude Code (latest)

### MCP servers
- Figma MCP — Editor access on target file; Editor access on team library for publish
- Playwright MCP — Chromium available in environment
- Storybook MCP — Storybook running on `localhost:6006` (configurable)
- Variant Authority MCP — Registry initialized at `.variant-authority/`

### Figma account
- Editor role on the component file
- Editor role on the team library file (ship phase only)
- The `--figma-write-preflight true` flag (default) will verify this before any phase runs

---

## What's next

These are honest gaps in the current version of the skill, not planned features.

**Multi-component pipelines.** The skill currently operates on one component per invocation. A batch mode (`/d2c --run-all --scope foundation`) that can pipeline an entire token or component tier is a meaningful next step.

**Webhook-based drift detection.** The maintain phase currently requires manual invocation to check for Figma drift. A webhook listener that triggers re-validation on Figma file save would close this loop without polling.

**Framework-agnostic scaffolding.** The build phase currently scaffolds React with CVA. Vue and Web Components are the next targets.

**Storybook 10 compatibility.** The story generation templates target Storybook 8 CSF3. Storybook 10 introduces breaking changes to `argTypes` and `parameters.status` that will require updates to `mcps/storybook.md`.

---

## License

MIT

# d2c — Design-to-code lifecycle skill

Design systems drift because the Figma-to-code handoff is manual, one-directional, and undocumented. A designer renames a token, a developer ships a prop change, nobody notices until something breaks. `d2c` makes that handoff bidirectional, gated, and automated.

`d2c` is a Claude Code skill — an instruction set that coordinates four MCP servers across six lifecycle phases. It extracts component structure from Figma, scaffolds code with design tokens, validates the rendered output against the design spec, writes lifecycle status back to Figma, detects drift, and supports deprecation workflows. The validate phase enforces two deterministic gates — structural CSS comparison and token delta — that must both pass before a component can advance to ship.

```
DESIGN  →  BUILD  →  VALIDATE  →  SHIP  →  MAINTAIN  →  RETIRE
  │           │          │          │          │           │
  Extract     Scaffold   Structural Promote    Drift       Deprecation
  from        code +     CSS gate   alpha →    detection   signal +
  Figma       tokens     + token    stable     on-demand   removal gate
              pipeline   delta
```

### POC result

Three Button components from IBM Carbon, GitHub Primer, and Shopify Polaris — each extracted from Figma, scaffolded with CVA variants, and validated against their design spec using deterministic structural comparison. All three use a two-layer token architecture: Style Dictionary generates primitive CSS custom properties, a hand-written `semantic.css` maps standard names to those primitives, and components consume semantic Tailwind utilities (`bg-cds-primary`, `bg-primer-primary`, `bg-polaris-primary`). No hardcoded color values. Colors use semantic Tailwind utilities (`bg-cds-primary`). Spacing and typography reference semantic CSS custom properties. Shadow values use design-system-specific composite tokens from Figma.

The structural validation gate caught real bugs during development: the Carbon Button had text vertically misaligned by 15px (incorrect flex direction) and an icon positioned adjacent to text instead of at the trailing edge (wrong flex layout). The gate — which discovers what to check by reading the component's `semantic.css` and comparing resolved token values against computed CSS — blocked advancement until the layout was fixed.

| | IBM Carbon | GitHub Primer | Shopify Polaris |
|---|---|---|---|
| Semantic primary | `bg-cds-primary` | `bg-primer-primary` | `bg-polaris-primary` |
| Variant model | `kind` (7) × `size` (7) × `type` (2) | `variant` (4) × `size` (3) | `variant` (3) × `tone` (2) |
| Font | IBM Plex Sans | System stack | Inter |
| CVA pattern | Simple variants | Simple variants | compoundVariants |

---

## How it works

### MCP servers

`d2c` coordinates four MCP servers, each owning a distinct authority surface:

| Server | Role | Source |
|---|---|---|
| **Figma MCP** | Design authority — component structure, variants, token bindings, visual spec | Figma official MCP |
| **Variant Authority** | Engineering contract — canonical variant manifest, deprecation tracking, consumer mapping | [`component-contracts`](https://github.com/jeremysykes/component-contracts) |
| **Radix Primitives** | Accessibility foundation — primitive capability map, composition patterns, ARIA contracts | [`component-contracts`](https://github.com/jeremysykes/component-contracts) |
| **Playwright** | Validation layer — structural CSS comparison, reference screenshots | Playwright MCP |

### Lifecycle phases

| Phase | What happens | Output |
|---|---|---|
| **Design** | Extract component from Figma. Seed variant manifest with variants, slots, token bindings, authority rules. | `.variant-authority/{component}.manifest.json` |
| **Build** | Scaffold component code (React + CVA). Run token pipeline (DTCG → Style Dictionary → CSS custom properties). Create semantic token mapping (`semantic.css`). Generate Storybook stories. | Component code, semantic.css, generated tokens, story file |
| **Validate** | Structural gate: Playwright extracts computed CSS from rendered story, compares against manifest tokens. Token delta gate: manifest vs DTCG source. Both must pass. | `.d2c/diff-results/{component}-latest.json` |
| **Ship** | Promote lifecycle status (alpha → beta → stable). Bump semver. Generate changelog. Write version and status back to Figma component description. | Changelog, updated manifest and Figma description |
| **Maintain** | On-demand drift detection. Re-extract Figma state, compare against manifest, apply truth authority rules. Flag conflicts. | `.d2c/drift-report.json` |
| **Retire** | Emit deprecation signal. Generate codemod and migration guide. Removal gate blocks deletion until consumer usage confirmed zero. | Migration guide, codemod, updated manifest |

### Token architecture

Components use a two-layer token system modeled after production design system patterns:

**Layer 1 — Primitives.** Style Dictionary transforms DTCG source files into CSS custom properties (`--cds-color-button-primary-background`). These are the raw values, generated automatically.

**Layer 2 — Semantic tokens.** A hand-written `semantic.css` per design system maps standard token names to the primitive variables (`--cds-primary: var(--cds-color-button-primary-background)`). This is a manual mapping — if a primitive variable name changes, the semantic file must be updated to match.

**Layer 3 — Tailwind utilities.** The `@theme` block in Storybook's preview.css registers semantic tokens as Tailwind colors, enabling CVA to use `bg-cds-primary` instead of `bg-[var(--cds-color-button-primary-background)]`.

Components reference semantic Tailwind utilities for colors (`bg-cds-primary`, `text-primer-primary-foreground`) and semantic CSS custom properties for spacing and typography (`var(--cds-spacing-height-lg)`, `var(--cds-typography-font-family)`). No hardcoded color values.

### Validation: component-agnostic structural gate

The validate phase discovers what to check by reading the component's `semantic.css` file (referenced via `semanticTokenFile` in the variant manifest). Token naming conventions map to CSS properties:

| Token pattern | CSS property | Target |
|---|---|---|
| `--{prefix}-{variant}` | `backgroundColor` | Root element |
| `--{prefix}-{variant}-foreground` | `color` | Text element |
| `--{prefix}-typography-font-family` | `fontFamily` | Root element |
| `--{prefix}-typography-font-size` | `fontSize` | Root element |
| `--{prefix}-spacing-height-{size}` | `height` | Root element |
| `--{prefix}-spacing-padding-*` | `paddingLeft` | Root element |

Playwright navigates to the Storybook story, extracts computed CSS via `page.evaluate()`, and compares each value against the resolved semantic token. Values match or the gate fails. A new component type needs only a `semantic.css` and a Storybook story — no gate configuration.

The convention-driven token checks are fully component-agnostic. Layout-specific checks (vertical text alignment, icon trailing-edge position) are configured per component type in the variant manifest.

Token delta is a separate gate with hard-zero tolerance — a token mismatch means the component is visually incorrect by definition.

### Design decisions

**Per-artifact truth authority, not a global flag.** Structural decisions (variant names, prop types) belong to engineering (`--truth-structure cva`). Visual decisions (tokens, spacing) belong to design (`--truth-visual figma`). When neither side is clearly right, the `escalate` strategy blocks and emits a conflict report rather than silently choosing.

**Figma write preflight over role-checking.** Figma's permission model exposes workspace role, not file-scoped permission. The preflight tests actual write capability with a no-op PATCH before any phase runs, rather than checking a role that may not reflect reality.

**On-demand drift detection, not webhooks.** The maintain phase checks current state when invoked. Continuous monitoring requires a webhook listener — that's infrastructure, not a skill. See [Figma Webhooks V2](https://www.figma.com/developers/api#webhooks_v2) for a companion service architecture.

---

## Try it yourself

### Prerequisites

- [Claude Code](https://claude.ai/code) installed
- Figma account with Editor access (any paid plan — Pro sufficient)
- Node 22.19+
- MCP servers: `figma`, `playwright`, `variant-authority`, `radix-primitives`
- [Tokens Studio](https://tokens.studio/) Figma plugin (optional — pre-sourced tokens work out of the box)

### Quick start

```bash
git clone https://github.com/jeremysykes/d2c
cd d2c
npm install

# Configure MCP servers
claude mcp add variant-authority npx tsx ../component-contracts/src/variant-authority/server.ts
claude mcp add radix-primitives npx tsx ../component-contracts/src/radix-primitives/server.ts

# Run the full pipeline
/d2c --component Button --phase design
/d2c --component Button --phase build
/d2c --component Button --phase validate
/d2c --component Button --phase ship
```

### Trigger a drift

```bash
cp demo/button/carbon/fault/button-token-fault.json demo/button/carbon/tokens/button.tokens.json
/d2c --component Button --phase maintain
```

The drift report will show the token mismatch and block advancement.

### Run batch mode

```bash
/d2c --scope demo/scopes/all-buttons.json --phase validate
```

### Retire a component

```bash
/d2c --component Button --phase retire
```

The removal gate blocks because the seeded consumer still imports Button.

---

## Configuration

All flags can be set at invocation or stored in `.d2c/config.json`.

| Flag | Default | Description |
|---|---|---|
| `--component` | required | Target component name |
| `--phase` | optional | Single phase to run |
| `--run-all` | `false` | Execute design → build → validate → ship in sequence |
| `--truth-structure` | `cva` | Authority for variant names, slots, prop types |
| `--truth-visual` | `figma` | Authority for tokens, spacing, visual spec |
| `--truth-conflict-strategy` | `escalate` | Conflict resolution: `escalate`, `figma-wins`, or `cva-wins` |
| `--diff-threshold-token` | `0` | Token mismatches allowed (hard zero, no override) |
| `--viewport` | `1440x900` | Locked Playwright viewport |
| `--figma-write-preflight` | `true` | No-op write test before Figma phases |
| `--framework` | `react` | Scaffold target: `react`, `vue`, or `wc` |
| `--scope` | optional | Batch mode manifest path |
| `--force-retire` | `false` | Override zero-usage removal gate (requires `--justification`) |

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `FIGMA_ACCESS_TOKEN` | required | Figma personal access token |
| `TOKEN_SOURCE` | `auto` | Token strategy: `tokens-studio`, `presourced`, or `auto` |
| `STORYBOOK_URL` | `http://localhost:6006` | Storybook instance URL |

### Figma plan requirements

d2c works on any paid Figma plan (Pro sufficient). Token values are extracted via Tokens Studio or pre-sourced DTCG files — not the Enterprise-only Variables REST API.

| Feature | Plan required | How d2c handles it |
|---|---|---|
| Component structure | Any | Figma MCP |
| Frame export | Any | Figma MCP |
| Variable values | Enterprise | Tokens Studio or pre-sourced DTCG JSON |
| Variable write-back | Enterprise | Manual re-import via Tokens Studio |

---

## Skill file structure

```
.claude/skills/d2c/
  SKILL.md                    ← Entry point
  phases/
    design.md                 ← Figma extraction
    build.md                  ← Scaffold + token pipeline
    validate.md               ← Structural gate + token delta
    ship.md                   ← Promotion + changelog
    maintain.md               ← Drift detection
    retire.md                 ← Deprecation + removal gate
  mcps/
    figma.md                  ← Figma MCP patterns
    playwright.md             ← Structural comparison patterns
    storybook.md              ← Story generation + status
    variant-authority.md      ← Registry read/write
    radix-primitives.md       ← Primitive capability map
  schemas/
    variant-manifest.ts       ← Component contract
    status-registry.ts        ← Lifecycle state
    drift-report.ts           ← Drift detection output
    diff-result.ts            ← Validation gate output
    batch-report.ts           ← Batch mode report
    token-source.ts           ← Token strategy resolution
  config/
    defaults.ts               ← Default flag values
    thresholds.ts             ← Token threshold constants
```

---

## What's next

These are honest gaps, not planned features.

**Framework-agnostic scaffolding.** The build phase scaffolds React with CVA. Vue (`@radix-vue`) and Web Components are documented but not yet exercised.

**Additional component types.** The semantic token gate is component-agnostic for token checks — a Checkbox, Select, or Dialog needs only a `semantic.css` and a Storybook story. The POC demonstrates the pattern with Buttons; extending to other component types validates the architecture further.

---

## Skill compatibility

The skill files are written in portable format compatible with Claude Code (primary), Cursor, and Codex CLI.

---

## License

MIT

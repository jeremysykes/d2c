---
name: d2c
description: Design-to-code lifecycle skill — manages UI components from Figma design through code to deprecation
compatibility: [claude-code, cursor, codex-cli]
---

# d2c — Design-to-Code Lifecycle Skill

A lifecycle operator that manages UI components across Figma, Storybook, Playwright, and a Variant Authority registry. Covers six phases: Design, Build, Validate, Ship, Maintain, and Retire.

## Invocation

```
d2c --component <name> --phase <phase>
d2c --component <name> --run-all
d2c --component <name> --preflight-only
d2c --scope <manifest> --phase <phase>
```

## Configuration flags

| Flag | Default | Type | Description |
|---|---|---|---|
| `--component` | required | `string` | Target component name |
| `--phase` | optional | `string` | Single phase: design, build, validate, ship, maintain, retire |
| `--run-all` | `false` | `boolean` | Run all phases in sequence |
| `--truth-structure` | `cva` | `figma \| cva` | Authority for variant names, slots, prop types |
| `--truth-visual` | `figma` | `figma \| cva` | Authority for tokens, spacing, visual spec |
| `--truth-conflict-strategy` | `escalate` | `escalate \| figma-wins \| cva-wins` | Conflict resolution when authority is ambiguous |
| `--diff-threshold-token` | `0` | `number` | Token mismatches allowed (hard zero, no override) |
| `--viewport` | `1440x900` | `string` | Locked Playwright viewport |
| `--figma-write-preflight` | `true` | `boolean` | Preflight check before any Figma write |
| `--framework` | `react` | `react \| vue \| wc` | Scaffold target framework |
| `--scope` | optional | `string` | Batch mode: component tier or manifest path |
| `--force-retire` | `false` | `boolean` | Override zero-usage removal gate |
| `--justification` | required if `--force-retire` | `string` | Logged justification for forced retirement |
| `--preflight-only` | `false` | `boolean` | Run preflight checks only, no phase execution |

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `FIGMA_ACCESS_TOKEN` | required | Figma personal access token |
| `FIGMA_FILE_CARBON` | optional | Figma file URL for Carbon demo |
| `FIGMA_FILE_PRIMER` | optional | Figma file URL for Primer demo |
| `FIGMA_FILE_POLARIS` | optional | Figma file URL for Polaris demo |
| `CHROMATIC_PROJECT_TOKEN` | optional | Chromatic token for visual testing |
| `STORYBOOK_URL` | `http://localhost:6006` | Storybook instance URL |
| `TOKEN_SOURCE` | `auto` | Token extraction strategy: tokens-studio, presourced, auto |

## Preflight checks

Before executing any phase, verify:

1. **Required MCP servers** are connected for the target phase (see phase docs for per-phase requirements)
2. **Component name** is provided via `--component` (unless `--scope` is set for batch mode)
3. **Figma write preflight** (if `--figma-write-preflight` is true and the phase writes to Figma): attempt a no-op PATCH to verify actual write capability before proceeding
4. **Status registry consistency**: if the component exists in `.d2c/status-registry.json`, verify it is not in `blocked` state (unless running maintain phase to diagnose the block)

If `--preflight-only` is set, run all checks and report results without executing any phase.

## Phase routing

When `--phase` is provided, load and execute the corresponding phase doc:

| Phase | Doc | Required MCP servers |
|---|---|---|
| `design` | `phases/design.md` | Figma, Variant Authority |
| `build` | `phases/build.md` | Figma, Storybook |
| `validate` | `phases/validate.md` | Playwright, Figma, Storybook |
| `ship` | `phases/ship.md` | Figma, Variant Authority |
| `maintain` | `phases/maintain.md` | Figma, Playwright |
| `retire` | `phases/retire.md` | Variant Authority, Storybook |

When `--run-all` is set, execute phases in order: design → build → validate → ship. The maintain and retire phases are excluded from run-all — they are invoked on-demand after initial ship.

If a phase fails or sets the component to `blocked` status, halt the pipeline and report which phase failed and why. Do not continue to subsequent phases.

## Phase ordering enforcement

Phases must be run in lifecycle order. The status registry tracks current phase. A phase cannot run if its prerequisites are not met:

| Phase | Requires status |
|---|---|
| design | any (can always run to re-extract) |
| build | design or later |
| validate | build or later |
| ship | validate (must have passed all gates) |
| maintain | alpha or later (component must be shipped) |
| retire | stable or later |

If the component's current status does not meet the requirement, error with a clear message stating the current status and the required status.

## Batch mode

When `--scope` is provided instead of `--component`:

1. Read the scope manifest to get the list of components
2. Run the specified phase (or all phases) for each component in sequence
3. Each component's lifecycle state is independent
4. Never halt on failure — continue and record the failure
5. Write batch report to `.d2c/batch-reports/{timestamp}-batch-report.json`
6. Print summary table
7. Exit with code 1 if any component failed

## Schemas

All JSON artifacts conform to schemas defined in `schemas/`:

| Schema | File | Purpose |
|---|---|---|
| variant-manifest | `schemas/variant-manifest.ts` | Component contract (variants, slots, tokens, authority) |
| status-registry | `schemas/status-registry.ts` | Per-component lifecycle state |
| drift-report | `schemas/drift-report.ts` | Maintain phase drift detection output |
| diff-result | `schemas/diff-result.ts` | Validate phase visual diff output |
| batch-report | `schemas/batch-report.ts` | Batch mode execution report |
| token-source | `schemas/token-source.ts` | Token extraction strategy resolution |

## Error handling

- **Missing MCP server**: List the missing server, its purpose, and install command. Do not attempt to run the phase.
- **Figma preflight failure**: Report the affected file and required permission level. Halt before touching anything.
- **Phase failure**: Set component status to `blocked` with the failure reason. Do not advance lifecycle.
- **Invalid flag value**: Report the flag, the invalid value, and the allowed values.
- **No --phase and no --run-all**: Display usage instructions with examples.

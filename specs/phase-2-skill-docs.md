# Phase 2 — SKILL.md and Phase Docs

## Purpose

Create the skill instruction layer that Claude reads at invocation time. `SKILL.md` is the entry point — it routes to the correct phase doc based on the `--phase` flag. Each phase doc contains the complete instruction set for that lifecycle phase: what MCP tools to call, in what order, what gates to enforce, and what artifacts to produce.

These are instruction documents in portable skill format, not code. They must work across Claude Code, Cursor, and Codex CLI.

---

## Inputs

- `--component` (required): Target component name
- `--phase` (optional): Single phase to run (design, build, validate, ship, maintain, retire)
- `--run-all` (optional): Run all phases in sequence
- All configuration flags from BRIEF.md (truth-structure, truth-visual, thresholds, viewport, etc.)
- `TOKEN_SOURCE` environment variable (from Amendment 01)

---

## Outputs

### 1. `SKILL.md` — Entry point

Location: `.claude/skills/d2c/SKILL.md`

Must contain:
- **Compatibility frontmatter**: `compatibility: [claude-code, cursor, codex-cli]`
- **Description**: One-paragraph summary of what d2c does
- **Flag parsing**: Document all flags with types and defaults
- **Phase routing**: Logic for dispatching to the correct phase doc
- **Run-all sequencing**: Order of phases when `--run-all` is set
- **Preflight checks**: MCP server availability, Figma write preflight (if applicable)
- **Error handling**: What to do when a phase fails, how to surface blocked status
- **Schema references**: Paths to all 6 schema files

### 2. `phases/design.md`

Instructions for extracting a component from Figma and seeding the Variant Authority registry.

Must document:
- Figma MCP tool calls for component extraction (GET file, component metadata)
- Variant parsing: how to read variant properties from Figma component
- Slot detection: identifying named slots in the component structure
- Token extraction strategy: Tokens Studio / pre-sourced resolution (Amendment 01)
- Variant Authority registry seeding: writing the initial `variant-manifest.json`
- Status registry update: set component to "design" phase
- Output artifacts: `variant-manifest.json`, status registry entry

### 3. `phases/build.md`

Instructions for scaffolding component code, running the token pipeline, and generating Storybook stories.

Must document:
- Token source resolution (TOKEN_SOURCE strategy from Amendment 01)
- DTCG JSON validation
- Style Dictionary transform pipeline
- Component scaffolding per framework (react, vue, wc)
- CVA variant definition generation from variant manifest
- Storybook story generation from variant manifest (all variant combinations)
- Seeded fault file generation (for demo)
- Status registry update: set component to "build" phase
- Output artifacts: component code, tokens, stories, fault file

### 4. `phases/validate.md`

Instructions for running the three validation gates.

Must document:
- Gate 1: Playwright visual diff (pixel threshold, region threshold)
- Gate 2: Token delta check (always zero tolerance)
- Gate 3: Storybook a11y + interaction tests
- Baseline establishment on first run
- Three-threshold evaluation logic
- All three gates must pass for status advancement
- Status registry update: set to "validate" (if all pass) or "blocked" (if any fail)
- Output artifacts: `diff-result.json`, updated status registry

### 5. `phases/ship.md`

Instructions for promoting a component through lifecycle stages and publishing.

Must document:
- Promotion path: validate → alpha → beta → stable
- Semver generation rules
- Changelog generation
- Figma write-back scope (Pro plan: descriptions and annotations only, per Amendment 01)
- Token export for manual Tokens Studio re-import (Amendment 01)
- Status registry update with promotion
- Output artifacts: changelog, updated status registry, updated variant manifest version

### 6. `phases/maintain.md`

Instructions for drift detection and consumer tracking.

Must document:
- On-demand invocation model (not webhook — per brief architecture boundary)
- Token drift detection: compare current token source against variant manifest
- Truth authority application (--truth-visual, --truth-structure)
- Conflict resolution strategy (escalate, figma-wins, cva-wins)
- Consumer surface map (which products use the component)
- PR impact estimation for breaking changes
- Status registry update: set to "blocked" if drift detected
- Output artifacts: `drift-report.json`, updated status registry

### 7. `phases/retire.md`

Instructions for component deprecation and removal.

Must document:
- Deprecation signal emission via Variant Authority
- Codemod generation for migration
- Migration guide generation
- Usage tracking: consumer surface map query
- Removal gate: blocks deletion until zero consumers confirmed
- `--force-retire` with `--justification` override
- Status registry update: deprecated → retired
- Output artifacts: migration guide, codemod, updated status registry, updated variant manifest

---

## Edge cases

1. **No --phase and no --run-all**: SKILL.md must error with usage instructions, not silently do nothing.

2. **--phase with invalid phase name**: Must list valid phases and error clearly.

3. **--run-all with a blocked component**: Must skip the blocked phase and report which phase is blocked, not halt the entire pipeline.

4. **Phase doc references missing MCP server**: Each phase doc must check for required MCP servers at the start and surface a clear error if missing.

5. **Figma write preflight fails during ship phase**: Must halt before any writes and report the permission issue (per brief design decision #3).

6. **TOKEN_SOURCE=auto with no sources available**: Build phase must error with clear instructions for both Tokens Studio setup and pre-sourced file locations.

7. **Phase run out of order**: Running --phase ship before --phase validate. Status registry must reject — ship requires validate status to be complete.

---

## Acceptance criteria

1. `SKILL.md` exists at `.claude/skills/d2c/SKILL.md`
2. `SKILL.md` contains compatibility frontmatter with claude-code, cursor, codex-cli
3. `SKILL.md` documents all configuration flags from the brief
4. All 6 phase docs exist at `.claude/skills/d2c/phases/{phase}.md`
5. Each phase doc specifies which MCP servers it requires
6. Each phase doc specifies which schemas it reads and writes
7. Each phase doc specifies its output artifacts
8. `build.md` documents the TOKEN_SOURCE resolution strategy (Amendment 01)
9. `ship.md` documents the Pro plan write-back scope (Amendment 01)
10. `maintain.md` documents the on-demand invocation model (not webhook)
11. `retire.md` documents the removal gate and --force-retire override
12. No phase doc uses Claude Code-specific syntax (portable format)

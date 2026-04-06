# Portfolio Quality Pass

## Problem

The d2c and component-contracts repos are functionally complete — the skill runs, the MCP servers work, the pipeline executes end-to-end. But the code and documentation have quality issues that would undermine credibility as a portfolio piece for a principal UI engineer.

## Scope

Four sub-projects, executed in order:

### 1. Carbon Button Component Quality

**Token references replace hardcoded hex.** The component imports `./tokens/generated/variables.css` but uses `bg-[#0f62fe]` instead of `bg-[var(--color-button-primary-background)]`. Every hardcoded color value in the CVA variant definitions becomes its corresponding CSS custom property from the generated token pipeline.

**Layout rewrite.** Remove `flex-col` from the default type variant. Remove absolute positioning from the icon. Button becomes a horizontal flex container (`flex items-center`) with text and icon as in-flow flex children. Remove the `justify-center` additions that were patching the `flex-col` misalignment. Icon-only variant stays `justify-center items-center` with the icon as the only child.

**Font loading.** Add `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&display=swap')` to the component's CSS or Storybook preview CSS. Remove the inline `style={{ fontFamily: ... }}` attribute from the component — font-family moves into the CVA base class via the token variable.

**Re-validate.** After changes, run `/d2c --component Button --phase validate` to confirm the structural gate passes with the refactored code.

### 2. component-contracts README

Update `component-contracts/README.md` to reflect current state:

- Schema section: show the aligned VariantManifest with figmaFileKey, figmaNodeId, slots, tokens, authority, createdAt, updatedAt. Remove status, props, consumers.
- Variant Authority tools: remove deprecate_variant, rename validate_props → validate_usage, document isVariantManifest() validation on set_manifest.
- Radix Primitives: add vuePackage field to PrimitiveCapability documentation.
- Fix any stale Badge references to Button.

### 3. README Rewrite — Both Repos

Restructure both READMEs so the value proposition is clear within 60 seconds of scanning.

**d2c README:**
- Lead with the problem and value in 3 sentences. Design systems drift. d2c catches it. Here's how.
- Show the 6-phase pipeline visually with one-line descriptions.
- Show the POC result — three Buttons from three design systems, validated against Figma with deterministic structural comparison. The validate phase caught a real vertical alignment bug.
- Push technical detail (flags, schemas, file structure) below the fold.
- Keep the "What's next" section — honest gaps are more credible than hidden ones.

**component-contracts README:**
- Lead with what it is — two MCP servers that form the authority layer for design-to-code lifecycles.
- Show the tool surface — 5 + 4 tools, one line each.
- Show the relationship to d2c — this is the engine, d2c is the operator.
- Schema and API detail below the fold.

Technical content is reorganized, not deleted. First screen = "what and why." Rest = "how."

### 4. Primer and Polaris Pipeline Runs

Apply the same quality patterns from Carbon to Primer and Polaris:

- Refactor each component: token variable references, proper horizontal flex layout, font loading (system stack for Primer, Inter for Polaris).
- Run each through the full pipeline: design → build → validate → ship.
- Fix any structural gate failures before re-validating.
- Goal: all three Buttons at alpha status, having passed the deterministic structural gate.

## Execution Order

1. Carbon Button quality fix (changes the pattern)
2. component-contracts README (independent, can run in parallel with #1)
3. Both READMEs rewritten (depends on #2 for component-contracts content)
4. Primer and Polaris pipeline runs (depends on #1 for the pattern)

## Out of Scope

- **Deeper runtime tests** — the structural-only test approach matches the spec-first methodology. Adding component rendering tests (jsdom/happy-dom) would require infrastructure changes. Flag as a known limitation in the README rather than block on it.
- **Vue or Web Components scaffolding** — documented as future work, not exercised in the demo.
- **Storybook auto-start testing** — the auto-start path is specified but manual Storybook start is the normal workflow.

## Acceptance Criteria

- [ ] Carbon Button uses CSS custom properties from the token pipeline, not hardcoded hex
- [ ] Carbon Button uses horizontal flex layout, no flex-col, no absolute positioning on icon
- [ ] IBM Plex Sans is loaded via Google Fonts import
- [ ] Carbon Button passes structural validation gate after refactor
- [ ] component-contracts README reflects current schema, tools, and Vue support
- [ ] d2c README communicates value within 60 seconds of scanning
- [ ] component-contracts README communicates value within 60 seconds of scanning
- [ ] Primer Button passes full pipeline (design → build → validate → ship) at alpha
- [ ] Polaris Button passes full pipeline (design → build → validate → ship) at alpha
- [ ] All tests pass in both repos
- [ ] Both repos pushed to GitHub

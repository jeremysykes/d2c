# Code Quality Audit — Token Pipeline Integration & Documentation

## Summary

Audit of the d2c and component-contracts codebases identified gaps between the documented architecture and the current implementation. The token pipeline generates CSS custom properties but the component code doesn't consume them. Layout patterns deviate from the Figma source. Font loading is implicit rather than explicit. Documentation in both repos is structured for internal reference rather than onboarding.

This spec addresses the findings.

## Findings

### 1. Token pipeline disconnection

The build phase generates CSS custom properties to `tokens/generated/variables.css`, and the component imports that file — but the CVA variant definitions use hardcoded hex values (`bg-[#0f62fe]`) instead of the generated variables (`bg-[var(--color-button-primary-background)]`). This means the token pipeline is dead code. Changes to token values wouldn't propagate to the rendered component.

**Fix:** Replace all hardcoded color values in CVA definitions with their corresponding CSS custom property references. This closes the loop between the token pipeline and the component output.

### 2. Layout model deviation

The Carbon Button uses `flex-col` (vertical flex) on the default type variant with absolute positioning on the icon. The Figma source defines a horizontal flex container with the icon as an in-flow child. The current implementation works visually but uses a non-standard layout that required a `justify-center` patch to fix vertical alignment — a workaround that the structural validation gate caught during the initial pipeline run.

**Fix:** Rewrite to horizontal flex (`flex items-center`), remove absolute positioning from the icon, remove the `justify-center` patch. Both text and icon become in-flow flex children matching the Figma layout model.

### 3. Font loading

IBM Plex Sans resolves via a CSS variable fallback chain and an inline `style` attribute rather than an explicit font import. This is fragile — it depends on the variable being defined and the inline style being present.

**Fix:** Add an explicit `@import` for IBM Plex Sans via Google Fonts. Move font-family from the inline style attribute into the CVA base class via the token variable.

### 4. Documentation structure

Both READMEs are structured as technical reference — configuration flags, schema definitions, file trees. The problem statement and architectural value are buried. The component-contracts README is stale (references removed tools and old schema fields).

**Fix:** Restructure both READMEs with the value proposition and architecture overview above the fold. Technical reference moves below. Update component-contracts README to reflect the current schema, tool surface, and Vue framework support.

### 5. Incomplete pipeline coverage

Only the Carbon Button has run through the full pipeline with the redesigned structural validation gate. Primer and Polaris Buttons are at `build` status with the original extraction.

**Fix:** Apply the same token integration and layout patterns to Primer and Polaris, then run each through the full pipeline (design → build → validate → ship). All three components should reach `alpha` status with structural validation passing.

## Execution Order

1. Carbon Button — token refs, layout rewrite, font loading, re-validate
2. component-contracts README — align with current schema and tools (can parallel with #1)
3. Both READMEs — restructure for clarity (depends on #2)
4. Primer and Polaris — apply patterns, full pipeline run (depends on #1)

## Acceptance Criteria

- [ ] Carbon Button uses CSS custom properties from the token pipeline, not hardcoded hex
- [ ] Carbon Button uses horizontal flex layout with in-flow icon, no absolute positioning
- [ ] IBM Plex Sans loaded via explicit font import
- [ ] Carbon Button passes structural validation gate after refactor
- [ ] component-contracts README reflects current schema, tools, and Vue support
- [ ] d2c README leads with problem statement and architecture overview
- [ ] component-contracts README leads with purpose and tool surface
- [ ] Primer Button reaches alpha via full pipeline with structural validation
- [ ] Polaris Button reaches alpha via full pipeline with structural validation
- [ ] All tests pass in both repos

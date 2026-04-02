# Phase 9 — Retire Phase Demo

## Purpose

Demonstrate the retire phase using a Button → ActionButton deprecation scenario. Shows the full retirement flow: deprecation signal in the variant manifest, migration guide generation, codemod scaffold, and the removal gate blocking deletion when consumers exist.

The Carbon Button is the subject — it's "deprecated" in favor of a hypothetical ActionButton replacement. A seeded consumer file simulates real-world usage that the removal gate detects.

---

## Inputs

- Carbon Button variant manifest at `.variant-authority/button.manifest.json`
- Replacement component: `ActionButton`
- Seeded consumer file to trigger the removal gate

---

## Outputs

### 1. Updated variant manifest

`.variant-authority/button.manifest.json` — updated with `deprecated` field:
- `deprecated: true`
- `replacedBy: "ActionButton"`
- `migrationGuide: ".d2c/migration-guides/button-to-actionbutton.md"`
- `deprecatedAt: "2026-04-01T00:00:00.000Z"`

### 2. Migration guide

`.d2c/migration-guides/button-to-actionbutton.md`

Documents:
- What changed and why
- Prop mapping (old → new)
- Before/after code examples
- Breaking changes

### 3. Migration codemod

`.d2c/migration-guides/button-codemod.ts`

A codemod script that:
- Finds imports of the deprecated Button
- Rewrites to ActionButton
- Maps props where unambiguous

### 4. Seeded consumer

`demo/button/carbon/consumers/example-consumer.tsx`

A file that imports Button — simulates a consumer the removal gate should detect.

### 5. Updated status registry

Button component set to `"deprecated"` (not `"retired"`) because the seeded consumer blocks the removal gate.

---

## Edge cases

1. **Consumer exists — gate blocks**: With the seeded consumer, removal gate blocks. Status stays "deprecated", not "retired".
2. **--force-retire without --justification**: Must error. Justification is required.
3. **--force-retire with --justification**: Would override the gate (documented in migration guide, not exercised in demo since we want to show the blocking behavior).
4. **Replacement component doesn't exist yet**: ActionButton is hypothetical. The migration guide still documents the path.
5. **Multiple consumers**: The demo has one seeded consumer but the gate logic counts all.

---

## Acceptance criteria

1. `.variant-authority/button.manifest.json` has `deprecated` field with `replacedBy: "ActionButton"`
2. `.d2c/migration-guides/button-to-actionbutton.md` exists
3. `.d2c/migration-guides/button-codemod.ts` exists
4. `demo/button/carbon/consumers/example-consumer.tsx` exists (seeded consumer)
5. `.d2c/status-registry.json` shows Button in "deprecated" status
6. Status registry history has the deprecation transition entry
7. Migration guide contains before/after code examples

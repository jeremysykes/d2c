# Phase 4 — Configuration

## Purpose

Define the default flag values and diff threshold constants as typed, importable TypeScript modules. These are the single source of truth for configuration — SKILL.md and phase docs reference these values but do not hardcode them.

---

## Inputs

None. Values are derived from BRIEF.md flag table and Amendment 01.

---

## Outputs

### 1. `config/defaults.ts`

Exports a typed object containing default values for all configuration flags:

```typescript
D2cDefaults {
  truthStructure: "cva"
  truthVisual: "figma"
  truthConflictStrategy: "escalate"
  diffThresholdPixel: 0.1
  diffThresholdRegion: 15
  diffThresholdToken: 0
  viewport: "1440x900"
  figmaWritePreflight: true
  framework: "react"
  forceRetire: false
  preflightOnly: false
  tokenSource: "auto"
  storybookUrl: "http://localhost:6006"
}
```

### 2. `config/thresholds.ts`

Exports threshold constants with documentation of their units and rationale:

```typescript
PIXEL_THRESHOLD_DEFAULT: 0.1       // % of total pixels
PIXEL_THRESHOLD_UNIT: "%"
REGION_THRESHOLD_DEFAULT: 15       // px² contiguous area
REGION_THRESHOLD_UNIT: "px²"
TOKEN_THRESHOLD_DEFAULT: 0         // count, hard zero
TOKEN_THRESHOLD_UNIT: "count"
TOKEN_THRESHOLD_OVERRIDE: false    // cannot be overridden
```

---

## Edge cases

1. **Token threshold override attempt**: `TOKEN_THRESHOLD_OVERRIDE` must be `false`. Code that reads thresholds must enforce this — even if a user passes `--diff-threshold-token 5`, the effective value must remain 0.
2. **Viewport format validation**: The default viewport `"1440x900"` implies a WIDTHxHEIGHT format. Config should export the format but validation happens at parse time, not in the config module.
3. **TOKEN_SOURCE not in valid set**: defaults.ts sets `"auto"` but validation of the value against the `TokenSource` union type happens at parse time.
4. **Framework not in valid set**: defaults.ts sets `"react"` but validation happens at parse time.
5. **All values must match BRIEF.md exactly**: No deviations from the flag defaults table in the brief.

---

## Acceptance criteria

1. `config/defaults.ts` exists at `.claude/skills/d2c/config/`
2. `config/thresholds.ts` exists at `.claude/skills/d2c/config/`
3. `defaults.ts` exports a `D2C_DEFAULTS` object (or equivalent named export)
4. `defaults.ts` contains all flag defaults: truthStructure=cva, truthVisual=figma, truthConflictStrategy=escalate, viewport=1440x900, framework=react, tokenSource=auto
5. `thresholds.ts` exports pixel threshold 0.1, region threshold 15, token threshold 0
6. `thresholds.ts` documents that token threshold cannot be overridden
7. Both files use only JSON-serializable values
8. Neither file imports from schema files (config is independent of schemas)

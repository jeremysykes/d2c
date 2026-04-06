# Phase 1 — Schemas

## Purpose

Define the six TypeScript type definitions that serve as shared contracts between all lifecycle phases. These schemas define the shape of every JSON artifact written to `.d2c/` and `.variant-authority/`. They are the single source of truth for data exchange between phases — no phase may write a JSON file without conforming to its schema.

---

## Inputs

None. Schemas are defined from the BRIEF.md and README.md specifications.

---

## Outputs

All files are written to `.claude/skills/d2c/schemas/`.

### 1. `variant-manifest.ts`

The canonical component contract. Written by the Design phase, read by every subsequent phase.

```typescript
VariantManifest {
  component: string              // Component name (e.g., "Button")
  version: string                // Semver (e.g., "0.1.0")
  figmaFileKey: string           // Figma file key for source
  figmaNodeId: string            // Figma node ID for component
  variants: Record<string, VariantDefinition>
  slots: SlotDefinition[]
  tokens: Record<string, TokenBinding>
  authority: AuthorityMap
  deprecated?: DeprecationInfo
  createdAt: string              // ISO 8601
  updatedAt: string              // ISO 8601
}

VariantDefinition {
  values: string[]               // Allowed values (e.g., ["info", "success", "warning", "danger"])
  defaultValue: string           // Default value
  type: "string" | "boolean" | "number"
  description?: string
}

SlotDefinition {
  name: string                   // Slot name (e.g., "icon", "label")
  required: boolean
  description?: string
}

TokenBinding {
  figmaValue: string             // Value from Figma
  codeValue: string              // Value in code
  dtcgPath: string               // DTCG token path (e.g., "color.button.primary.background")
  category: "color" | "spacing" | "typography" | "border" | "shadow" | "opacity"
}

AuthorityMap {
  structure: "figma" | "cva"     // Who owns variant names, slots, prop types
  visual: "figma" | "cva"        // Who owns tokens, spacing, visual spec
  conflictStrategy: "escalate" | "figma-wins" | "cva-wins"
}

DeprecationInfo {
  deprecated: true
  replacedBy: string             // Replacement component name
  migrationGuide: string         // Path to migration guide
  deprecatedAt: string           // ISO 8601
  removalTarget?: string         // Target version for removal
}
```

### 2. `status-registry.ts`

Per-component lifecycle state tracker. Updated by any phase that changes lifecycle status.

```typescript
StatusRegistry {
  version: string                // Schema version (e.g., "1.0.0")
  updatedAt: string              // ISO 8601
  components: Record<string, ComponentStatus>
}

ComponentStatus {
  status: LifecyclePhase
  previousStatus?: LifecyclePhase
  updatedAt: string              // ISO 8601
  updatedBy: string              // Phase that made the change
  history: StatusHistoryEntry[]
  blockedReason?: string         // Set when status is "blocked"
}

LifecyclePhase =
  "draft" | "design" | "build" | "validate" |
  "alpha" | "beta" | "stable" |
  "deprecated" | "retired" | "blocked"

StatusHistoryEntry {
  from: LifecyclePhase
  to: LifecyclePhase
  at: string                     // ISO 8601
  by: string                     // Phase name
  reason?: string
}
```

### 3. `drift-report.ts`

Output of the Maintain phase drift detection.

```typescript
DriftReport {
  component: string
  generatedAt: string            // ISO 8601
  status: "clean" | "drifted" | "conflict"
  entries: DriftEntry[]
  summary: {
    totalChecked: number
    drifted: number
    conflicts: number
  }
}

DriftEntry {
  tokenPath: string              // DTCG path
  figmaValue: string
  codeValue: string
  authority: "figma" | "cva"
  resolution: DriftResolution
  category: "color" | "spacing" | "typography" | "border" | "shadow" | "opacity"
}

DriftResolution =
  "auto-fix-figma" | "auto-fix-code" | "escalate" | "accepted"
```

### 4. `diff-result.ts`

Output of the Validate phase Playwright visual diff.

```typescript
DiffResult {
  component: string
  generatedAt: string            // ISO 8601
  viewport: string               // e.g., "1440x900"
  passed: boolean
  gates: {
    pixel: ThresholdResult
    region: ThresholdResult
    token: ThresholdResult
  }
  screenshots: {
    baseline: string             // File path
    current: string              // File path
    diff?: string                // File path (only if delta > 0)
  }
}

ThresholdResult {
  name: "pixel" | "region" | "token"
  threshold: number              // Configured threshold
  actual: number                 // Measured value
  passed: boolean
  unit: "%" | "px²" | "count"
}
```

### 5. `batch-report.ts`

Output of batch mode execution across multiple components.

```typescript
BatchReport {
  generatedAt: string            // ISO 8601
  scope: string                  // Scope manifest path or tier name
  phase: string | "all"          // Phase run, or "all" for full pipeline
  results: BatchComponentResult[]
  summary: BatchSummary
}

BatchComponentResult {
  component: string
  status: "passed" | "failed" | "blocked" | "skipped"
  phase: string                  // Phase where it stopped (if failed)
  error?: string                 // Error message (if failed)
  duration: number               // Milliseconds
}

BatchSummary {
  total: number
  passed: number
  failed: number
  blocked: number
  skipped: number
  duration: number               // Total milliseconds
}
```

### 6. `token-source.ts`

Token extraction strategy resolution. Added by Amendment 01 (Figma Variables API is Enterprise-only).

```typescript
TokenSource = "tokens-studio" | "presourced" | "auto"

TokenSourceConfig {
  strategy: TokenSource
  tokensStudioPath: string       // path to Tokens Studio export
  presourcedPath: string         // path to committed DTCG files
  resolvedPath?: string          // populated at runtime after resolution
}

TokenResolutionResult {
  source: "tokens-studio" | "presourced"
  path: string
  resolvedAt: string             // ISO 8601
  warning?: string               // populated when falling back from tokens-studio to presourced
}
```

---

## Edge cases

1. **Empty variant manifest**: Component extracted from Figma but has no variants (e.g., a Divider component). `variants` must be `{}`, not undefined. `slots` must be `[]`.

2. **Status registry with no components**: Fresh project. `components` must be `{}`. The schema version and updatedAt must still be present.

3. **Drift report with zero entries**: Maintain phase finds no drift. `status` must be `"clean"`, `entries` must be `[]`, summary counts all zero.

4. **Diff result with token delta > 0**: Token threshold is hard zero. `gates.token.passed` must be `false` even if pixel and region pass. Overall `passed` must be `false`.

5. **Batch report with mixed results**: Some components pass, some fail, some blocked. Each result is independent. `summary` must accurately count each category.

6. **Concurrent batch writes**: Two batch runs should not corrupt the registry. Each batch report has a unique timestamp filename. Status registry updates are per-component, not bulk replace.

7. **Deprecation without replacement**: A component is deprecated but has no direct replacement. `DeprecationInfo.replacedBy` must still be provided — use `"none"` as the sentinel value, not empty string.

8. **TOKEN_SOURCE=auto with neither source available**: Both Tokens Studio export and pre-sourced files are missing. `TokenResolutionResult` must have a warning and the build phase must surface a clear error.

9. **TOKEN_SOURCE=tokens-studio but export is missing**: Explicit strategy set but file not found. Must error, not silently fall back. Only `auto` falls back.

---

## Acceptance criteria

1. All 6 schema files exist at `.claude/skills/d2c/schemas/`
2. Each file exports its main interface and all supporting types
3. All types use only JSON-serializable primitives (string, number, boolean, null, arrays, objects)
4. `LifecyclePhase` is a union type with exactly 10 values: draft, design, build, validate, alpha, beta, stable, deprecated, retired, blocked
5. `DiffResult.gates` contains exactly three gates: pixel, region, token
6. `ThresholdResult.unit` is constrained to "%" | "px²" | "count"
7. `AuthorityMap.conflictStrategy` matches the three values from the brief: escalate, figma-wins, cva-wins
8. All timestamp fields are typed as `string` (ISO 8601 format)
9. Each schema file includes a type guard function `is{SchemaName}(value: unknown): value is {SchemaName}`
10. No schema imports from any other schema file — they are self-contained
11. `token-source.ts` exports `TokenSource`, `TokenSourceConfig`, `TokenResolutionResult`, and `isTokenResolutionResult` type guard
12. `TokenSource` is a union of exactly 3 values: "tokens-studio", "presourced", "auto"

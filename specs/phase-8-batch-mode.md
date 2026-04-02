# Phase 8 — Batch Mode

## Purpose

Enable running d2c phases across multiple components in a single invocation. When `--scope` is provided, the skill reads a scope manifest listing target components, runs the specified phase for each, produces a batch report, and exits with code 1 if any component failed.

This is the CI integration point — automated pipelines can run `/d2c --scope foundation --phase validate` and get a structured pass/fail result.

---

## Inputs

- `--scope`: Path to a scope manifest JSON file or a tier name (e.g., "foundation")
- `--phase` or `--run-all`: Phase(s) to run for each component
- All standard configuration flags apply per-component

---

## Outputs

### 1. Scope manifest format

`demo/scopes/all-buttons.json`

A scope manifest is a simple JSON file listing components:

```json
{
  "name": "all-buttons",
  "description": "All three demo Button components",
  "components": ["Button", "PrimerButton", "PolarisButton"]
}
```

### 2. Batch report

`.d2c/batch-reports/{timestamp}-batch-report.json`

Per the `batch-report.ts` schema. Contains per-component results and a summary.

### 3. Updated status registry

Each component's status is updated independently based on its phase result.

---

## Edge cases

1. **One component fails, others pass**: Batch continues — failure in one does not halt others. Failed component is set to `blocked`. Summary reflects the mixed result. Exit code is 1.
2. **Scope manifest references unknown component**: Skip with status `skipped` and a warning. Do not error the entire batch.
3. **Empty scope manifest**: No components listed. Report with zero results. Exit code 0.
4. **Component already blocked**: Skip with status `skipped`. Message: "Component is blocked — resolve the blocking issue first."
5. **Scope manifest file not found**: Error with path and expected format.
6. **Concurrent batch runs**: Each report has a unique timestamp filename. No collision.

---

## Acceptance criteria

1. `demo/scopes/all-buttons.json` exists with a valid scope manifest
2. Scope manifest contains all 3 demo components
3. A sample batch report exists at `.d2c/batch-reports/` demonstrating the format
4. Batch report conforms to the `batch-report.ts` schema
5. Batch report summary counts match the results array
6. The validate.yml workflow can detect batch failures (exit code 1)
7. SKILL.md already documents batch mode (verified in Phase 2)

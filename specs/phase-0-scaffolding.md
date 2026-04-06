# Phase 0 — Project Scaffolding

## Purpose

Establish the foundational project structure, configuration, and CI pipelines for the `d2c` skill. This phase produces a buildable, testable, lintable TypeScript project with all directories in place, environment variable documentation, and two GitHub Actions workflows. No skill logic is implemented — this is infrastructure only.

---

## Inputs

None. This phase has no runtime inputs. All values are derived from the BRIEF.md specification.

---

## Outputs

### 1. `package.json`

| Field | Value |
|---|---|
| `name` | `d2c` |
| `version` | `0.1.0` |
| `type` | `module` (ESM-only, required for Storybook 10) |
| `engines.node` | `>=22.19.0` |
| `scripts.test` | `vitest run` |
| `scripts.test:watch` | `vitest` |
| `scripts.storybook` | `storybook dev -p 6006` |
| `scripts.build-storybook` | `storybook build` |
| `scripts.validate` | `vitest run && tsc --noEmit` |

**Dependencies:**
- `component-contracts`: `file:../component-contracts` (peer dependency, local path during development)

**Dev dependencies (minimum set):**
- `typescript` ^5.7
- `vitest` ^3.x
- `@storybook/react` ^10.3 (when available; ^8.x as interim)
- `@storybook/addon-mcp` (Storybook MCP addon)
- `react` ^19
- `react-dom` ^19
- `class-variance-authority` ^0.7
- `@radix-ui/react-*` (primitives as needed)

### 2. `tsconfig.json`

| Field | Value |
|---|---|
| `compilerOptions.target` | `ES2022` |
| `compilerOptions.module` | `ESNext` |
| `compilerOptions.moduleResolution` | `bundler` |
| `compilerOptions.strict` | `true` |
| `compilerOptions.esModuleInterop` | `true` |
| `compilerOptions.skipLibCheck` | `true` |
| `compilerOptions.outDir` | `dist` |
| `compilerOptions.rootDir` | `.` |
| `compilerOptions.declaration` | `true` |
| `compilerOptions.jsx` | `react-jsx` |
| `include` | `[".claude/skills/d2c/schemas/**/*.ts", ".claude/skills/d2c/config/**/*.ts", "demo/**/*.ts", "demo/**/*.tsx", "tests/**/*.ts"]` |
| `exclude` | `["node_modules", "dist"]` |

### 3. `.env.example`

Exact contents specified in BRIEF.md — 6 variables with prescribed comments. No deviations.

### 4. `.github/workflows/storybook.yml`

- Trigger: `push` to `main`
- Node version: `22.x`
- Steps: checkout → setup Node → install → build Storybook → deploy to `gh-pages`
- Outputs Storybook URL in workflow summary

### 5. `.github/workflows/validate.yml`

- Trigger: `pull_request`
- Node version: `22.x`
- Steps: checkout → setup Node → install → run tests → typecheck → check status registry consistency
- Exit code 1 if any component is in `blocked` state

### 6. Directory structure

All directories created empty (with `.gitkeep` where needed):

```
.claude/skills/d2c/phases/
.claude/skills/d2c/mcps/
.claude/skills/d2c/schemas/
.claude/skills/d2c/config/
demo/button/carbon/
demo/button/primer/
demo/button/polaris/
demo/figma/
.variant-authority/
.d2c/diff-baseline/
.d2c/diff-results/
.d2c/changelogs/
.d2c/migration-guides/
.d2c/batch-reports/
specs/
context/
tests/
```

### 7. `.gitignore`

Must include: `node_modules/`, `dist/`, `.env`, `.d2c/diff-results/`, `.d2c/diff-baseline/`, `storybook-static/`

---

## Edge cases

1. **`component-contracts` not available at `../component-contracts`**: `npm install` will fail on the local path dependency. The `package.json` must include it, but installation will fail until the repo exists. This is expected — surface a clear error message in the spec, not a workaround.

2. **Node version below 22.19**: `engines` field enforces minimum. `npm install` with `engine-strict=true` in `.npmrc` will reject. Tests must verify the `engines` field is present.

3. **ESM-only project**: All config files (vitest, storybook) must use ESM `import`/`export` syntax, never `require()`. Tests must verify `"type": "module"` in package.json.

4. **Empty `.d2c/` directories on fresh clone**: `.gitkeep` files ensure directories are tracked. The status-registry.json and drift-report.json are not created until their respective phases run.

5. **GitHub Actions on fork**: Workflows should not fail on forks that lack secrets. The `storybook.yml` deploy step should be conditional on the `GITHUB_TOKEN` having write permissions.

6. **Storybook 10 not yet at v10.3**: If `@storybook/react@^10.3` is not yet published, use the latest available Storybook 10.x and document the gap. Do not fall back to Storybook 8.

---

## Acceptance criteria

1. `package.json` exists at repo root with `name: "d2c"`, `type: "module"`, `engines.node: ">=22.19.0"`
2. `package.json` contains all scripts listed above (`test`, `test:watch`, `storybook`, `build-storybook`, `validate`)
3. `package.json` lists `component-contracts` as a dependency with `file:../component-contracts` path
4. `tsconfig.json` exists with `strict: true`, `module: "ESNext"`, `jsx: "react-jsx"`
5. `.env.example` exists with exactly 6 variables and the prescribed Figma token URL comment
6. `.github/workflows/storybook.yml` exists, triggers on `push` to `main`, uses Node 22.x
7. `.github/workflows/validate.yml` exists, triggers on `pull_request`, uses Node 22.x
8. All directories from the structure list exist
9. `.gitignore` includes `node_modules/`, `dist/`, `.env`
10. Project is ESM-only (`"type": "module"` in package.json)

---
phase: ship
description: Promote component through lifecycle stages, generate changelog, publish corrections
compatibility: [claude-code, cursor, codex-cli]
---

# Ship Phase

Promote a validated component through the lifecycle stages (alpha → beta → stable), generate semver and changelog, and publish any corrections back to Figma within Pro plan capabilities.

## Required MCP servers

- **Figma MCP** — component description updates, Dev Mode annotations
- **Variant Authority MCP** — registry version update

## Inputs

- `--component`: Target component name
- `--figma-write-preflight`: Run preflight before Figma writes (default: true)
- Variant manifest at `.variant-authority/{component}.manifest.json`
- Diff result at `.d2c/diff-results/{component}-latest.json`

## Prerequisites

- Component must be in `"validate"` status with all gates passed
- Diff result must show `passed: true`

## Steps

### 1. Figma write preflight

If `--figma-write-preflight` is true:

- Attempt a no-op PATCH to the component's Figma file (update description to its current value)
- If the PATCH returns 403, halt immediately with a clear error:
  - Report the affected Figma file
  - Report the required permission level (Editor on the file)
  - Do not proceed to any write operations
- If the PATCH succeeds, continue

This tests actual write capability, not workspace role. A user can be a workspace Editor but have view-only access on a specific file.

### 2. Determine promotion target

Read current status from the registry and determine the next stage:

| Current status | Promotes to |
|---|---|
| validate | alpha |
| alpha | beta |
| beta | stable |
| stable | stable (no-op, already at target) |

Each promotion is a separate ship invocation. Running ship on a `validate` component moves it to `alpha`, not directly to `stable`.

### 3. Generate semver

Apply semver based on the promotion:

| Promotion | Version bump |
|---|---|
| → alpha | `x.y.z-alpha.1` (or increment alpha counter) |
| → beta | `x.y.z-beta.1` (or increment beta counter) |
| → stable | `x.y.z` (remove prerelease tag) |

Update the `version` field in the variant manifest.

### 4. Generate changelog

Create or append to `.d2c/changelogs/{component}-changelog.md`:

- Include the version number and timestamp
- Summarize what changed since the last version (diff from previous manifest)
- List any token corrections applied
- List any variant additions or removals

### 5. Publish corrections to Figma (Pro plan scope)

On a Pro Figma plan, the ship phase can:

- **Update component descriptions**: Write the current version, status, and changelog summary to the component's description field in Figma
- **Add Dev Mode annotations**: Attach code snippets and prop documentation visible in Dev Mode

On a Pro plan, the ship phase **cannot**:

- Write Variable values back to Figma programmatically (requires Enterprise)
- Update library analytics (requires Enterprise)

For token corrections that need to flow back to Figma:

- Export the corrected DTCG JSON to `demo/{component}/tokens/corrected/`
- Surface a message: "Token corrections exported. Re-import via Tokens Studio to update Figma Variables."
- This is a manual step — document it clearly, do not present it as automatic

### 6. Update Variant Authority registry

Update the variant manifest:

- Bump `version` per semver rules
- Update `updatedAt` timestamp
- Write updated manifest to `.variant-authority/{component}.manifest.json`

### 7. Update status registry

- Set status to the promotion target (alpha, beta, or stable)
- Record the transition in history with the version number

## Output artifacts

| Artifact | Location | Schema |
|---|---|---|
| Changelog | `.d2c/changelogs/{component}-changelog.md` | — |
| Corrected tokens | `demo/{component}/tokens/corrected/` (if corrections exist) | — |
| Variant manifest | `.variant-authority/{component}.manifest.json` | `variant-manifest.ts` |
| Status registry | `.d2c/status-registry.json` | `status-registry.ts` |

## Failure modes

- **Figma preflight fails (403)**: Halt before any writes. Report file and required permission.
- **Component not in validate status**: Error — run validate phase first. Report current status.
- **Diff result shows failures**: Error — all three gates must pass before ship. List which gates failed.
- **Variant Authority MCP not connected**: Cannot update registry. Error with install instructions.

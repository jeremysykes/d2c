# d2c — Amendment 01: Figma Plan Constraints & Token Pipeline Resolution

> This document amends the original `BRIEF.md`.
> Read the original brief first. This document takes precedence wherever it conflicts.

---

## Context

During pre-development planning, a critical constraint was identified with the Figma REST API
that affects the token extraction pipeline described in the original brief. This amendment
documents the constraint precisely, the options evaluated, the chosen solution, and all
implementation instructions that follow from that decision.

---

## The constraint

### What is blocked

All three Figma Variables REST API endpoints are restricted to full members of
Enterprise Figma organizations:

| Endpoint | Operation | Plan required |
|---|---|---|
| `GET /v1/files/:key/variables/local` | Read local variables + values | Enterprise only |
| `GET /v1/files/:key/variables/published` | Read published variables | Enterprise only |
| `POST /v1/files/:key/variables` | Create / update / delete variables | Enterprise only |

Attempting to call any of these endpoints on a Pro plan returns:

```json
{
  "status": 403,
  "err": "Limited by Figma plan"
}
```

Reference: https://developers.figma.com/docs/rest-api/variables-endpoints/

### What this means for d2c

The original brief described a token pipeline starting with the Figma MCP reading
Variables directly via the REST API. That approach is not viable on a Pro plan.

Two phases are directly affected:

**Build phase — token extraction**
The pipeline cannot read Figma Variable values to generate DTCG JSON.
The source of the token data must come from a different mechanism.

**Ship phase — token write-back**
Writing token corrections back to Figma Variables via `POST /v1/files/:key/variables`
is also blocked. The code→design direction for tokens requires an alternative.

### What is NOT blocked on Pro

The following REST API endpoints remain available on Pro and are unaffected:

- `GET /v1/files/:key` — file document, component structure, layer hierarchy,
  `boundVariables` property (returns variable ID references, not values)
- `GET /v1/files/:key/components` — component metadata
- `GET /v1/files/:key/styles` — style metadata
- `GET /v1/images/:key` — image/frame export for Playwright diff

The Figma MCP can still read component structure, variant definitions, layout, and
export frames for visual diffing. Only the Variables value layer is blocked.

---

## Options evaluated

### Option A — Figma Plugin API bridge

The Figma Plugin API has full Variables access regardless of plan tier. It runs
inside the Figma desktop app with no plan restriction.

**Verdict:** Viable as a workaround but introduces a manual gate that breaks the
automated pipeline story. Deferred as optional escape hatch.

### Option B — Tokens Studio as extraction intermediary

Tokens Studio is a Figma plugin (free tier available) that reads Variables and
Styles and exports them as DTCG-compatible JSON.

**Verdict:** Chosen primary solution. Industry-standard approach used by Shopify, GitHub, and others.

### Option C — Pre-sourced DTCG JSON from open-source repos

IBM Carbon and GitHub Primer publish their design tokens as open-source DTCG JSON
files in public GitHub repositories.

**Verdict:** Chosen fallback. Used when demo needs to be runnable without Tokens Studio setup.

---

## Chosen solution

### Primary: Option B (Tokens Studio)

```
Figma Variables
  → Tokens Studio plugin (manual export, free tier)
  → DTCG JSON files committed to demo/{system}/tokens/
  → Style Dictionary transform
  → Tailwind CSS custom properties + TypeScript token types
  → CVA variant definitions
```

### Fallback: Option C (pre-sourced DTCG JSON)

A `TOKEN_SOURCE` environment variable controls which path is active:

```bash
TOKEN_SOURCE=tokens-studio   # reads from Tokens Studio export (default)
TOKEN_SOURCE=presourced       # reads from committed DTCG files
TOKEN_SOURCE=auto             # uses tokens-studio if export exists, falls back to presourced
```

Default is `auto`.

---

## Token sources

| System | Token source |
|---|---|
| Carbon | https://github.com/carbon-design-system/carbon/tree/main/packages/tokens |
| Primer | https://github.com/primer/primitives/tree/main/src/tokens |

---

## Ship phase — code→design write-back scope

**What the ship phase CAN do (Pro plan):**
- Update component descriptions in Figma via REST API
- Add Dev Mode annotations via REST API
- Export the updated DTCG JSON and surface it for manual Tokens Studio re-import

**What requires Enterprise (deferred):**
- Writing Variable values back to Figma programmatically

---

## References

| Resource | URL |
|---|---|
| Tokens Studio website | https://tokens.studio/ |
| Figma plugin | https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma |
| DTCG format docs | https://tr.designtokens.org/format/ |
| Style Dictionary | https://styledictionary.com/ |

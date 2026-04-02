# Figma API Boundaries

## Purpose

This document maps exactly what the Figma REST API can and cannot do at each plan tier, as it pertains to d2c. It serves as a reference for contributors and as a decision record for why the token pipeline architecture is structured the way it is.

## API endpoints by plan tier

### Available on all paid plans (Pro, Business, Enterprise)

| Endpoint | Operation | d2c usage |
|---|---|---|
| `GET /v1/files/:key` | Read file document, components, layer hierarchy | Design phase: component structure extraction |
| `GET /v1/files/:key/components` | Read component metadata | Design phase: component identification |
| `GET /v1/files/:key/styles` | Read style metadata | Design phase: style references |
| `GET /v1/images/:key` | Export frames/nodes as PNG/SVG/PDF | Build phase: baseline screenshots; Validate phase: visual diff |
| `PATCH /v1/files/:key` | Update component descriptions, annotations | Ship phase: write-back (descriptions only) |

### Enterprise only

| Endpoint | Operation | d2c handling |
|---|---|---|
| `GET /v1/files/:key/variables/local` | Read local variable values | **Not used.** Values come from Tokens Studio or pre-sourced DTCG. |
| `GET /v1/files/:key/variables/published` | Read published variable values | **Not used.** Same as above. |
| `POST /v1/files/:key/variables` | Create/update/delete variables | **Not used.** Token write-back is exported as DTCG JSON for manual Tokens Studio re-import. |

Attempting Enterprise-only endpoints on a Pro plan returns:
```json
{ "status": 403, "err": "Limited by Figma plan" }
```

Reference: https://developers.figma.com/docs/rest-api/variables-endpoints/

## What d2c reads from Pro-tier API

### Component structure (via `GET /v1/files/:key`)

The file document includes:
- Component tree (children, layers, groups)
- Variant properties and values
- Layout metadata (auto-layout, constraints, spacing)
- `boundVariables` property — references to which Variable is bound to which property

**Important**: `boundVariables` returns Variable *IDs*, not values. The ID tells you "this fill uses Variable X" but not "Variable X = #0f62fe". Values require the Enterprise Variables endpoint.

### Frame export (via `GET /v1/images/:key`)

Exports any node as a rasterized image:
- PNG at specified scale (1x, 2x, etc.)
- SVG for vector export
- Used by the validate phase for Playwright visual diff baselines

## What d2c writes on Pro tier

### Component descriptions (via `PATCH`)

The ship phase can update:
- Component description text (version, status, changelog summary)
- Dev Mode annotations (code snippets, prop documentation)

The ship phase **cannot** on Pro:
- Write Variable values back to Figma
- Update library analytics

## The write preflight pattern

Before any write operation, d2c runs a no-op PATCH:

1. Read the component's current description
2. PATCH the description back to its same value (no-op)
3. If 200: write access confirmed
4. If 403: halt with clear error

This tests actual write capability on the specific file, not workspace role. A user can be a workspace Editor but have view-only access on a particular library file.

## Why this architecture

The Figma Variables API restriction is not a limitation of d2c — it reflects a real constraint in the Figma platform. Most production design systems use a plugin-based extraction layer (Tokens Studio, Figma Tokens, custom plugins) rather than raw Variables API calls. Documenting this as the standard approach is more useful to readers than a gated Enterprise-only workflow.

The pre-sourced fallback ensures the demo is runnable by anyone, regardless of Figma plan or Tokens Studio setup.

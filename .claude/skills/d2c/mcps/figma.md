---
mcp: figma
description: Figma MCP tool call patterns, preflight, and plan-tier boundaries
compatibility: [claude-code, cursor, codex-cli]
---

# Figma MCP

The design authority for d2c. Source of truth for component structure, variant definitions, token bindings, and visual spec. Used bidirectionally — reading design state in extract phases, writing corrections back in ship phases (within plan limits).

## Authentication

Requires `FIGMA_ACCESS_TOKEN` environment variable.

Generate at: https://www.figma.com/settings → Security → Personal access tokens

Required scopes:
- `file_content:read` — read file structure, components, styles
- `file_content:write` — update component descriptions (ship phase)

## Tools used by d2c

### `get_design_context`

Primary extraction tool. Returns component code, screenshot, and contextual hints.

**Used in**: Design phase (component extraction), Maintain phase (re-extraction for drift)

Parameters:
- `fileKey` — extracted from Figma file URL
- `nodeId` — component node ID (convert `-` to `:` from URL format)

Returns: Component structure, variant properties, layout metadata, code hints.

### `get_screenshot`

Export component frames as PNG images.

**Used in**: Build phase (baseline screenshots), Validate phase (comparison), Maintain phase (visual re-check)

### `get_metadata`

Read component metadata — name, description, published status.

**Used in**: Design phase (component identification)

### `use_figma`

Write operations — update component descriptions, add annotations.

**Used in**: Ship phase (write-back)

## Write preflight pattern

Before any phase that writes to Figma, run a no-op write to test actual capability:

```
1. Read the component's current description field
2. PATCH the description back to its existing value (no-op change)
3. If PATCH returns 200: write access confirmed, proceed
4. If PATCH returns 403: halt immediately
   - Report: "Figma write access denied on file {fileKey}"
   - Report: "Required: Editor access on this specific file"
   - Report: "Your workspace role may be Editor, but file-level permissions can restrict access"
   - Do not attempt any further writes
```

Why a no-op PATCH instead of role-checking:
- The Figma API exposes workspace role, not file-scoped permission
- A user can be a workspace Editor but have view-only access on a specific library file
- Checking role gives a false confidence signal — the role check passes, the write fails mid-pipeline
- The preflight tests actual capability against the actual file

## Variables API — plan restriction

The Figma REST API Variables endpoints require Enterprise plan membership:

| Endpoint | Operation | Plan required |
|---|---|---|
| `GET /v1/files/:key/variables/local` | Read local variables | Enterprise |
| `GET /v1/files/:key/variables/published` | Read published variables | Enterprise |
| `POST /v1/files/:key/variables` | Create/update/delete variables | Enterprise |

Attempting these on a Pro plan returns:
```json
{ "status": 403, "err": "Limited by Figma plan" }
```

**d2c does not use these endpoints.** Variable values are extracted via Tokens Studio (see TOKEN_SOURCE config). The Figma MCP is used for component structure, variant definitions, and frame export only.

If you have an Enterprise Figma account and want direct Variables API access, the `TOKEN_SOURCE=figma-api` option is reserved for future implementation.

Reference: https://developers.figma.com/docs/rest-api/variables-endpoints/

## Pro plan capabilities

What d2c CAN do on a Pro plan:
- Read file structure, component trees, layer hierarchy
- Read `boundVariables` property (variable ID references, not values)
- Read component metadata and styles
- Export frames as PNG for Playwright diff
- Update component descriptions
- Add Dev Mode annotations

What requires Enterprise:
- Read/write Variable values
- Library analytics

## Error patterns

| Status | Meaning | d2c action |
|---|---|---|
| 401 | Token expired or invalid | Error: "FIGMA_ACCESS_TOKEN is invalid or expired. Regenerate at https://www.figma.com/settings" |
| 403 | Permission denied or plan restriction | Check if Variables endpoint (plan) or file permission. Report specifically. |
| 404 | File or node not found | Error: "Component not found. Verify file key and node ID." |
| 429 | Rate limited | Wait and retry with exponential backoff. Figma allows ~30 requests/minute. |

## Rate limiting

Figma API rate limits are approximately 30 requests per minute per token. For batch operations:
- Insert a 2-second delay between consecutive API calls
- On 429, wait for the `Retry-After` header duration
- Log rate limit events but do not fail the phase

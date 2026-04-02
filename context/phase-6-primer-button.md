# Context: Phase 6 — Primer Button Demo

## MCP servers involved

- **Figma MCP** — component extraction (file URL TBD, Primer community file copy)

## External APIs

- **Primer Primitives GitHub repo** — token source at github.com/primer/primitives

## Schemas read or written

| Schema | Operation |
|---|---|
| `variant-manifest.ts` | Write — primer-button.manifest.json |
| `status-registry.ts` | Update — add PrimerButton component |

## Dependencies

- **Phase 5** — same artifact pattern, status registry already exists with Button component

## Key decisions

- **5 variants not 7**: Primer has default, primary, danger, outline, invisible as core variants. "Inactive" and "Star" are specialized and excluded from the standard demo.
- **Primary is green**: Primer uses green (success emphasis) for primary action, unlike Carbon's blue. This is a key cross-system difference the demo highlights.
- **System font stack**: Primer uses -apple-system, not a custom font. DTCG fontFamily token contains the full stack.
- **Separate manifest file**: Named `primer-button.manifest.json` to avoid collision with Carbon's `button.manifest.json`.

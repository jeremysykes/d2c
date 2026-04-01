# Context: Phase 5 — Carbon Button Demo

## MCP servers involved

- **Figma MCP** — used to extract Button component structure from Jeremy's Carbon file copy (file key: LIVjw0uC7eSnQAeOETXiv0, node: 1854:1776)

## External APIs

- **Figma REST API** — GET /v1/files for component structure (Pro plan sufficient)
- **Carbon GitHub repo** — token values sourced from @carbon/colors, @carbon/themes, @carbon/layout packages

## Schemas read or written

| Schema | Operation |
|---|---|
| `variant-manifest.ts` | Write — button.manifest.json |
| `status-registry.ts` | Write — status-registry.json |
| `token-source.ts` | Implicit — TOKEN_SOURCE=presourced |

## Dependencies

- **Phase 1** — schemas define the manifest and registry format
- **Phase 2** — phase docs define the design and build phase logic
- **Amendment 01** — TOKEN_SOURCE=presourced strategy

## Key decisions

- **Button over Badge**: Button has richer variants (kind×size×type×state), maps to more token categories (color, spacing, typography), and is more representative of real design system work.
- **TOKEN_SOURCE=presourced**: Carbon's tokens are SCSS-based, not DTCG. We transform the documented values into a pre-sourced DTCG JSON file. This avoids the Tokens Studio dependency.
- **Normalized variant names**: Figma uses display names ("Danger primary", "Extra large"). CVA uses kebab-case ("danger-primary", "xl"). The manifest maps between them.
- **5 sizes, not 7**: Carbon has xs, sm, md, lg, xl, expressive, 2xl. We exclude xs (deprecated in v11) and expressive (typographic mode, not dimension). That leaves sm, md, lg, xl, 2xl.
- **component-contracts not required**: Variant manifest written directly as JSON. The MCP server will be a thin layer over these same files.

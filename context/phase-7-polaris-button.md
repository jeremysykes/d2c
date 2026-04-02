# Context: Phase 7 — Polaris Button Demo

## MCP servers involved

- **Figma MCP** — component extraction (Polaris file URL TBD)

## Schemas read or written

| Schema | Operation |
|---|---|
| `variant-manifest.ts` | Write — polaris-button.manifest.json |
| `status-registry.ts` | Update — add PolarisButton component |

## Key decisions

- **Compound variant+tone pattern**: Polaris separates visual style (variant) from color treatment (tone). This is a different modeling approach than Carbon (kind) or Primer (variant). The manifest captures both as separate variant dimensions.
- **Primary is dark gray**: Polaris brand primary is #303030 — neither blue nor green. Third distinct primary color across the three demos.
- **4 sizes**: micro, slim, medium, large. Different naming and count than Carbon (5) or Primer (3).
- **Critical over destructive**: Polaris migrated from `destructive` prop to `tone="critical"`. We use the current API.

# Migration Guide: Button → ActionButton

## Summary

The `Button` component from the Carbon demo is deprecated and replaced by `ActionButton`. This guide documents the migration path.

## Why

`ActionButton` consolidates the variant surface into a cleaner API, unifies the danger variants under a `tone` prop (matching Polaris's compound pattern), and adds built-in loading state support.

## Prop mapping

| Old (Button) | New (ActionButton) | Notes |
|---|---|---|
| `kind="primary"` | `variant="primary"` | Renamed |
| `kind="secondary"` | `variant="secondary"` | Renamed |
| `kind="tertiary"` | `variant="tertiary"` | Renamed |
| `kind="ghost"` | `variant="ghost"` | Renamed |
| `kind="danger-primary"` | `variant="primary" tone="danger"` | Split into compound |
| `kind="danger-tertiary"` | `variant="tertiary" tone="danger"` | Split into compound |
| `kind="danger-ghost"` | `variant="ghost" tone="danger"` | Split into compound |
| `size="sm"` | `size="sm"` | Unchanged |
| `size="md"` | `size="md"` | Unchanged |
| `size="lg"` | `size="lg"` | Unchanged |
| `size="xl"` | `size="xl"` | Unchanged |
| `size="2xl"` | `size="2xl"` | Unchanged |
| `type="icon-only"` | `iconOnly` | Changed to boolean prop |
| `label` | `children` | Slot changed to children |
| `icon` | `trailingIcon` | Renamed for clarity |

## Breaking changes

1. **`kind` renamed to `variant`**: All `kind` prop references must be updated.
2. **Danger variants use compound pattern**: `kind="danger-primary"` becomes `variant="primary" tone="danger"`.
3. **`label` replaced by `children`**: Button text is now passed as children, not a `label` prop.
4. **`type="icon-only"` replaced by `iconOnly` boolean**: Simplifies the API.

## Before / After

### Before (old Button)

```tsx
import { Button } from "./Button";

function SaveBar() {
  return (
    <div>
      <Button label="Save" kind="primary" size="lg" />
      <Button label="Cancel" kind="ghost" size="lg" />
      <Button label="Delete" kind="danger-primary" size="md" />
    </div>
  );
}
```

### After (new ActionButton)

```tsx
import { ActionButton } from "./ActionButton";

function SaveBar() {
  return (
    <div>
      <ActionButton variant="primary" size="lg">Save</ActionButton>
      <ActionButton variant="ghost" size="lg">Cancel</ActionButton>
      <ActionButton variant="primary" tone="danger" size="md">Delete</ActionButton>
    </div>
  );
}
```

## Timeline

- **Deprecated**: 2026-04-01
- **Migration period**: Use the codemod at `.d2c/migration-guides/button-codemod.ts` to automate the bulk of the migration.
- **Removal**: Blocked until all consumers have migrated (enforced by the removal gate).

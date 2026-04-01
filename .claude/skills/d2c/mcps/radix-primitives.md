---
mcp: radix-primitives
description: Radix Primitives MCP — primitive capability map and component mapping
compatibility: [claude-code, cursor, codex-cli]
---

# Radix Primitives MCP

The primitive capability map for d2c. Provides a registry of available UI primitives that components can be built on top of. When the build phase scaffolds a component, it queries this MCP to determine if a Radix primitive exists for the target component type.

## Source

This MCP server is provided by the `component-contracts` package:

- Repository: https://github.com/jeremysykes/component-contracts
- Local path dependency: `"component-contracts": "file:../component-contracts"`
- Provides two MCP servers: `variant-authority` and `radix-primitives`

**Note**: component-contracts is currently in development. If the MCP server is not yet available, surface a requirement gate.

## Primitive capability map

The MCP maintains a registry of available Radix primitives and their capabilities:

| Primitive | React package | Vue package | Capabilities |
|---|---|---|---|
| Dialog | `@radix-ui/react-dialog` | `radix-vue` (Dialog) | Modal, focus trap, dismiss |
| Popover | `@radix-ui/react-popover` | `radix-vue` (Popover) | Anchored overlay, dismiss |
| Tooltip | `@radix-ui/react-tooltip` | `radix-vue` (Tooltip) | Hover/focus trigger, delay |
| Toggle | `@radix-ui/react-toggle` | `radix-vue` (Toggle) | Pressed state, toggle |
| ToggleGroup | `@radix-ui/react-toggle-group` | `radix-vue` (ToggleGroup) | Single/multiple selection |
| Tabs | `@radix-ui/react-tabs` | `radix-vue` (Tabs) | Tab list, panels, keyboard nav |
| Accordion | `@radix-ui/react-accordion` | `radix-vue` (Accordion) | Collapsible sections |
| Select | `@radix-ui/react-select` | `radix-vue` (Select) | Custom select, typeahead |
| DropdownMenu | `@radix-ui/react-dropdown-menu` | `radix-vue` (DropdownMenu) | Menu, submenus, keyboard |
| AlertDialog | `@radix-ui/react-alert-dialog` | `radix-vue` (AlertDialog) | Confirmation dialog |
| Checkbox | `@radix-ui/react-checkbox` | `radix-vue` (Checkbox) | Checked/indeterminate |
| RadioGroup | `@radix-ui/react-radio-group` | `radix-vue` (RadioGroup) | Single selection |
| Switch | `@radix-ui/react-switch` | `radix-vue` (Switch) | On/off toggle |
| Slider | `@radix-ui/react-slider` | `radix-vue` (Slider) | Range input |
| Label | `@radix-ui/react-label` | `radix-vue` (Label) | Accessible label |
| Separator | `@radix-ui/react-separator` | `radix-vue` (Separator) | Visual divider |

## Component-to-primitive mapping

When the build phase scaffolds a component, it queries the primitives MCP:

1. **Query**: Does a Radix primitive exist for this component type?
2. **If yes**: Import the primitive and compose the component on top of it
3. **If no**: Scaffold from scratch using standard HTML elements

The mapping is not always 1:1. A "Badge" component has no direct Radix primitive — it's a visual-only component built from `<span>` elements. A "Dialog" component maps directly to `@radix-ui/react-dialog`.

## Framework support

### React (`--framework react`)

Use `@radix-ui/react-*` packages directly:

```typescript
import * as Dialog from '@radix-ui/react-dialog';

export function MyDialog({ children }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>...</Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Vue (`--framework vue`)

Use `@radix-vue` (formerly `radix-vue`):

```vue
<script setup>
import { DialogRoot, DialogTrigger, DialogPortal, DialogOverlay, DialogContent } from '@radix-vue';
</script>

<template>
  <DialogRoot>
    <DialogTrigger><slot /></DialogTrigger>
    <DialogPortal>
      <DialogOverlay />
      <DialogContent>...</DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
```

### Web Components (`--framework wc`)

Radix primitives are React/Vue-specific. For Web Components:
- Use standard HTML elements and browser APIs
- Implement accessibility patterns manually (focus management, ARIA attributes)
- Reference WAI-ARIA Authoring Practices for patterns: https://www.w3.org/WAI/ARIA/apg/patterns/

## Fallback when no primitive exists

Not all components map to a Radix primitive. When no mapping exists:

- Scaffold using semantic HTML elements
- Add ARIA attributes manually where needed
- Document which accessibility patterns are implemented
- Flag in the variant manifest that no primitive layer is used

This is not an error — many components (Badge, Avatar, Card, etc.) are visual components that don't need a primitive's behavior layer.

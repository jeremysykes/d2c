---
mcp: playwright
description: Playwright MCP patterns for structural comparison and visual reference
compatibility: [claude-code, cursor, codex-cli]
---

# Playwright MCP

The validation layer for d2c. Navigates to rendered Storybook stories, extracts computed CSS properties for deterministic comparison against manifest tokens, and captures reference screenshots.

## Browser configuration

- **Browser**: Chromium (required — consistent rendering across environments)
- **Mode**: Headless
- **Viewport**: Locked at 1440x900 by default (configurable via `--viewport`)

## Structural comparison pattern

The primary validation tool. Playwright loads a Storybook story, then extracts computed CSS to compare against the variant manifest.

### Navigation

```
1. Navigate to: {STORYBOOK_URL}/iframe.html?id={storyId}
2. Wait for network idle + DOM stable
3. Set viewport to configured size (default: 1440x900)
```

### Convention-driven CSS extraction

The gate reads the component's `semantic.css` file (located via `semanticTokenFile` in the variant manifest) and derives what to check from the token naming convention. It then uses `page.evaluate()` to extract the corresponding computed CSS properties.

The extraction is component-agnostic — it works for any component type that has a `semantic.css` following the naming convention:

```javascript
// Root element: first child of #storybook-root
const root = document.querySelector('#storybook-root');
const el = root.querySelector('button') || root.children[0];
const styles = getComputedStyle(el);

// Extract all properties the gate needs based on semantic.css tokens
const extracted = {
  backgroundColor: styles.backgroundColor,
  color: styles.color,
  fontFamily: styles.fontFamily,
  fontSize: styles.fontSize,
  fontWeight: styles.fontWeight,
  lineHeight: styles.lineHeight,
  letterSpacing: styles.letterSpacing,
  paddingLeft: styles.paddingLeft,
  height: el.offsetHeight + "px",
  gap: styles.gap,
  borderRadius: styles.borderRadius,
};

// Layout checks via getBoundingClientRect
const textEl = el.querySelector('span');
const btnRect = el.getBoundingClientRect();
const textRect = textEl ? textEl.getBoundingClientRect() : null;
extracted.textCenter = textRect ? (textRect.top - btnRect.top) + textRect.height / 2 : null;
extracted.buttonCenter = btnRect.height / 2;
```

### Comparison rules

- **Colors**: Normalize hex to RGB. `#0f62fe` becomes `rgb(15, 98, 254)`. Tolerance: +/-2 per channel for rounding.
- **Dimensions**: Compare as px numbers. `"16px"` matches `"16px"`. Tolerance: +/-1px for subpixel rounding.
- **Font family**: String-contains check. Computed style returns a font stack. The semantic token's resolved value must appear in the string.
- **Font weight**: Numeric comparison.
- **Vertical alignment**: `|textCenter - buttonCenter| <= 2px`.
- **Icon position**: For components with icon slots in default type, icon trailing edge within 2px of expected position.
- **Icon-only aspect ratio**: For icon-only variants, `el.offsetWidth === el.offsetHeight` (button must be square).

### Output

Each comparison produces a `StructuralMismatch` if the values don't match:

```json
{
  "property": "fontFamily",
  "expected": "IBM Plex Sans",
  "actual": "\"Times New Roman\"",
  "severity": "error",
  "note": "Font not loaded — check @font-face import"
}
```

## Figma reference screenshot

Playwright can also capture a screenshot of the rendered story for side-by-side comparison with the Figma frame export. This is saved as reference material for human review — it is not used for automated gating.

```
1. Navigate to story URL
2. Wait for render
3. Capture screenshot
4. Save to .d2c/diff-results/{component}/storybook-screenshot.png
```

## What Playwright does NOT do in d2c

- **No pixel-level image diffing** — cross-renderer comparison (Figma vs browser) is too noisy for deterministic gating
- **No baseline management** — the structural gate compares against manifest values, not previous screenshots
- **No region detection** — contiguous changed pixel analysis was removed; structural comparison is more precise

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

### CSS extraction

Use `page.evaluate()` to extract computed styles from the rendered component:

```javascript
const el = document.querySelector('[data-node-id]') || document.querySelector('button');
const styles = getComputedStyle(el);
const textEl = el.querySelector('span') || el;

return {
  backgroundColor: styles.backgroundColor,
  color: styles.color,
  fontFamily: styles.fontFamily,
  fontSize: styles.fontSize,
  fontWeight: styles.fontWeight,
  lineHeight: styles.lineHeight,
  letterSpacing: styles.letterSpacing,
  paddingLeft: styles.paddingLeft,
  paddingRight: styles.paddingRight,
  height: el.offsetHeight + "px",
  textOffsetTop: textEl.offsetTop,
  buttonHeight: el.offsetHeight,
};
```

### Comparison rules

- **Colors**: Normalize hex to RGB. `#0f62fe` becomes `rgb(15, 98, 254)`. Tolerance: +/-2 per channel for rounding.
- **Dimensions**: Compare as px numbers. `"16px"` matches `"16px"`. Tolerance: +/-1px for subpixel rounding.
- **Font family**: String-contains check. Computed style returns a font stack like `"IBM Plex Sans", sans-serif`. The manifest value `IBM Plex Sans` must appear in the string.
- **Font weight**: Numeric comparison. `"400"` must equal `"400"`.
- **Vertical alignment**: For center-aligned sizes, `|textCenter - buttonCenter| <= 2px`. Where `textCenter = textOffsetTop + textHeight/2` and `buttonCenter = buttonHeight/2`.

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

/**
 * Migration codemod: Button → ActionButton
 *
 * This codemod transforms imports and usage of the deprecated Button component
 * to the new ActionButton component.
 *
 * Transformations:
 * 1. Rewrites import { Button } → import { ActionButton }
 * 2. Renames <Button → <ActionButton
 * 3. Renames kind= → variant=
 * 4. Splits danger-* kinds into variant + tone="danger"
 * 5. Converts label="" to children
 * 6. Flags type="icon-only" for manual review (→ iconOnly boolean)
 *
 * Usage:
 *   npx jscodeshift --transform .d2c/migration-guides/button-codemod.ts src/
 *
 * Note: This is a scaffold demonstrating the codemod pattern.
 * A production codemod would use jscodeshift's AST API.
 */

const KIND_TO_VARIANT: Record<string, { variant: string; tone?: string }> = {
  primary: { variant: "primary" },
  secondary: { variant: "secondary" },
  tertiary: { variant: "tertiary" },
  ghost: { variant: "ghost" },
  "danger-primary": { variant: "primary", tone: "danger" },
  "danger-tertiary": { variant: "tertiary", tone: "danger" },
  "danger-ghost": { variant: "ghost", tone: "danger" },
};

/**
 * Transform a single file's source code.
 *
 * @param source - The file's source code
 * @returns The transformed source code
 */
export function transformSource(source: string): string {
  let result = source;

  // 1. Rewrite imports
  result = result.replace(
    /import\s*\{([^}]*)\bButton\b([^}]*)\}\s*from\s*["']([^"']*\/Button)["']/g,
    (match, before, after, path) => {
      const newPath = path.replace(/Button$/, "ActionButton");
      return `import {${before}ActionButton${after}} from "${newPath}"`;
    }
  );

  // 2. Rename JSX tags
  result = result.replace(/<Button\b/g, "<ActionButton");
  result = result.replace(/<\/Button>/g, "</ActionButton>");

  // 3. Rename kind → variant and split danger compounds
  for (const [oldKind, mapping] of Object.entries(KIND_TO_VARIANT)) {
    const kindPattern = new RegExp(`kind=["']${oldKind}["']`, "g");
    if (mapping.tone) {
      result = result.replace(
        kindPattern,
        `variant="${mapping.variant}" tone="${mapping.tone}"`
      );
    } else {
      result = result.replace(kindPattern, `variant="${mapping.variant}"`);
    }
  }

  // 4. Flag type="icon-only" for manual review
  result = result.replace(
    /type=["']icon-only["']/g,
    "iconOnly /* TODO: manual review — was type=\"icon-only\" */"
  );

  return result;
}

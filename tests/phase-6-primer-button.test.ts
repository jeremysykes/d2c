import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function fileExists(relativePath: string): boolean {
  return existsSync(join(ROOT, relativePath));
}

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf-8");
}

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(ROOT, relativePath), "utf-8"));
}

// --- Token file ---

describe("Primer token file", () => {
  const tokenPath = "demo/button/primer/tokens/button.tokens.json";

  it("exists", () => {
    expect(fileExists(tokenPath)).toBe(true);
  });

  it("is valid JSON", () => {
    expect(() => readJson(tokenPath)).not.toThrow();
  });

  it("contains color tokens", () => {
    const tokens = readJson(tokenPath);
    expect(tokens.color).toBeDefined();
  });

  it("primary button is green (#1f883d)", () => {
    const content = readFile(tokenPath);
    expect(content).toContain("#1f883d");
  });

  it("contains spacing tokens", () => {
    const tokens = readJson(tokenPath);
    expect(tokens.spacing).toBeDefined();
  });
});

// --- Token source README ---

describe("Primer token source README", () => {
  it("exists", () => {
    expect(fileExists("demo/button/primer/tokens/TOKEN_SOURCE_README.md")).toBe(true);
  });

  it("documents Primer as source", () => {
    const content = readFile("demo/button/primer/tokens/TOKEN_SOURCE_README.md");
    expect(content).toMatch(/primer/i);
  });
});

// --- Variant manifest ---

describe("Primer variant manifest", () => {
  const manifestPath = ".variant-authority/primer-button.manifest.json";

  it("exists", () => {
    expect(fileExists(manifestPath)).toBe(true);
  });

  it("has component name 'PrimerButton'", () => {
    const manifest = readJson(manifestPath);
    expect(manifest.component).toBe("PrimerButton");
  });

  it("has variant with 5 values", () => {
    const manifest = readJson(manifestPath);
    const variants = manifest.variants as Record<string, { values: string[] }>;
    expect(variants.variant).toBeDefined();
    expect(variants.variant.values).toHaveLength(5);
  });

  it("has size with 3 values", () => {
    const manifest = readJson(manifestPath);
    const variants = manifest.variants as Record<string, { values: string[] }>;
    expect(variants.size).toBeDefined();
    expect(variants.size.values).toHaveLength(3);
  });

  it("includes default, primary, danger, outline, invisible variants", () => {
    const manifest = readJson(manifestPath);
    const variants = manifest.variants as Record<string, { values: string[] }>;
    const values = variants.variant.values;
    expect(values).toContain("default");
    expect(values).toContain("primary");
    expect(values).toContain("danger");
    expect(values).toContain("outline");
    expect(values).toContain("invisible");
  });
});

// --- Figma spec ---

describe("Primer Figma spec", () => {
  it("exists", () => {
    expect(fileExists("demo/figma/primer-button-spec.json")).toBe(true);
  });
});

// --- Component ---

describe("Primer Button component", () => {
  it("Button.tsx exists", () => {
    expect(fileExists("demo/button/primer/Button.tsx")).toBe(true);
  });

  it("imports cva", () => {
    const content = readFile("demo/button/primer/Button.tsx");
    expect(content).toMatch(/from\s+["']class-variance-authority["']/);
  });

  it("has 5 variant values", () => {
    const content = readFile("demo/button/primer/Button.tsx");
    expect(content).toContain("primary");
    expect(content).toContain("danger");
    expect(content).toContain("outline");
    expect(content).toContain("invisible");
  });

  it("uses green for primary (#1f883d)", () => {
    const content = readFile("demo/button/primer/Button.tsx");
    expect(content).toContain("#1f883d");
  });
});

// --- Stories ---

describe("Primer Button stories", () => {
  it("exists", () => {
    expect(fileExists("demo/button/primer/Button.stories.tsx")).toBe(true);
  });

  it("includes parameters.status", () => {
    const content = readFile("demo/button/primer/Button.stories.tsx");
    expect(content).toContain("status");
  });
});

// --- Fault ---

describe("Primer seeded fault", () => {
  it("exists", () => {
    expect(fileExists("demo/button/primer/fault/button-token-fault.json")).toBe(true);
  });

  it("differs from original", () => {
    const original = readFile("demo/button/primer/tokens/button.tokens.json");
    const fault = readFile("demo/button/primer/fault/button-token-fault.json");
    expect(original).not.toBe(fault);
  });
});

// --- Status registry ---

describe("Primer in status registry", () => {
  it("has PrimerButton component", () => {
    const registry = readJson(".d2c/status-registry.json");
    const components = registry.components as Record<string, unknown>;
    expect(components.PrimerButton).toBeDefined();
  });

  it("PrimerButton is in build status", () => {
    const registry = readJson(".d2c/status-registry.json");
    const components = registry.components as Record<string, { status: string }>;
    expect(components.PrimerButton.status).toBe("build");
  });
});

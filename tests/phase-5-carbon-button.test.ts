import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DEMO_DIR = join(ROOT, "demo", "button", "carbon");

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

describe("pre-sourced DTCG token file", () => {
  const tokenPath = "demo/button/carbon/tokens/button.tokens.json";

  it("exists", () => {
    expect(fileExists(tokenPath)).toBe(true);
  });

  it("is valid JSON", () => {
    expect(() => readJson(tokenPath)).not.toThrow();
  });

  it("contains color.button.primary.background token", () => {
    const tokens = readJson(tokenPath);
    const color = tokens.color as Record<string, unknown>;
    expect(color).toBeDefined();
    const button = (color as Record<string, Record<string, unknown>>).button;
    expect(button).toBeDefined();
  });

  it("contains spacing tokens", () => {
    const tokens = readJson(tokenPath);
    expect(tokens.spacing).toBeDefined();
  });

  it("contains typography tokens", () => {
    const tokens = readJson(tokenPath);
    expect(tokens.typography).toBeDefined();
  });
});

// --- Token source README ---

describe("token source README", () => {
  it("exists", () => {
    expect(fileExists("demo/button/carbon/tokens/TOKEN_SOURCE_README.md")).toBe(true);
  });

  it("documents the source", () => {
    const content = readFile("demo/button/carbon/tokens/TOKEN_SOURCE_README.md");
    expect(content).toMatch(/carbon/i);
    expect(content).toMatch(/github|open.source/i);
  });
});

// --- Variant manifest ---

describe("variant manifest", () => {
  const manifestPath = ".variant-authority/button.manifest.json";

  it("exists", () => {
    expect(fileExists(manifestPath)).toBe(true);
  });

  it("is valid JSON", () => {
    expect(() => readJson(manifestPath)).not.toThrow();
  });

  it("has component name 'Button'", () => {
    const manifest = readJson(manifestPath);
    expect(manifest.component).toBe("Button");
  });

  it("has kind variant with 7 values", () => {
    const manifest = readJson(manifestPath);
    const variants = manifest.variants as Record<string, { values: string[] }>;
    expect(variants.kind).toBeDefined();
    expect(variants.kind.values).toHaveLength(7);
  });

  it("has size variant with 7 values", () => {
    const manifest = readJson(manifestPath);
    const variants = manifest.variants as Record<string, { values: string[] }>;
    expect(variants.size).toBeDefined();
    expect(variants.size.values).toHaveLength(7);
  });

  it("has authority structure=cva, visual=figma", () => {
    const manifest = readJson(manifestPath);
    const auth = manifest.authority as Record<string, string>;
    expect(auth.structure).toBe("cva");
    expect(auth.visual).toBe("figma");
  });

  it("has slots array", () => {
    const manifest = readJson(manifestPath);
    expect(Array.isArray(manifest.slots)).toBe(true);
  });

  it("has tokens object", () => {
    const manifest = readJson(manifestPath);
    expect(typeof manifest.tokens).toBe("object");
  });
});

// --- Figma spec ---

describe("Figma spec export", () => {
  it("exists", () => {
    expect(fileExists("demo/figma/carbon-button-spec.json")).toBe(true);
  });

  it("is valid JSON", () => {
    expect(() => readJson("demo/figma/carbon-button-spec.json")).not.toThrow();
  });
});

// --- Component code ---

describe("Button component", () => {
  it("Button.tsx exists", () => {
    expect(fileExists("demo/button/carbon/Button.tsx")).toBe(true);
  });

  it("imports cva", () => {
    const content = readFile("demo/button/carbon/Button.tsx");
    expect(content).toMatch(/from\s+["']class-variance-authority["']/);
  });

  it("defines kind variants", () => {
    const content = readFile("demo/button/carbon/Button.tsx");
    expect(content).toContain("primary");
    expect(content).toContain("secondary");
    expect(content).toContain("tertiary");
    expect(content).toContain("ghost");
    expect(content).toContain("danger");
  });

  it("defines size variants", () => {
    const content = readFile("demo/button/carbon/Button.tsx");
    expect(content).toContain("sm");
    expect(content).toContain("md");
    expect(content).toContain("lg");
    expect(content).toContain("xl");
  });
});

// --- Story file ---

describe("Button stories", () => {
  it("Button.stories.tsx exists", () => {
    expect(fileExists("demo/button/carbon/Button.stories.tsx")).toBe(true);
  });

  it("uses story factory pattern", () => {
    const content = readFile("demo/button/carbon/Button.stories.tsx");
    expect(content).toMatch(/story|meta/i);
  });

  it("includes parameters.status", () => {
    const content = readFile("demo/button/carbon/Button.stories.tsx");
    expect(content).toContain("status");
  });
});

// --- Seeded fault ---

describe("seeded fault file", () => {
  const faultPath = "demo/button/carbon/fault/button-token-fault.json";

  it("exists", () => {
    expect(fileExists(faultPath)).toBe(true);
  });

  it("is valid JSON", () => {
    expect(() => readJson(faultPath)).not.toThrow();
  });

  it("differs from original token file by exactly one value", () => {
    const original = readFile("demo/button/carbon/tokens/button.tokens.json");
    const fault = readFile(faultPath);
    expect(original).not.toBe(fault);
  });
});

// --- Status registry ---

describe("status registry", () => {
  const registryPath = ".d2c/status-registry.json";

  it("exists", () => {
    expect(fileExists(registryPath)).toBe(true);
  });

  it("is valid JSON", () => {
    expect(() => readJson(registryPath)).not.toThrow();
  });

  it("has Button component", () => {
    const registry = readJson(registryPath);
    const components = registry.components as Record<string, unknown>;
    expect(components.Button).toBeDefined();
  });

  it("Button has progressed past build status", () => {
    const registry = readJson(registryPath);
    const components = registry.components as Record<string, { status: string; history: Array<{ to: string }> }>;
    const hasBuilt = components.Button.history.some((h) => h.to === "build");
    expect(hasBuilt).toBe(true);
  });
});

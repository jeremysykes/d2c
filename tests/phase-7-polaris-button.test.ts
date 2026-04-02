import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function fileExists(p: string): boolean {
  return existsSync(join(ROOT, p));
}

function readFile(p: string): string {
  return readFileSync(join(ROOT, p), "utf-8");
}

function readJson(p: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(ROOT, p), "utf-8"));
}

describe("Polaris token file", () => {
  const tp = "demo/button/polaris/tokens/button.tokens.json";

  it("exists", () => expect(fileExists(tp)).toBe(true));
  it("is valid JSON", () => expect(() => readJson(tp)).not.toThrow());
  it("contains color tokens", () => expect(readJson(tp).color).toBeDefined());
  it("primary is dark (#303030)", () => expect(readFile(tp)).toContain("#303030"));
  it("contains spacing tokens", () => expect(readJson(tp).spacing).toBeDefined());
});

describe("Polaris token source README", () => {
  it("exists", () => expect(fileExists("demo/button/polaris/tokens/TOKEN_SOURCE_README.md")).toBe(true));
  it("documents Polaris", () => expect(readFile("demo/button/polaris/tokens/TOKEN_SOURCE_README.md")).toMatch(/polaris|shopify/i));
});

describe("Polaris variant manifest", () => {
  const mp = ".variant-authority/polaris-button.manifest.json";

  it("exists", () => expect(fileExists(mp)).toBe(true));
  it("has component PolarisButton", () => expect(readJson(mp).component).toBe("PolarisButton"));
  it("has variant with 5 values", () => {
    const v = (readJson(mp).variants as Record<string, { values: string[] }>).variant;
    expect(v.values).toHaveLength(5);
  });
  it("has tone with 3 values", () => {
    const v = (readJson(mp).variants as Record<string, { values: string[] }>).tone;
    expect(v.values).toHaveLength(3);
  });
  it("has size with 4 values", () => {
    const v = (readJson(mp).variants as Record<string, { values: string[] }>).size;
    expect(v.values).toHaveLength(4);
  });
});

describe("Polaris Figma spec", () => {
  it("exists", () => expect(fileExists("demo/figma/polaris-button-spec.json")).toBe(true));
});

describe("Polaris Button component", () => {
  it("exists", () => expect(fileExists("demo/button/polaris/Button.tsx")).toBe(true));
  it("imports cva", () => expect(readFile("demo/button/polaris/Button.tsx")).toMatch(/from\s+["']class-variance-authority["']/));
  it("has primary variant", () => expect(readFile("demo/button/polaris/Button.tsx")).toContain("primary"));
  it("has critical tone", () => expect(readFile("demo/button/polaris/Button.tsx")).toContain("critical"));
  it("uses dark primary (#303030)", () => expect(readFile("demo/button/polaris/Button.tsx")).toContain("#303030"));
});

describe("Polaris Button stories", () => {
  it("exists", () => expect(fileExists("demo/button/polaris/Button.stories.tsx")).toBe(true));
  it("includes status", () => expect(readFile("demo/button/polaris/Button.stories.tsx")).toContain("status"));
});

describe("Polaris seeded fault", () => {
  it("exists", () => expect(fileExists("demo/button/polaris/fault/button-token-fault.json")).toBe(true));
  it("differs from original", () => {
    expect(readFile("demo/button/polaris/tokens/button.tokens.json"))
      .not.toBe(readFile("demo/button/polaris/fault/button-token-fault.json"));
  });
});

describe("Polaris in status registry", () => {
  it("has PolarisButton", () => {
    const c = readJson(".d2c/status-registry.json").components as Record<string, unknown>;
    expect(c.PolarisButton).toBeDefined();
  });
  it("is in build status", () => {
    const c = readJson(".d2c/status-registry.json").components as Record<string, { status: string }>;
    expect(c.PolarisButton.status).toBe("build");
  });
});

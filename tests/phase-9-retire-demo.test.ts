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

// --- Variant manifest deprecation ---

describe("variant manifest deprecation", () => {
  const mp = ".variant-authority/button.manifest.json";

  it("has deprecated field", () => {
    const manifest = readJson(mp);
    expect(manifest.deprecated).toBeDefined();
  });

  it("deprecated.deprecated is true", () => {
    const manifest = readJson(mp);
    const dep = manifest.deprecated as Record<string, unknown>;
    expect(dep.deprecated).toBe(true);
  });

  it("replacedBy is ActionButton", () => {
    const manifest = readJson(mp);
    const dep = manifest.deprecated as Record<string, unknown>;
    expect(dep.replacedBy).toBe("ActionButton");
  });

  it("has migrationGuide path", () => {
    const manifest = readJson(mp);
    const dep = manifest.deprecated as Record<string, unknown>;
    expect(dep.migrationGuide).toContain("button-to-actionbutton");
  });

  it("has deprecatedAt timestamp", () => {
    const manifest = readJson(mp);
    const dep = manifest.deprecated as Record<string, unknown>;
    expect(typeof dep.deprecatedAt).toBe("string");
  });
});

// --- Migration guide ---

describe("migration guide", () => {
  const gp = ".d2c/migration-guides/button-to-actionbutton.md";

  it("exists", () => expect(fileExists(gp)).toBe(true));

  it("contains before/after code examples", () => {
    const content = readFile(gp);
    expect(content).toMatch(/before|old/i);
    expect(content).toMatch(/after|new/i);
  });

  it("references ActionButton", () => {
    const content = readFile(gp);
    expect(content).toContain("ActionButton");
  });
});

// --- Codemod ---

describe("migration codemod", () => {
  it("exists", () => {
    expect(fileExists(".d2c/migration-guides/button-codemod.ts")).toBe(true);
  });

  it("references Button import", () => {
    const content = readFile(".d2c/migration-guides/button-codemod.ts");
    expect(content).toContain("Button");
  });

  it("references ActionButton replacement", () => {
    const content = readFile(".d2c/migration-guides/button-codemod.ts");
    expect(content).toContain("ActionButton");
  });
});

// --- Seeded consumer ---

describe("seeded consumer", () => {
  it("exists", () => {
    expect(fileExists("demo/button/carbon/consumers/example-consumer.tsx")).toBe(true);
  });

  it("imports Button", () => {
    const content = readFile("demo/button/carbon/consumers/example-consumer.tsx");
    expect(content).toMatch(/import.*Button/);
  });
});

// --- Status registry ---

describe("status registry deprecation", () => {
  it("Button is in deprecated status", () => {
    const registry = readJson(".d2c/status-registry.json");
    const components = registry.components as Record<string, { status: string }>;
    expect(components.Button.status).toBe("deprecated");
  });

  it("has deprecation transition in history", () => {
    const registry = readJson(".d2c/status-registry.json");
    const components = registry.components as Record<string, { history: Array<{ to: string }> }>;
    const history = components.Button.history;
    const deprecationEntry = history.find((h) => h.to === "deprecated");
    expect(deprecationEntry).toBeDefined();
  });
});

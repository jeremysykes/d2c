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

// --- Retire phase artifacts ---
// Note: The manifest may or may not currently have the deprecated field,
// depending on whether design phase has been re-run since retirement.
// These tests verify the retire artifacts exist, not current manifest state.

describe("retire phase artifacts exist", () => {
  it("migration guide exists", () => {
    expect(fileExists(".d2c/migration-guides/button-to-actionbutton.md")).toBe(true);
  });

  it("codemod exists", () => {
    expect(fileExists(".d2c/migration-guides/button-codemod.ts")).toBe(true);
  });

  it("consumer file exists for removal gate demo", () => {
    expect(fileExists("demo/button/carbon/consumers/example-consumer.tsx")).toBe(true);
  });

  it("migration guide references ActionButton", () => {
    const content = readFile(".d2c/migration-guides/button-to-actionbutton.md");
    expect(content).toContain("ActionButton");
  });

  it("codemod references ActionButton", () => {
    const content = readFile(".d2c/migration-guides/button-codemod.ts");
    expect(content).toContain("ActionButton");
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

describe("status registry tracks deprecation history", () => {
  it("Button exists in registry", () => {
    const registry = readJson(".d2c/status-registry.json");
    const components = registry.components as Record<string, { status: string }>;
    expect(components.Button).toBeDefined();
  });

  it("has deprecation transition in history", () => {
    const registry = readJson(".d2c/status-registry.json");
    const components = registry.components as Record<string, { history: Array<{ to: string }> }>;
    const history = components.Button.history;
    const deprecationEntry = history.find((h) => h.to === "deprecated");
    expect(deprecationEntry).toBeDefined();
  });
});

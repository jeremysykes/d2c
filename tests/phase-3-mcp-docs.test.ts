import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const MCPS_DIR = join(import.meta.dirname, "..", ".claude", "skills", "d2c", "mcps");

function fileExists(name: string): boolean {
  return existsSync(join(MCPS_DIR, name));
}

function readFile(name: string): string {
  return readFileSync(join(MCPS_DIR, name), "utf-8");
}

// --- File existence ---

describe("MCP doc files exist", () => {
  const docs = [
    "figma.md",
    "playwright.md",
    "storybook.md",
    "variant-authority.md",
    "radix-primitives.md",
  ];

  for (const doc of docs) {
    it(`${doc} exists`, () => {
      expect(fileExists(doc)).toBe(true);
    });
  }
});

// --- figma.md ---

describe("figma.md", () => {
  it("documents the write preflight pattern", () => {
    const content = readFile("figma.md");
    expect(content).toMatch(/preflight/i);
    expect(content).toMatch(/no-op|PATCH|write.*test/i);
  });

  it("documents Variables API Enterprise-only constraint", () => {
    const content = readFile("figma.md");
    expect(content).toMatch(/Enterprise/i);
    expect(content).toMatch(/Variables/i);
  });

  it("documents Pro plan capabilities", () => {
    const content = readFile("figma.md");
    expect(content).toMatch(/Pro/i);
  });

  it("documents authentication requirements", () => {
    const content = readFile("figma.md");
    expect(content).toMatch(/FIGMA_ACCESS_TOKEN|token|auth/i);
  });

  it("documents error patterns", () => {
    const content = readFile("figma.md");
    expect(content).toMatch(/403|404|error/i);
  });
});

// --- playwright.md ---

describe("playwright.md", () => {
  it("documents pixel threshold", () => {
    const content = readFile("playwright.md");
    expect(content).toMatch(/pixel/i);
    expect(content).toContain("0.1");
  });

  it("documents region threshold", () => {
    const content = readFile("playwright.md");
    expect(content).toMatch(/region/i);
    expect(content).toMatch(/px²|px2|square/i);
  });

  it("documents token threshold", () => {
    const content = readFile("playwright.md");
    expect(content).toMatch(/token.*0|zero.*token/i);
  });

  it("documents locked viewport", () => {
    const content = readFile("playwright.md");
    expect(content).toContain("1440");
    expect(content).toContain("900");
  });

  it("documents baseline management", () => {
    const content = readFile("playwright.md");
    expect(content).toMatch(/baseline/i);
  });

  it("documents screenshot capture", () => {
    const content = readFile("playwright.md");
    expect(content).toMatch(/screenshot/i);
  });
});

// --- storybook.md ---

describe("storybook.md", () => {
  it("documents Storybook 10 ESM-only constraint", () => {
    const content = readFile("storybook.md");
    expect(content).toMatch(/ESM|esm/);
    expect(content).toMatch(/Storybook 10|storybook.*10/i);
  });

  it("documents CSF factories format", () => {
    const content = readFile("storybook.md");
    expect(content).toMatch(/CSF.*factor|factory|factories/i);
  });

  it("documents parameters.status for lifecycle display", () => {
    const content = readFile("storybook.md");
    expect(content).toContain("parameters.status");
  });

  it("documents the MCP addon", () => {
    const content = readFile("storybook.md");
    expect(content).toMatch(/addon-mcp|MCP.*addon/i);
  });

  it("documents a11y testing", () => {
    const content = readFile("storybook.md");
    expect(content).toMatch(/a11y|accessibility/i);
  });

  it("documents STORYBOOK_URL", () => {
    const content = readFile("storybook.md");
    expect(content).toContain("STORYBOOK_URL");
  });
});

// --- variant-authority.md ---

describe("variant-authority.md", () => {
  it("references component-contracts package", () => {
    const content = readFile("variant-authority.md");
    expect(content).toMatch(/component-contracts/i);
  });

  it("documents manifest location", () => {
    const content = readFile("variant-authority.md");
    expect(content).toContain(".variant-authority");
  });

  it("documents deprecation signal", () => {
    const content = readFile("variant-authority.md");
    expect(content).toMatch(/deprecat/i);
  });

  it("documents registry operations", () => {
    const content = readFile("variant-authority.md");
    expect(content).toMatch(/read|write|query/i);
  });
});

// --- radix-primitives.md ---

describe("radix-primitives.md", () => {
  it("references component-contracts package", () => {
    const content = readFile("radix-primitives.md");
    expect(content).toMatch(/component-contracts/i);
  });

  it("documents primitive capability map", () => {
    const content = readFile("radix-primitives.md");
    expect(content).toMatch(/primitiv/i);
  });

  it("documents React support", () => {
    const content = readFile("radix-primitives.md");
    expect(content).toMatch(/@radix-ui/i);
  });

  it("documents Vue support", () => {
    const content = readFile("radix-primitives.md");
    expect(content).toMatch(/@radix-vue|radix.*vue/i);
  });
});

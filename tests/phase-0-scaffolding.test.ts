import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(ROOT, relativePath), "utf-8"));
}

function fileExists(relativePath: string): boolean {
  return existsSync(join(ROOT, relativePath));
}

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf-8");
}

// --- package.json ---

describe("package.json", () => {
  it("exists at repo root", () => {
    expect(fileExists("package.json")).toBe(true);
  });

  it('has name "d2c"', () => {
    const pkg = readJson("package.json");
    expect(pkg.name).toBe("d2c");
  });

  it("is ESM-only (type: module)", () => {
    const pkg = readJson("package.json");
    expect(pkg.type).toBe("module");
  });

  it("enforces Node >=22.19.0 via engines field", () => {
    const pkg = readJson("package.json");
    const engines = pkg.engines as Record<string, string>;
    expect(engines).toBeDefined();
    expect(engines.node).toBe(">=22.19.0");
  });

  it("contains all required scripts", () => {
    const pkg = readJson("package.json");
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts.test).toBeDefined();
    expect(scripts["test:watch"]).toBeDefined();
    expect(scripts.storybook).toBeDefined();
    expect(scripts["build-storybook"]).toBeDefined();
    expect(scripts.validate).toBeDefined();
  });

  it("lists component-contracts as a local path dependency", () => {
    const pkg = readJson("package.json");
    const deps = pkg.dependencies as Record<string, string>;
    expect(deps["component-contracts"]).toBe("file:../component-contracts");
  });
});

// --- tsconfig.json ---

describe("tsconfig.json", () => {
  it("exists at repo root", () => {
    expect(fileExists("tsconfig.json")).toBe(true);
  });

  it("has strict mode enabled", () => {
    const ts = readJson("tsconfig.json");
    const opts = ts.compilerOptions as Record<string, unknown>;
    expect(opts.strict).toBe(true);
  });

  it("targets ESNext modules", () => {
    const ts = readJson("tsconfig.json");
    const opts = ts.compilerOptions as Record<string, unknown>;
    expect(opts.module).toBe("ESNext");
  });

  it("uses react-jsx", () => {
    const ts = readJson("tsconfig.json");
    const opts = ts.compilerOptions as Record<string, unknown>;
    expect(opts.jsx).toBe("react-jsx");
  });
});

// --- .env.example ---

describe(".env.example", () => {
  it("exists at repo root", () => {
    expect(fileExists(".env.example")).toBe(true);
  });

  it("contains all 6 required variables", () => {
    const content = readFile(".env.example");
    const requiredVars = [
      "FIGMA_ACCESS_TOKEN=",
      "FIGMA_FILE_CARBON=",
      "FIGMA_FILE_PRIMER=",
      "FIGMA_FILE_POLARIS=",
      "CHROMATIC_PROJECT_TOKEN=",
      "STORYBOOK_URL=",
    ];
    for (const v of requiredVars) {
      expect(content).toContain(v);
    }
  });

  it("contains the exact Figma token URL in comments", () => {
    const content = readFile(".env.example");
    expect(content).toContain(
      "https://www.figma.com/settings"
    );
  });
});

// --- GitHub Actions ---

describe("GitHub Actions workflows", () => {
  it("storybook.yml exists", () => {
    expect(fileExists(".github/workflows/storybook.yml")).toBe(true);
  });

  it("storybook.yml triggers on push to main", () => {
    const content = readFile(".github/workflows/storybook.yml");
    expect(content).toContain("push");
    expect(content).toMatch(/branches:.*main/s);
  });

  it("storybook.yml uses Node 22", () => {
    const content = readFile(".github/workflows/storybook.yml");
    expect(content).toContain("22");
  });

  it("validate.yml exists", () => {
    expect(fileExists(".github/workflows/validate.yml")).toBe(true);
  });

  it("validate.yml triggers on pull_request", () => {
    const content = readFile(".github/workflows/validate.yml");
    expect(content).toContain("pull_request");
  });

  it("validate.yml uses Node 22", () => {
    const content = readFile(".github/workflows/validate.yml");
    expect(content).toContain("22");
  });
});

// --- Directory structure ---

describe("directory structure", () => {
  const requiredDirs = [
    ".claude/skills/d2c/phases",
    ".claude/skills/d2c/mcps",
    ".claude/skills/d2c/schemas",
    ".claude/skills/d2c/config",
    "demo/badge/carbon",
    "demo/badge/primer",
    "demo/badge/polaris",
    "demo/figma",
    ".variant-authority",
    ".d2c/diff-baseline",
    ".d2c/diff-results",
    ".d2c/changelogs",
    ".d2c/migration-guides",
    ".d2c/batch-reports",
    "specs",
    "context",
    "tests",
  ];

  for (const dir of requiredDirs) {
    it(`${dir}/ exists`, () => {
      expect(existsSync(join(ROOT, dir))).toBe(true);
    });
  }
});

// --- .gitignore ---

describe(".gitignore", () => {
  it("exists at repo root", () => {
    expect(fileExists(".gitignore")).toBe(true);
  });

  it("includes required entries", () => {
    const content = readFile(".gitignore");
    expect(content).toContain("node_modules");
    expect(content).toContain("dist");
    expect(content).toContain(".env");
  });
});

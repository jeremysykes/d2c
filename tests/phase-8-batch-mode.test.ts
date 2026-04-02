import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function fileExists(p: string): boolean {
  return existsSync(join(ROOT, p));
}

function readJson(p: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(ROOT, p), "utf-8"));
}

// --- Scope manifest ---

describe("scope manifest", () => {
  const mp = "demo/scopes/all-buttons.json";

  it("exists", () => expect(fileExists(mp)).toBe(true));
  it("is valid JSON", () => expect(() => readJson(mp)).not.toThrow());

  it("has a name field", () => {
    expect(readJson(mp).name).toBeDefined();
  });

  it("has components array", () => {
    const manifest = readJson(mp);
    expect(Array.isArray(manifest.components)).toBe(true);
  });

  it("contains all 3 demo components", () => {
    const manifest = readJson(mp);
    const components = manifest.components as string[];
    expect(components).toContain("Button");
    expect(components).toContain("PrimerButton");
    expect(components).toContain("PolarisButton");
  });
});

// --- Batch report ---

describe("batch report", () => {
  it("batch-reports directory has at least one report", () => {
    const dir = join(ROOT, ".d2c", "batch-reports");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThan(0);
  });

  it("batch report is valid JSON", () => {
    const dir = join(ROOT, ".d2c", "batch-reports");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const report = readJson(join(".d2c", "batch-reports", files[0]));
    expect(report).toBeDefined();
  });

  it("has generatedAt field", () => {
    const dir = join(ROOT, ".d2c", "batch-reports");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const report = readJson(join(".d2c", "batch-reports", files[0]));
    expect(report.generatedAt).toBeDefined();
  });

  it("has scope field", () => {
    const dir = join(ROOT, ".d2c", "batch-reports");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const report = readJson(join(".d2c", "batch-reports", files[0]));
    expect(report.scope).toBeDefined();
  });

  it("has results array", () => {
    const dir = join(ROOT, ".d2c", "batch-reports");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const report = readJson(join(".d2c", "batch-reports", files[0]));
    expect(Array.isArray(report.results)).toBe(true);
  });

  it("has summary with counts", () => {
    const dir = join(ROOT, ".d2c", "batch-reports");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const report = readJson(join(".d2c", "batch-reports", files[0]));
    const summary = report.summary as Record<string, number>;
    expect(typeof summary.total).toBe("number");
    expect(typeof summary.passed).toBe("number");
    expect(typeof summary.failed).toBe("number");
    expect(typeof summary.blocked).toBe("number");
    expect(typeof summary.skipped).toBe("number");
  });

  it("summary total matches results length", () => {
    const dir = join(ROOT, ".d2c", "batch-reports");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const report = readJson(join(".d2c", "batch-reports", files[0]));
    const results = report.results as unknown[];
    const summary = report.summary as Record<string, number>;
    expect(summary.total).toBe(results.length);
  });

  it("summary counts add up to total", () => {
    const dir = join(ROOT, ".d2c", "batch-reports");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const report = readJson(join(".d2c", "batch-reports", files[0]));
    const summary = report.summary as Record<string, number>;
    expect(summary.passed + summary.failed + summary.blocked + summary.skipped).toBe(summary.total);
  });
});

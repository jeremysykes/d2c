import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CONFIG_DIR = join(import.meta.dirname, "..", ".claude", "skills", "d2c", "config");

function fileExists(name: string): boolean {
  return existsSync(join(CONFIG_DIR, name));
}

function readFile(name: string): string {
  return readFileSync(join(CONFIG_DIR, name), "utf-8");
}

// --- File existence ---

describe("config files exist", () => {
  it("defaults.ts exists", () => {
    expect(fileExists("defaults.ts")).toBe(true);
  });

  it("thresholds.ts exists", () => {
    expect(fileExists("thresholds.ts")).toBe(true);
  });
});

// --- defaults.ts ---

describe("defaults.ts", () => {
  it("exports a named defaults object", () => {
    const content = readFile("defaults.ts");
    expect(content).toMatch(/export\s+(const|function)/);
  });

  it("truthStructure defaults to cva", () => {
    const content = readFile("defaults.ts");
    expect(content).toContain('"cva"');
  });

  it("truthVisual defaults to figma", () => {
    const content = readFile("defaults.ts");
    expect(content).toContain('"figma"');
  });

  it("truthConflictStrategy defaults to escalate", () => {
    const content = readFile("defaults.ts");
    expect(content).toContain('"escalate"');
  });

  it("viewport defaults to 1440x900", () => {
    const content = readFile("defaults.ts");
    expect(content).toContain('"1440x900"');
  });

  it("framework defaults to react", () => {
    const content = readFile("defaults.ts");
    expect(content).toContain('"react"');
  });

  it("tokenSource defaults to auto", () => {
    const content = readFile("defaults.ts");
    expect(content).toContain('"auto"');
  });

  it("storybookUrl defaults to localhost:6006", () => {
    const content = readFile("defaults.ts");
    expect(content).toContain("http://localhost:6006");
  });

  it("figmaWritePreflight defaults to true", () => {
    const content = readFile("defaults.ts");
    expect(content).toMatch(/figmaWritePreflight.*true|preflight.*true/i);
  });

  it("does not import from schema files", () => {
    const content = readFile("defaults.ts");
    expect(content).not.toMatch(/from\s+['"]\.\.\/schemas/);
  });

  it("does not have diffThresholdPixel", () => {
    const content = readFile("defaults.ts");
    expect(content).not.toMatch(/diffThresholdPixel/);
  });

  it("does not have diffThresholdRegion", () => {
    const content = readFile("defaults.ts");
    expect(content).not.toMatch(/diffThresholdRegion/);
  });
});

// --- thresholds.ts ---

describe("thresholds.ts", () => {
  it("exports token threshold of 0", () => {
    const content = readFile("thresholds.ts");
    expect(content).toMatch(/token/i);
    expect(content).toMatch(/:\s*0[,;\s\n]|=\s*0[,;\s\n]/);
  });

  it("documents that token threshold cannot be overridden", () => {
    const content = readFile("thresholds.ts");
    expect(content).toMatch(/override|immutable|cannot|hard zero/i);
  });

  it("documents token threshold unit as count", () => {
    const content = readFile("thresholds.ts");
    expect(content).toContain("count");
  });

  it("does not export pixel threshold", () => {
    const content = readFile("thresholds.ts");
    expect(content).not.toMatch(/PIXEL_THRESHOLD/);
  });

  it("does not export region threshold", () => {
    const content = readFile("thresholds.ts");
    expect(content).not.toMatch(/REGION_THRESHOLD/);
  });

  it("does not reference % or px² units", () => {
    const content = readFile("thresholds.ts");
    expect(content).not.toContain('"%"');
    expect(content).not.toContain('"px²"');
  });
});

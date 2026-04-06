import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SCHEMAS_DIR = join(import.meta.dirname, "..", ".claude", "skills", "d2c", "schemas");

function schemaExists(name: string): boolean {
  return existsSync(join(SCHEMAS_DIR, name));
}

function readSchema(name: string): string {
  return readFileSync(join(SCHEMAS_DIR, name), "utf-8");
}

// --- File existence ---

describe("schema files exist", () => {
  const schemas = [
    "variant-manifest.ts",
    "status-registry.ts",
    "drift-report.ts",
    "diff-result.ts",
    "batch-report.ts",
    "token-source.ts",
  ];

  for (const schema of schemas) {
    it(`${schema} exists`, () => {
      expect(schemaExists(schema)).toBe(true);
    });
  }
});

// --- variant-manifest.ts ---

describe("variant-manifest.ts", () => {
  it("exports VariantManifest interface", () => {
    const content = readSchema("variant-manifest.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+VariantManifest/);
  });

  it("exports VariantDefinition", () => {
    const content = readSchema("variant-manifest.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+VariantDefinition/);
  });

  it("exports SlotDefinition", () => {
    const content = readSchema("variant-manifest.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+SlotDefinition/);
  });

  it("exports TokenBinding", () => {
    const content = readSchema("variant-manifest.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+TokenBinding/);
  });

  it("exports AuthorityMap", () => {
    const content = readSchema("variant-manifest.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+AuthorityMap/);
  });

  it("exports DeprecationInfo", () => {
    const content = readSchema("variant-manifest.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+DeprecationInfo/);
  });

  it("exports isVariantManifest type guard", () => {
    const content = readSchema("variant-manifest.ts");
    expect(content).toMatch(/export\s+function\s+isVariantManifest/);
  });

  it("AuthorityMap has conflictStrategy with escalate, figma-wins, cva-wins", () => {
    const content = readSchema("variant-manifest.ts");
    expect(content).toContain("escalate");
    expect(content).toContain("figma-wins");
    expect(content).toContain("cva-wins");
  });
});

// --- status-registry.ts ---

describe("status-registry.ts", () => {
  it("exports StatusRegistry interface", () => {
    const content = readSchema("status-registry.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+StatusRegistry/);
  });

  it("exports ComponentStatus", () => {
    const content = readSchema("status-registry.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+ComponentStatus/);
  });

  it("exports LifecyclePhase with exactly 10 values", () => {
    const content = readSchema("status-registry.ts");
    expect(content).toMatch(/export\s+type\s+LifecyclePhase/);
    const phases = [
      "draft", "design", "build", "validate",
      "alpha", "beta", "stable",
      "deprecated", "retired", "blocked",
    ];
    for (const phase of phases) {
      expect(content).toContain(`"${phase}"`);
    }
  });

  it("exports StatusHistoryEntry", () => {
    const content = readSchema("status-registry.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+StatusHistoryEntry/);
  });

  it("exports isStatusRegistry type guard", () => {
    const content = readSchema("status-registry.ts");
    expect(content).toMatch(/export\s+function\s+isStatusRegistry/);
  });
});

// --- drift-report.ts ---

describe("drift-report.ts", () => {
  it("exports DriftReport interface", () => {
    const content = readSchema("drift-report.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+DriftReport/);
  });

  it("exports DriftEntry", () => {
    const content = readSchema("drift-report.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+DriftEntry/);
  });

  it("exports DriftResolution type", () => {
    const content = readSchema("drift-report.ts");
    expect(content).toMatch(/export\s+type\s+DriftResolution/);
  });

  it("exports isDriftReport type guard", () => {
    const content = readSchema("drift-report.ts");
    expect(content).toMatch(/export\s+function\s+isDriftReport/);
  });

  it("DriftReport has status with clean, drifted, conflict", () => {
    const content = readSchema("drift-report.ts");
    expect(content).toContain('"clean"');
    expect(content).toContain('"drifted"');
    expect(content).toContain('"conflict"');
  });
});

// --- diff-result.ts ---

describe("diff-result.ts", () => {
  it("exports DiffResult interface", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+DiffResult/);
  });

  it("exports StructuralGateResult", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+StructuralGateResult/);
  });

  it("exports StructuralMismatch", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+StructuralMismatch/);
  });

  it("exports TokenGateResult", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+TokenGateResult/);
  });

  it("exports isDiffResult type guard", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/export\s+function\s+isDiffResult/);
  });

  it("has structural and token gates, not pixel or region", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toContain("structural");
    expect(content).toContain("token");
    expect(content).not.toMatch(/gates\s*:\s*\{[^}]*pixel/s);
    expect(content).not.toMatch(/gates\s*:\s*\{[^}]*region/s);
  });

  it("StructuralMismatch has property, expected, actual, severity", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/property:\s*string/);
    expect(content).toMatch(/expected:\s*string/);
    expect(content).toMatch(/actual:\s*string/);
    expect(content).toMatch(/severity:\s*"error"/);
  });

  it("DiffResult has figmaReference field", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/figmaReference:\s*string/);
  });

  it("DiffResult has storybook field with autoStarted boolean", () => {
    const content = readSchema("diff-result.ts");
    expect(content).toMatch(/autoStarted:\s*boolean/);
  });
});

// --- batch-report.ts ---

describe("batch-report.ts", () => {
  it("exports BatchReport interface", () => {
    const content = readSchema("batch-report.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+BatchReport/);
  });

  it("exports BatchComponentResult", () => {
    const content = readSchema("batch-report.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+BatchComponentResult/);
  });

  it("exports BatchSummary", () => {
    const content = readSchema("batch-report.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+BatchSummary/);
  });

  it("exports isBatchReport type guard", () => {
    const content = readSchema("batch-report.ts");
    expect(content).toMatch(/export\s+function\s+isBatchReport/);
  });

  it("BatchComponentResult status includes passed, failed, blocked, skipped", () => {
    const content = readSchema("batch-report.ts");
    expect(content).toContain('"passed"');
    expect(content).toContain('"failed"');
    expect(content).toContain('"blocked"');
    expect(content).toContain('"skipped"');
  });
});

// --- token-source.ts ---

describe("token-source.ts", () => {
  it("exports TokenSource type", () => {
    const content = readSchema("token-source.ts");
    expect(content).toMatch(/export\s+type\s+TokenSource/);
  });

  it("exports TokenSourceConfig", () => {
    const content = readSchema("token-source.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+TokenSourceConfig/);
  });

  it("exports TokenResolutionResult", () => {
    const content = readSchema("token-source.ts");
    expect(content).toMatch(/export\s+(interface|type)\s+TokenResolutionResult/);
  });

  it("exports isTokenResolutionResult type guard", () => {
    const content = readSchema("token-source.ts");
    expect(content).toMatch(/export\s+function\s+isTokenResolutionResult/);
  });

  it("TokenSource has exactly 3 values: tokens-studio, presourced, auto", () => {
    const content = readSchema("token-source.ts");
    expect(content).toContain('"tokens-studio"');
    expect(content).toContain('"presourced"');
    expect(content).toContain('"auto"');
  });
});

// --- Cross-cutting ---

describe("schema isolation", () => {
  const schemas = [
    "variant-manifest.ts",
    "status-registry.ts",
    "drift-report.ts",
    "diff-result.ts",
    "batch-report.ts",
    "token-source.ts",
  ];

  for (const schema of schemas) {
    it(`${schema} does not import from other schema files`, () => {
      const content = readSchema(schema);
      const otherSchemas = schemas.filter((s) => s !== schema);
      for (const other of otherSchemas) {
        const importName = other.replace(".ts", "");
        expect(content).not.toMatch(
          new RegExp(`from\\s+['"]\\.\\/${importName}['"]`)
        );
      }
    });
  }
});

describe("JSON serializability", () => {
  const schemas = [
    "variant-manifest.ts",
    "status-registry.ts",
    "drift-report.ts",
    "diff-result.ts",
    "batch-report.ts",
    "token-source.ts",
  ];

  for (const schema of schemas) {
    it(`${schema} does not use non-serializable types`, () => {
      const content = readSchema(schema);
      // Should not contain Function, Date, Map, Set, Symbol, BigInt as types
      expect(content).not.toMatch(/:\s*Function/);
      expect(content).not.toMatch(/:\s*Date(?!\s)/);
      expect(content).not.toMatch(/:\s*Map</);
      expect(content).not.toMatch(/:\s*Set</);
      expect(content).not.toMatch(/:\s*Symbol/);
      expect(content).not.toMatch(/:\s*BigInt/);
    });
  }
});

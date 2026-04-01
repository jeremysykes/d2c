import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SKILL_DIR = join(import.meta.dirname, "..", ".claude", "skills", "d2c");

function fileExists(relativePath: string): boolean {
  return existsSync(join(SKILL_DIR, relativePath));
}

function readFile(relativePath: string): string {
  return readFileSync(join(SKILL_DIR, relativePath), "utf-8");
}

// --- File existence ---

describe("skill files exist", () => {
  it("SKILL.md exists", () => {
    expect(fileExists("SKILL.md")).toBe(true);
  });

  const phases = ["design", "build", "validate", "ship", "maintain", "retire"];
  for (const phase of phases) {
    it(`phases/${phase}.md exists`, () => {
      expect(fileExists(`phases/${phase}.md`)).toBe(true);
    });
  }
});

// --- SKILL.md ---

describe("SKILL.md", () => {
  it("contains compatibility frontmatter", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("compatibility");
    expect(content).toContain("claude-code");
    expect(content).toContain("cursor");
    expect(content).toContain("codex-cli");
  });

  it("documents --component flag", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("--component");
  });

  it("documents --phase flag", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("--phase");
  });

  it("documents --run-all flag", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("--run-all");
  });

  it("documents --truth-structure flag", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("--truth-structure");
  });

  it("documents --truth-visual flag", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("--truth-visual");
  });

  it("documents --diff-threshold-pixel flag", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("--diff-threshold-pixel");
  });

  it("documents --diff-threshold-region flag", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("--diff-threshold-region");
  });

  it("documents --diff-threshold-token flag", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("--diff-threshold-token");
  });

  it("documents --viewport flag", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("--viewport");
  });

  it("documents --framework flag", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("--framework");
  });

  it("documents --force-retire flag", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("--force-retire");
  });

  it("references schema files", () => {
    const content = readFile("SKILL.md");
    expect(content).toContain("variant-manifest");
    expect(content).toContain("status-registry");
    expect(content).toContain("drift-report");
    expect(content).toContain("diff-result");
    expect(content).toContain("batch-report");
    expect(content).toContain("token-source");
  });
});

// --- Phase docs: MCP servers ---

describe("phase docs specify required MCP servers", () => {
  const phases = ["design", "build", "validate", "ship", "maintain", "retire"];
  for (const phase of phases) {
    it(`${phase}.md specifies MCP servers`, () => {
      const content = readFile(`phases/${phase}.md`);
      expect(content).toMatch(/MCP|mcp/i);
    });
  }
});

// --- Phase docs: schemas ---

describe("phase docs specify schemas", () => {
  const phases = ["design", "build", "validate", "ship", "maintain", "retire"];
  for (const phase of phases) {
    it(`${phase}.md references schemas`, () => {
      const content = readFile(`phases/${phase}.md`);
      expect(content).toMatch(/schema|artifact/i);
    });
  }
});

// --- Phase docs: output artifacts ---

describe("phase docs specify output artifacts", () => {
  const phases = ["design", "build", "validate", "ship", "maintain", "retire"];
  for (const phase of phases) {
    it(`${phase}.md documents output artifacts`, () => {
      const content = readFile(`phases/${phase}.md`);
      expect(content).toMatch(/output|artifact|produces|writes/i);
    });
  }
});

// --- Amendment 01 compliance ---

describe("Amendment 01 compliance", () => {
  it("build.md documents TOKEN_SOURCE resolution", () => {
    const content = readFile("phases/build.md");
    expect(content).toContain("TOKEN_SOURCE");
  });

  it("build.md references Tokens Studio", () => {
    const content = readFile("phases/build.md");
    expect(content).toMatch(/Tokens Studio/i);
  });

  it("ship.md documents Pro plan write-back scope", () => {
    const content = readFile("phases/ship.md");
    expect(content).toMatch(/Pro|Enterprise|plan/i);
  });

  it("maintain.md documents on-demand invocation model", () => {
    const content = readFile("phases/maintain.md");
    expect(content).toMatch(/on-demand|invocation/i);
  });
});

// --- Retire phase specifics ---

describe("retire phase specifics", () => {
  it("documents removal gate", () => {
    const content = readFile("phases/retire.md");
    expect(content).toMatch(/removal gate|zero.*(consumer|usage)/i);
  });

  it("documents --force-retire override", () => {
    const content = readFile("phases/retire.md");
    expect(content).toContain("--force-retire");
  });

  it("documents --justification requirement", () => {
    const content = readFile("phases/retire.md");
    expect(content).toContain("--justification");
  });
});

// --- Portability ---

describe("portable format (no Claude Code-specific syntax)", () => {
  const files = [
    "SKILL.md",
    "phases/design.md",
    "phases/build.md",
    "phases/validate.md",
    "phases/ship.md",
    "phases/maintain.md",
    "phases/retire.md",
  ];

  for (const file of files) {
    it(`${file} does not use Claude Code-specific slash commands`, () => {
      const content = readFile(file);
      // Should not contain /slash-command patterns that are CC-specific
      expect(content).not.toMatch(/^\/[a-z]+ /m);
    });
  }
});

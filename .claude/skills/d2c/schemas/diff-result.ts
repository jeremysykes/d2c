export interface DiffResult {
  component: string;
  viewport: string;
  passed: boolean;
  gates: {
    structural: StructuralGateResult;
    token: TokenGateResult;
  };
  figmaReference: string;
  storybook: {
    autoStarted: boolean;
    url: string;
  };
  generatedAt: string;
}

export interface StructuralGateResult {
  passed: boolean;
  mismatches: StructuralMismatch[];
}

export interface StructuralMismatch {
  property: string;
  expected: string;
  actual: string;
  severity: "error";
  note?: string;
}

export interface TokenGateResult {
  threshold: 0;
  actual: number;
  unit: "count";
  passed: boolean;
  details?: string;
}

export function isDiffResult(
  value: unknown
): value is DiffResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.component === "string" &&
    typeof v.viewport === "string" &&
    typeof v.passed === "boolean" &&
    typeof v.gates === "object" &&
    v.gates !== null &&
    typeof v.figmaReference === "string" &&
    typeof v.storybook === "object" &&
    v.storybook !== null &&
    typeof v.generatedAt === "string"
  );
}

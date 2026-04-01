export interface DiffResult {
  component: string;
  generatedAt: string;
  viewport: string;
  passed: boolean;
  gates: {
    pixel: ThresholdResult;
    region: ThresholdResult;
    token: ThresholdResult;
  };
  screenshots: {
    baseline: string;
    current: string;
    diff?: string;
  };
}

export interface ThresholdResult {
  name: "pixel" | "region" | "token";
  threshold: number;
  actual: number;
  passed: boolean;
  unit: "%" | "px²" | "count";
}

export function isDiffResult(
  value: unknown
): value is DiffResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.component === "string" &&
    typeof v.generatedAt === "string" &&
    typeof v.viewport === "string" &&
    typeof v.passed === "boolean" &&
    typeof v.gates === "object" &&
    v.gates !== null &&
    typeof v.screenshots === "object" &&
    v.screenshots !== null
  );
}

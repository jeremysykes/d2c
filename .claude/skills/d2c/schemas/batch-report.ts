export interface BatchReport {
  generatedAt: string;
  scope: string;
  phase: string;
  results: BatchComponentResult[];
  summary: BatchSummary;
}

export interface BatchComponentResult {
  component: string;
  status: "passed" | "failed" | "blocked" | "skipped";
  phase: string;
  error?: string;
  duration: number;
}

export interface BatchSummary {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  duration: number;
}

export function isBatchReport(
  value: unknown
): value is BatchReport {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.generatedAt === "string" &&
    typeof v.scope === "string" &&
    typeof v.phase === "string" &&
    Array.isArray(v.results) &&
    typeof v.summary === "object" &&
    v.summary !== null
  );
}

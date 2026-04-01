export type DriftResolution =
  | "auto-fix-figma"
  | "auto-fix-code"
  | "escalate"
  | "accepted";

export interface DriftReport {
  component: string;
  generatedAt: string;
  status: "clean" | "drifted" | "conflict";
  entries: DriftEntry[];
  summary: {
    totalChecked: number;
    drifted: number;
    conflicts: number;
  };
}

export interface DriftEntry {
  tokenPath: string;
  figmaValue: string;
  codeValue: string;
  authority: "figma" | "cva";
  resolution: DriftResolution;
  category:
    | "color"
    | "spacing"
    | "typography"
    | "border"
    | "shadow"
    | "opacity";
}

export function isDriftReport(
  value: unknown
): value is DriftReport {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.component === "string" &&
    typeof v.generatedAt === "string" &&
    typeof v.status === "string" &&
    ["clean", "drifted", "conflict"].includes(v.status as string) &&
    Array.isArray(v.entries) &&
    typeof v.summary === "object" &&
    v.summary !== null
  );
}

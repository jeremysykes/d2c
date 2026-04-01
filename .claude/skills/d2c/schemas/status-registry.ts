export type LifecyclePhase =
  | "draft"
  | "design"
  | "build"
  | "validate"
  | "alpha"
  | "beta"
  | "stable"
  | "deprecated"
  | "retired"
  | "blocked";

export interface StatusRegistry {
  version: string;
  updatedAt: string;
  components: Record<string, ComponentStatus>;
}

export interface ComponentStatus {
  status: LifecyclePhase;
  previousStatus?: LifecyclePhase;
  updatedAt: string;
  updatedBy: string;
  history: StatusHistoryEntry[];
  blockedReason?: string;
}

export interface StatusHistoryEntry {
  from: LifecyclePhase;
  to: LifecyclePhase;
  at: string;
  by: string;
  reason?: string;
}

export function isStatusRegistry(
  value: unknown
): value is StatusRegistry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === "string" &&
    typeof v.updatedAt === "string" &&
    typeof v.components === "object" &&
    v.components !== null
  );
}

export type TokenSource = "tokens-studio" | "presourced" | "auto";

export interface TokenSourceConfig {
  strategy: TokenSource;
  tokensStudioPath: string;
  presourcedPath: string;
  resolvedPath?: string;
}

export interface TokenResolutionResult {
  source: "tokens-studio" | "presourced";
  path: string;
  resolvedAt: string;
  warning?: string;
}

export function isTokenResolutionResult(
  value: unknown
): value is TokenResolutionResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.source === "string" &&
    ["tokens-studio", "presourced"].includes(v.source as string) &&
    typeof v.path === "string" &&
    typeof v.resolvedAt === "string"
  );
}

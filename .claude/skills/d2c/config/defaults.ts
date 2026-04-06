export const D2C_DEFAULTS = {
  truthStructure: "cva" as const,
  truthVisual: "figma" as const,
  truthConflictStrategy: "escalate" as const,
  diffThresholdToken: 0,
  viewport: "1440x900",
  figmaWritePreflight: true,
  framework: "react" as const,
  forceRetire: false,
  runAll: false,
  preflightOnly: false,
  tokenSource: "auto" as const,
  storybookUrl: "http://localhost:6006",
} as const;

export type D2cDefaults = typeof D2C_DEFAULTS;

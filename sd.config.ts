import { transformGroups, formats } from "style-dictionary/enums";

const systems = ["carbon", "primer", "polaris"] as const;

const platforms: Record<string, unknown> = {};

for (const system of systems) {
  platforms[`css-${system}`] = {
    transformGroup: transformGroups.css,
    prefix: system,
    buildPath: `demo/button/${system}/tokens/generated/`,
    options: {
      outputReferences: true,
      usesDtcg: true,
    },
    files: [
      {
        destination: "variables.css",
        format: formats.cssVariables,
        options: {
          selector: `:root[data-theme="${system}"]`,
        },
      },
    ],
  };

  platforms[`ts-${system}`] = {
    transformGroup: transformGroups.js,
    buildPath: `demo/button/${system}/tokens/generated/`,
    options: {
      usesDtcg: true,
    },
    files: [
      {
        destination: "tokens.js",
        format: formats.javascriptEs6,
      },
      {
        destination: "tokens.d.ts",
        format: formats.typescriptEs6Declarations,
      },
    ],
  };
}

export default {
  source: [] as string[],
  log: {
    warnings: "warn" as const,
    verbosity: "default" as const,
  },
  platforms,
};

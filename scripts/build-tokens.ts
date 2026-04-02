/**
 * Token pipeline: DTCG JSON → CSS custom properties + TypeScript exports
 *
 * Transforms each design system's pre-sourced token file using Style Dictionary.
 * Output goes to demo/button/{system}/tokens/generated/
 */
import StyleDictionary from "style-dictionary";
import { transformGroups, formats } from "style-dictionary/enums";

const systems = [
  { name: "carbon", prefix: "cds" },
  { name: "primer", prefix: "primer" },
  { name: "polaris", prefix: "polaris" },
] as const;

async function buildTokens() {
  for (const system of systems) {
    console.log(`\nBuilding tokens for ${system.name}...`);

    const sd = new StyleDictionary({
      source: [`demo/button/${system.name}/tokens/button.tokens.json`],
      log: { warnings: "warn", verbosity: "default" },
      platforms: {
        css: {
          transformGroup: transformGroups.css,
          prefix: system.prefix,
          buildPath: `demo/button/${system.name}/tokens/generated/`,
          options: {
            outputReferences: true,
            usesDtcg: true,
          },
          files: [
            {
              destination: "variables.css",
              format: formats.cssVariables,
              options: {
                selector: `:root`,
              },
            },
          ],
        },
        ts: {
          transformGroup: transformGroups.js,
          prefix: system.prefix,
          buildPath: `demo/button/${system.name}/tokens/generated/`,
          options: {
            usesDtcg: true,
          },
          files: [
            {
              destination: "tokens.js",
              format: formats.javascriptEs6,
            },
          ],
        },
      },
    });

    await sd.buildAllPlatforms();
    console.log(`✓ ${system.name} tokens built`);
  }

  console.log("\nAll token builds complete.");
}

buildTokens().catch((err) => {
  console.error("Token build failed:", err);
  process.exit(1);
});

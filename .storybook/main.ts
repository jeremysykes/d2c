import { defineMain } from "@storybook/react-vite/node";

export default defineMain({
  framework: "@storybook/react-vite",
  stories: ["../demo/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-mcp"],
  typescript: {
    reactDocgen: "react-docgen",
  },
  viteFinal: (config) => {
    return {
      ...config,
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include ?? []),
          "react",
          "react-dom",
          "react-dom/client",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
        ],
        force: true,
      },
    };
  },
});

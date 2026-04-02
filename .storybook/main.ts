import { defineMain } from "@storybook/react-vite/node";

export default defineMain({
  framework: "@storybook/react-vite",
  stories: ["../demo/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-mcp"],
  typescript: {
    reactDocgen: "react-docgen",
  },
});

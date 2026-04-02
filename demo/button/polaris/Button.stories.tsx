import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Polaris/Button",
  component: Button,
  parameters: {
    status: { type: "build" },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "plain", "monochromePlain"],
    },
    tone: {
      control: "select",
      options: ["default", "success", "critical"],
    },
    size: {
      control: "select",
      options: ["micro", "slim", "medium", "large"],
    },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Button",
    disabled: false,
    fullWidth: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Tertiary: Story = {
  args: { variant: "tertiary" },
};

export const Plain: Story = {
  args: { variant: "plain" },
};

export const MonochromePlain: Story = {
  args: { variant: "monochromePlain" },
};

export const PrimaryCritical: Story = {
  args: { variant: "primary", tone: "critical" },
};

export const PrimarySuccess: Story = {
  args: { variant: "primary", tone: "success" },
};

export const Micro: Story = {
  args: { size: "micro" },
};

export const Slim: Story = {
  args: { size: "slim" },
};

export const Medium: Story = {
  args: { size: "medium" },
};

export const Large: Story = {
  args: { size: "large" },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

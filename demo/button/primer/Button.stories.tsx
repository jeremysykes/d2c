import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Primer/Button",
  component: Button,
  parameters: {
    status: { type: "build" },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "danger", "outline", "invisible"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    block: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Button",
    disabled: false,
    block: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Danger: Story = {
  args: { variant: "danger" },
};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const Invisible: Story = {
  args: { variant: "invisible" },
};

export const Small: Story = {
  args: { size: "sm" },
};

export const Medium: Story = {
  args: { size: "md" },
};

export const Large: Story = {
  args: { size: "lg" },
};

export const Block: Story = {
  args: { block: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithLeadingVisual: Story = {
  args: {
    leadingVisual: <span aria-hidden>★</span>,
  },
};

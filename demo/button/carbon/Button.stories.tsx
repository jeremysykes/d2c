import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Carbon/Button",
  component: Button,
  parameters: {
    status: { type: "build" },
  },
  argTypes: {
    kind: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "tertiary",
        "ghost",
        "danger-primary",
        "danger-tertiary",
        "danger-ghost",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "2xl"],
    },
    type: {
      control: "select",
      options: ["default", "icon-only"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Button",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: { kind: "primary" },
};

export const Secondary: Story = {
  args: { kind: "secondary" },
};

export const Tertiary: Story = {
  args: { kind: "tertiary" },
};

export const Ghost: Story = {
  args: { kind: "ghost" },
};

export const DangerPrimary: Story = {
  args: { kind: "danger-primary" },
};

export const DangerTertiary: Story = {
  args: { kind: "danger-tertiary" },
};

export const DangerGhost: Story = {
  args: { kind: "danger-ghost" },
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

export const ExtraLarge: Story = {
  args: { size: "xl" },
};

export const XXLarge: Story = {
  args: { size: "2xl" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const IconOnly: Story = {
  args: {
    type: "icon-only",
    icon: <span aria-hidden>+</span>,
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

/**
 * Stories sourced from Figma component set 30258:5582.
 *
 * Figma variant axes:
 * - variant: secondary, primary, danger, invisible
 * - size: small, medium, large
 * - state: rest, hover, pressed, focus, disabled, inactive
 * - alignContent: center, start
 */

const meta = {
  title: "Primer/Button",
  component: Button,
  parameters: {
    status: { type: "build" },
  },
  argTypes: {
    variant: {
      control: "select",
      // From Figma "variant" axis
      options: ["secondary", "primary", "danger", "invisible"],
    },
    size: {
      control: "select",
      // From Figma "size" axis
      options: ["sm", "md", "lg"],
    },
    alignContent: {
      control: "select",
      // From Figma "alignContent" axis
      options: ["center", "start"],
    },
    disabled: { control: "boolean" },
    block: { control: "boolean" },
  },
  args: {
    label: "Button",
    disabled: false,
    block: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Figma "variant" axis ---
export const Secondary: Story = { args: { variant: "secondary" } };
export const Primary: Story = { args: { variant: "primary" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Invisible: Story = { args: { variant: "invisible" } };

// --- Figma "size" axis ---
export const Small: Story = { args: { size: "sm" } };
export const Medium: Story = { args: { size: "md" } };
export const Large: Story = { args: { size: "lg" } };

// --- Figma "alignContent" axis ---
export const AlignStart: Story = { args: { alignContent: "start" } };

// --- Figma "state=disabled" ---
export const Disabled: Story = { args: { disabled: true } };

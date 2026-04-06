import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

/**
 * Stories sourced from Figma component set 37:12833.
 *
 * Figma variant axes:
 * - Variant: auto, primary, tertiary
 * - Tone: neutral, critical
 * - Disabled: true, false
 * - Icon only: true, false
 */

const meta = {
  title: "Polaris/Button",
  component: Button,
  parameters: {
    status: { type: "build" },
  },
  argTypes: {
    variant: {
      control: "select",
      // From Figma "Variant" axis
      options: ["auto", "primary", "tertiary"],
    },
    tone: {
      control: "select",
      // From Figma "Tone" axis
      options: ["neutral", "critical"],
    },
    disabled: { control: "boolean" },
    iconOnly: { control: "boolean" },
  },
  args: {
    label: "Label",
    disabled: false,
    iconOnly: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Figma "Variant" axis ---
export const Auto: Story = { args: { variant: "auto" } };
export const Primary: Story = { args: { variant: "primary" } };
export const Tertiary: Story = { args: { variant: "tertiary" } };

// --- Figma "Variant" × "Tone" combinations ---
export const AutoCritical: Story = { args: { variant: "auto", tone: "critical" } };
export const PrimaryCritical: Story = { args: { variant: "primary", tone: "critical" } };
export const TertiaryCritical: Story = { args: { variant: "tertiary", tone: "critical" } };

// --- Figma "Icon only" axis ---
export const IconOnly: Story = {
  args: {
    iconOnly: true,
    icon: <span style={{ fontSize: 14 }} aria-hidden>⟳</span>,
  },
};
export const PrimaryIconOnly: Story = {
  args: {
    variant: "primary",
    iconOnly: true,
    icon: <span style={{ fontSize: 14 }} aria-hidden>⟳</span>,
  },
};

// --- Figma "Disabled" axis ---
export const Disabled: Story = { args: { disabled: true } };
export const PrimaryDisabled: Story = { args: { variant: "primary", disabled: true } };

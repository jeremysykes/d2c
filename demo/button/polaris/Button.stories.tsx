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

const SettingsIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
    <circle cx="10" cy="10" r="2.5" />
    <path d="M10 3v1.5M10 15.5V17M17 10h-1.5M4.5 10H3M14.95 5.05l-1.06 1.06M6.11 13.89l-1.06 1.06M14.95 14.95l-1.06-1.06M6.11 6.11L5.05 5.05" strokeLinecap="round" />
  </svg>
);

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
    icon: SettingsIcon,
  },
};
export const PrimaryIconOnly: Story = {
  args: {
    variant: "primary",
    iconOnly: true,
    icon: SettingsIcon,
  },
};

// --- Figma "Disabled" axis ---
export const Disabled: Story = { args: { disabled: true } };
export const PrimaryDisabled: Story = { args: { variant: "primary", disabled: true } };

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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path d="M10.5 3a.5.5 0 0 0-1 0v1.036A5.5 5.5 0 0 0 4.536 9.5H3.5a.5.5 0 0 0 0 1h1.036a5.5 5.5 0 0 0 4.964 4.964V16.5a.5.5 0 0 0 1 0v-1.036A5.5 5.5 0 0 0 15.464 10.5H16.5a.5.5 0 0 0 0-1h-1.036A5.5 5.5 0 0 0 10.5 4.036V3zM10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
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

import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

/**
 * Stories sourced from Figma component set 1854:1776.
 *
 * Figma variant axes:
 * - Style: Primary, Secondary, Tertiary, Ghost, Danger primary, Danger tertiary, Danger ghost
 * - Type: Text + Icon, Icon only
 * - Size: Small, Medium, Large, Extra large, 2X large
 * - State: Enabled, Hover, Active, Focus, Disabled, Skeleton
 */

/** Carbon Add icon — from Figma node I22367:318992;1572:278 */
const AddIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
    <path d="M8.5 3v4.5H13v1H8.5V13h-1V8.5H3v-1h4.5V3z" />
  </svg>
);

const meta = {
  title: "Carbon/Button",
  component: Button,
  parameters: {
    status: { type: "build" },
  },
  argTypes: {
    kind: {
      control: "select",
      // From Figma "Style" axis
      options: ["primary", "secondary", "tertiary", "ghost", "danger-primary", "danger-tertiary", "danger-ghost"],
    },
    size: {
      control: "select",
      // From Figma "Size" axis
      options: ["sm", "md", "lg", "xl", "2xl"],
    },
    type: {
      control: "select",
      // From Figma "Type" axis
      options: ["default", "icon-only"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Button",
    icon: AddIcon,
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Figma "Style" axis ---
export const Primary: Story = { args: { kind: "primary" } };
export const Secondary: Story = { args: { kind: "secondary" } };
export const Tertiary: Story = { args: { kind: "tertiary" } };
export const Ghost: Story = { args: { kind: "ghost" } };
export const DangerPrimary: Story = { args: { kind: "danger-primary" } };
export const DangerTertiary: Story = { args: { kind: "danger-tertiary" } };
export const DangerGhost: Story = { args: { kind: "danger-ghost" } };

// --- Figma "Size" axis ---
export const Small: Story = { args: { size: "sm" } };
export const Medium: Story = { args: { size: "md" } };
export const Large: Story = { args: { size: "lg" } };
export const ExtraLarge: Story = { args: { size: "xl" } };
export const XXLarge: Story = { args: { size: "2xl" } };

// --- Figma "Type" axis ---
export const IconOnly: Story = { args: { type: "icon-only", icon: AddIcon } };

// --- Figma "State=Disabled" ---
export const Disabled: Story = { args: { disabled: true } };

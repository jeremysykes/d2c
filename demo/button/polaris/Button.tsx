import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";

const buttonVariants = cva(
  [
    "polaris-btn",
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-[var(--polaris-spacing-button-gap)]",
    "text-[length:var(--polaris-typography-button-font-size)]",
    "leading-[var(--polaris-typography-button-line-height)]",
    "font-[number:var(--polaris-typography-button-font-weight)]",
    "font-[var(--polaris-typography-button-font-family)]",
    "rounded-[var(--polaris-spacing-button-border-radius)]",
    "border",
    "border-transparent",
    "cursor-pointer",
    "transition-colors",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--polaris-color-button-primary-background)] text-[var(--polaris-color-text-on-fill)] hover:bg-[var(--polaris-color-button-primary-hover)] active:bg-[var(--polaris-color-button-primary-active)]",
        secondary:
          "bg-[var(--polaris-color-button-secondary-background)] text-[var(--polaris-color-text-primary)] hover:bg-[var(--polaris-color-button-secondary-hover)] active:bg-[var(--polaris-color-button-secondary-active)]",
        tertiary:
          "bg-[var(--polaris-color-button-tertiary-background)] text-[var(--polaris-color-text-primary)] hover:bg-[var(--polaris-color-button-tertiary-hover)] active:bg-[var(--polaris-color-button-tertiary-active)]",
        plain:
          "bg-[var(--polaris-color-button-plain-background)] text-[var(--polaris-color-text-link)] border-transparent hover:underline",
        monochromePlain:
          "bg-transparent text-[var(--polaris-color-text-primary)] border-transparent hover:underline",
      },
      tone: {
        default: "",
        success: "",
        critical: "",
      },
      size: {
        micro: "h-[var(--polaris-spacing-button-height-micro)] px-2 py-0 text-xs",
        slim: "h-[var(--polaris-spacing-button-height-slim)] px-[var(--polaris-spacing-button-padding-horizontal)] py-0",
        medium: "h-[var(--polaris-spacing-button-height-medium)] px-[var(--polaris-spacing-button-padding-horizontal)] py-0",
        large: "h-[var(--polaris-spacing-button-height-large)] px-[var(--polaris-spacing-button-padding-horizontal-large)] py-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      disabled: {
        true: "bg-[var(--polaris-color-button-disabled-background)] text-[var(--polaris-color-text-disabled)] border-transparent cursor-not-allowed hover:bg-[var(--polaris-color-button-disabled-background)] active:bg-[var(--polaris-color-button-disabled-background)]",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        tone: "critical",
        className:
          "bg-[var(--polaris-color-button-critical-background)] text-[var(--polaris-color-text-on-fill)] hover:bg-[var(--polaris-color-button-critical-hover)] active:bg-[var(--polaris-color-button-critical-active)]",
      },
      {
        variant: "primary",
        tone: "success",
        className:
          "bg-[var(--polaris-color-button-success-background)] text-[var(--polaris-color-text-on-fill)] hover:bg-[var(--polaris-color-button-success-hover)] active:bg-[var(--polaris-color-button-success-active)]",
      },
      {
        variant: "secondary",
        tone: "critical",
        className: "text-[var(--polaris-color-text-critical)]",
      },
      {
        variant: "secondary",
        tone: "success",
        className: "text-[var(--polaris-color-text-success)]",
      },
      {
        variant: "plain",
        tone: "critical",
        className: "text-[var(--polaris-color-text-critical)]",
      },
      {
        variant: "plain",
        tone: "success",
        className: "text-[var(--polaris-color-text-success)]",
      },
    ],
    defaultVariants: {
      variant: "secondary",
      tone: "default",
      size: "medium",
      fullWidth: false,
      disabled: false,
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    ButtonVariants {
  label: string;
  icon?: ReactNode;
}

export function Button({
  label,
  icon,
  variant,
  tone,
  size,
  fullWidth,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({
        variant,
        tone,
        size,
        fullWidth,
        disabled,
        className,
      })}
      disabled={disabled || undefined}
      {...props}
    >
      {icon && <span className="polaris-btn__icon w-4 h-4">{icon}</span>}
      <span className="polaris-btn__label">{label}</span>
    </button>
  );
}

export { buttonVariants };

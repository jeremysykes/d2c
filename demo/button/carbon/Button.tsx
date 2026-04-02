import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";

const buttonVariants = cva(
  [
    "cds-btn",
    "inline-flex",
    "items-center",
    "font-[var(--cds-typography-button-font-family)]",
    "text-[length:var(--cds-typography-button-font-size)]",
    "leading-[var(--cds-typography-button-line-height)]",
    "tracking-[var(--cds-typography-button-letter-spacing)]",
    "cursor-pointer",
    "border",
    "border-transparent",
    "transition-colors",
  ],
  {
    variants: {
      kind: {
        primary:
          "bg-[var(--cds-color-button-primary-background)] text-[var(--cds-color-text-on-color)] hover:bg-[var(--cds-color-button-primary-hover)] active:bg-[var(--cds-color-button-primary-active)]",
        secondary:
          "bg-[var(--cds-color-button-secondary-background)] text-[var(--cds-color-text-on-color)] hover:bg-[var(--cds-color-button-secondary-hover)] active:bg-[var(--cds-color-button-secondary-active)]",
        tertiary:
          "bg-[var(--cds-color-button-tertiary-background)] text-[var(--cds-color-text-interactive)] border-[var(--cds-color-border-interactive)] hover:bg-[var(--cds-color-button-tertiary-hover)] hover:text-[var(--cds-color-text-on-color)] active:bg-[var(--cds-color-button-tertiary-active)] active:text-[var(--cds-color-text-on-color)]",
        ghost:
          "bg-[var(--cds-color-button-ghost-background)] text-[var(--cds-color-text-interactive)] hover:bg-[var(--cds-color-button-ghost-hover)] active:bg-[var(--cds-color-button-ghost-active)]",
        "danger-primary":
          "bg-[var(--cds-color-button-danger-background)] text-[var(--cds-color-text-on-color)] hover:bg-[var(--cds-color-button-danger-hover)] active:bg-[var(--cds-color-button-danger-active)]",
        "danger-tertiary":
          "bg-transparent text-[var(--cds-color-button-danger-background)] border-[var(--cds-color-button-danger-background)] hover:bg-[var(--cds-color-button-danger-background)] hover:text-[var(--cds-color-text-on-color)] active:bg-[var(--cds-color-button-danger-active)] active:text-[var(--cds-color-text-on-color)]",
        "danger-ghost":
          "bg-transparent text-[var(--cds-color-button-danger-background)] hover:bg-[var(--cds-color-button-ghost-hover)] active:bg-[var(--cds-color-button-ghost-active)]",
      },
      size: {
        sm: "h-[var(--cds-spacing-button-height-sm)] px-[var(--cds-spacing-button-padding-horizontal)] py-0",
        md: "h-[var(--cds-spacing-button-height-md)] px-[var(--cds-spacing-button-padding-horizontal)] py-0",
        lg: "h-[var(--cds-spacing-button-height-lg)] px-[var(--cds-spacing-button-padding-horizontal)] py-0",
        xl: "h-[var(--cds-spacing-button-height-xl)] px-[var(--cds-spacing-button-padding-horizontal)] py-0",
        "2xl": "h-[var(--cds-spacing-button-height-2xl)] px-[var(--cds-spacing-button-padding-horizontal)] py-0",
      },
      type: {
        default: "",
        "icon-only": "justify-center px-[var(--cds-spacing-button-padding-icon-only)]",
      },
      disabled: {
        true: "bg-[var(--cds-color-button-disabled-background)] text-[var(--cds-color-text-on-color-disabled)] border-transparent cursor-not-allowed hover:bg-[var(--cds-color-button-disabled-background)] active:bg-[var(--cds-color-button-disabled-background)]",
        false: "",
      },
    },
    defaultVariants: {
      kind: "primary",
      size: "lg",
      type: "default",
      disabled: false,
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled">,
    ButtonVariants {
  label: string;
  icon?: ReactNode;
}

export function Button({
  label,
  icon,
  kind,
  size,
  type = "default",
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ kind, size, type, disabled, className })}
      disabled={disabled || undefined}
      {...props}
    >
      {type !== "icon-only" && <span className="cds-btn__label">{label}</span>}
      {icon && <span className="cds-btn__icon ml-2 w-[var(--cds-spacing-button-icon-size)] h-[var(--cds-spacing-button-icon-size)]">{icon}</span>}
    </button>
  );
}

export { buttonVariants };

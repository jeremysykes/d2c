import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";

const buttonVariants = cva(
  [
    "primer-btn",
    "inline-flex",
    "items-center",
    "gap-[var(--primer-spacing-button-gap)]",
    "font-[var(--primer-typography-button-font-family)]",
    "font-[number:var(--primer-typography-button-font-weight)]",
    "text-[length:var(--primer-typography-button-font-size)]",
    "leading-[var(--primer-typography-button-line-height)]",
    "rounded-md",
    "border",
    "cursor-pointer",
    "transition-colors",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primer-color-button-default-background)] text-[var(--primer-color-text-primary)] border-[var(--primer-color-border-default)] hover:bg-[var(--primer-color-button-default-hover)] active:bg-[var(--primer-color-button-default-active)]",
        primary:
          "bg-[var(--primer-color-button-primary-background)] text-[var(--primer-color-text-on-emphasis)] border-transparent hover:bg-[var(--primer-color-button-primary-hover)] active:bg-[var(--primer-color-button-primary-active)]",
        danger:
          "bg-[var(--primer-color-button-danger-background)] text-[var(--primer-color-button-danger-foreground)] border-[var(--primer-color-border-default)] hover:bg-[var(--primer-color-button-danger-hover)] hover:text-[var(--primer-color-text-on-emphasis)] hover:border-transparent active:bg-[var(--primer-color-button-danger-active)] active:text-[var(--primer-color-text-on-emphasis)]",
        outline:
          "bg-[var(--primer-color-button-outline-background)] text-[var(--primer-color-button-outline-foreground)] border-[var(--primer-color-border-default)] hover:bg-[var(--primer-color-button-outline-hover)] hover:text-[var(--primer-color-text-on-emphasis)] hover:border-transparent active:bg-[var(--primer-color-button-outline-active)] active:text-[var(--primer-color-text-on-emphasis)]",
        invisible:
          "bg-[var(--primer-color-button-invisible-background)] text-[var(--primer-color-text-primary)] border-transparent hover:bg-[var(--primer-color-button-invisible-hover)] active:bg-[var(--primer-color-button-invisible-active)]",
      },
      size: {
        sm: "h-[var(--primer-spacing-button-height-sm)] px-[var(--primer-spacing-button-padding-horizontal-sm)] py-0 text-xs",
        md: "h-[var(--primer-spacing-button-height-md)] px-[var(--primer-spacing-button-padding-horizontal)] py-0",
        lg: "h-[var(--primer-spacing-button-height-lg)] px-[var(--primer-spacing-button-padding-horizontal)] py-0",
      },
      block: {
        true: "w-full justify-center",
        false: "",
      },
      disabled: {
        true: "bg-[var(--primer-color-button-disabled-background)] text-[var(--primer-color-text-disabled)] border-[var(--primer-color-border-default)] cursor-not-allowed hover:bg-[var(--primer-color-button-disabled-background)] active:bg-[var(--primer-color-button-disabled-background)]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      block: false,
      disabled: false,
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    ButtonVariants {
  label: string;
  leadingVisual?: ReactNode;
}

export function Button({
  label,
  leadingVisual,
  variant,
  size,
  block,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, block, disabled, className })}
      disabled={disabled || undefined}
      {...props}
    >
      {leadingVisual && (
        <span className="primer-btn__leading-visual w-4 h-4">
          {leadingVisual}
        </span>
      )}
      <span className="primer-btn__label">{label}</span>
    </button>
  );
}

export { buttonVariants };

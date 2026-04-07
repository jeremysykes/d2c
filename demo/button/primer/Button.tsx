import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";
import "./tokens/semantic.css";

/**
 * Primer Button — CVA variants using semantic token utilities.
 *
 * Figma source: component set 30258:5582
 */

const buttonVariants = cva(
  [
    "primer-btn inline-flex items-center rounded-md border border-solid cursor-pointer select-none transition-colors duration-100",
    "font-[family-name:var(--primer-typography-font-family)]",
    "text-[length:var(--primer-typography-font-size)]",
    "leading-[var(--primer-typography-line-height)]",
    "font-[number:var(--primer-typography-font-weight)]",
    "gap-[var(--primer-spacing-gap)]",
  ].join(" "),
  {
    variants: {
      variant: {
        secondary:
          "bg-primer-secondary text-primer-secondary-foreground border-[var(--primer-secondary-border)] shadow-[0_1px_0_0_rgba(31,35,40,0.04)] hover:bg-primer-secondary-hover active:bg-primer-secondary-active",
        primary:
          "bg-primer-primary text-primer-primary-foreground border-[var(--primer-invisible-border)] shadow-[0_1px_0_0_rgba(31,35,40,0.04)] hover:bg-primer-primary-hover active:bg-primer-primary-active",
        danger:
          "bg-primer-danger text-primer-danger-foreground border-[var(--primer-secondary-border)] shadow-[0_1px_0_0_rgba(31,35,40,0.04)] hover:bg-primer-danger-hover hover:text-primer-primary-foreground active:bg-primer-danger-active active:text-primer-primary-foreground",
        invisible:
          "bg-primer-invisible text-primer-invisible-foreground border-[var(--primer-invisible-border)] shadow-none hover:bg-primer-invisible-hover active:bg-primer-invisible-active",
      },
      size: {
        sm: "h-[var(--primer-spacing-height-sm)] px-[var(--primer-spacing-padding-horizontal-sm)] text-xs",
        md: "h-[var(--primer-spacing-height-md)] px-[var(--primer-spacing-padding-horizontal)]",
        lg: "h-[var(--primer-spacing-height-lg)] px-[var(--primer-spacing-padding-horizontal)]",
      },
      alignContent: {
        center: "justify-center",
        start: "justify-start",
      },
      block: {
        true: "w-full",
        false: "",
      },
      disabled: {
        true: "bg-primer-disabled text-primer-disabled-foreground border-[var(--primer-secondary-border)] cursor-not-allowed opacity-50 hover:bg-primer-disabled active:bg-primer-disabled",
        false: "",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
      alignContent: "center",
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
  trailingVisual?: ReactNode;
}

export function Button({
  label,
  leadingVisual,
  trailingVisual,
  variant,
  size,
  alignContent,
  block,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, alignContent, block, disabled, className })}
      disabled={disabled || undefined}
      {...props}
    >
      {leadingVisual && (
        <span className="shrink-0 size-4 flex items-center justify-center overflow-clip">
          {leadingVisual}
        </span>
      )}
      <span className="whitespace-nowrap">{label}</span>
      {trailingVisual && (
        <span className="shrink-0 size-4 flex items-center justify-center overflow-clip">
          {trailingVisual}
        </span>
      )}
    </button>
  );
}

export { buttonVariants };

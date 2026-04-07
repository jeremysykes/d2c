import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";
import "./tokens/semantic.css";

/**
 * Carbon Button — CVA variants using semantic token utilities.
 *
 * Figma source: component set 1854:1776
 *
 * Colors, spacing, and typography reference semantic tokens defined in
 * tokens/semantic.css, registered with Tailwind via @theme in preview.css.
 * The structural validation gate reads semantic.css to discover checks.
 */

const buttonVariants = cva(
  [
    "cds-btn inline-flex items-center overflow-clip cursor-pointer border-0",
    "font-[family-name:var(--cds-typography-font-family)]",
    "text-[length:var(--cds-typography-font-size)]",
    "leading-[var(--cds-typography-line-height)]",
    "tracking-[var(--cds-typography-letter-spacing)]",
    "font-[number:var(--cds-typography-font-weight)]",
  ].join(" "),
  {
    variants: {
      kind: {
        primary:
          "bg-cds-primary text-cds-primary-foreground hover:bg-cds-primary-hover active:bg-cds-primary-active",
        secondary:
          "bg-cds-secondary text-cds-secondary-foreground hover:bg-cds-secondary-hover active:bg-cds-secondary-active",
        tertiary:
          "bg-cds-tertiary text-cds-tertiary-foreground shadow-[inset_0_0_0_1px_var(--cds-tertiary-border)] hover:bg-cds-tertiary-hover hover:text-cds-primary-foreground hover:shadow-none active:bg-cds-tertiary-active active:text-cds-primary-foreground active:shadow-none",
        ghost:
          "bg-cds-ghost text-cds-ghost-foreground hover:bg-cds-ghost-hover active:bg-cds-ghost-active",
        "danger-primary":
          "bg-cds-danger text-cds-danger-foreground hover:bg-cds-danger-hover active:bg-cds-danger-active",
        "danger-tertiary":
          "bg-transparent text-cds-danger shadow-[inset_0_0_0_1px_var(--cds-danger)] hover:bg-cds-danger hover:text-cds-primary-foreground hover:shadow-none active:bg-cds-danger-active active:text-cds-primary-foreground active:shadow-none",
        "danger-ghost":
          "bg-transparent text-cds-danger hover:bg-cds-ghost-hover active:bg-cds-ghost-active",
      },
      size: {
        xs: "h-6 items-center",
        sm: "h-[var(--cds-spacing-height-sm)] items-center",
        md: "h-[var(--cds-spacing-height-md)] items-center",
        lg: "h-[var(--cds-spacing-height-lg)] items-center",
        xl: "h-[var(--cds-spacing-height-xl)] items-start pt-4",
        "2xl": "h-[var(--cds-spacing-height-2xl)] items-start pt-4",
        expressive: "h-[var(--cds-spacing-height-lg)] items-center text-base leading-[22px] tracking-normal",
      },
      type: {
        default: "pl-[var(--cds-spacing-padding-horizontal)] pr-[var(--cds-spacing-padding-horizontal)] justify-between",
        "icon-only": "justify-center items-center",
      },
      disabled: {
        true: "bg-cds-disabled text-cds-disabled-foreground cursor-not-allowed shadow-none hover:bg-cds-disabled active:bg-cds-disabled",
        false: "",
      },
    },
    compoundVariants: [
      { type: "icon-only", size: "xs", className: "size-6" },
      { type: "icon-only", size: "sm", className: "size-8" },
      { type: "icon-only", size: "md", className: "size-10" },
      { type: "icon-only", size: "lg", className: "size-12" },
      { type: "icon-only", size: "xl", className: "size-16" },
      { type: "icon-only", size: "2xl", className: "size-20" },
      { type: "icon-only", size: "expressive", className: "size-12" },
    ],
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
  const isIconOnly = type === "icon-only";

  return (
    <button
      className={buttonVariants({ kind, size, type, disabled, className })}
      disabled={disabled || undefined}
      {...props}
    >
      {!isIconOnly && (
        <span className="whitespace-nowrap">{label}</span>
      )}
      {icon && (
        <span className="size-[var(--cds-spacing-icon-size)] shrink-0 flex items-center justify-center">
          {icon}
        </span>
      )}
    </button>
  );
}

export { buttonVariants };

import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";

/**
 * Carbon Button — styles sourced from Figma MCP extraction (node 9245:400267).
 *
 * Figma source values:
 * - bg: var(--button/button-primary, #0f62fe)
 * - text: var(--text/text-on-color, white), 14px IBM Plex Sans Regular
 * - line-height: 18px, letter-spacing: 0.16px
 * - padding: 16px left, 64px right (trailing icon area), 16px top, 30px bottom
 * - icon: 16x16, absolutely positioned right-16px top-16px
 * - no border-radius (Carbon signature)
 */

const buttonVariants = cva(
  [
    "cds-btn",
    "relative",
    "inline-flex",
    "items-start",
    "overflow-clip",
    "cursor-pointer",
    "border-0",
    "transition-colors",
    "duration-100",
    "font-normal",
    "text-sm",
    "leading-[18px]",
    "tracking-[0.16px]",
  ],
  {
    variants: {
      kind: {
        primary: "bg-[#0f62fe] text-white hover:bg-[#0353e9] active:bg-[#002d9c]",
        secondary: "bg-[#393939] text-white hover:bg-[#4c4c4c] active:bg-[#6f6f6f]",
        tertiary: [
          "bg-transparent text-[#0f62fe]",
          "border border-solid border-[#0f62fe]",
          "hover:bg-[#0353e9] hover:text-white hover:border-transparent",
          "active:bg-[#002d9c] active:text-white active:border-transparent",
        ].join(" "),
        ghost: "bg-transparent text-[#0f62fe] hover:bg-[#e8e8e8] active:bg-[#c6c6c6]",
        "danger-primary": "bg-[#da1e28] text-white hover:bg-[#b81921] active:bg-[#750e13]",
        "danger-tertiary": [
          "bg-transparent text-[#da1e28]",
          "border border-solid border-[#da1e28]",
          "hover:bg-[#da1e28] hover:text-white hover:border-transparent",
          "active:bg-[#750e13] active:text-white active:border-transparent",
        ].join(" "),
        "danger-ghost": "bg-transparent text-[#da1e28] hover:bg-[#e8e8e8] active:bg-[#c6c6c6]",
      },
      size: {
        sm: "min-h-8 pt-[7px] pb-[7px]",
        md: "min-h-10 pt-[11px] pb-[11px]",
        lg: "min-h-12 pt-[14px] pb-[30px]",
        xl: "min-h-16 pt-[16px] pb-[30px]",
        "2xl": "min-h-20 pt-[16px] pb-[46px]",
      },
      type: {
        default: "pl-4 pr-16",
        "icon-only": "p-0 items-center justify-center",
      },
      disabled: {
        true: "bg-[#c6c6c6] text-[#8d8d8d] border-transparent cursor-not-allowed hover:bg-[#c6c6c6] active:bg-[#c6c6c6]",
        false: "",
      },
    },
    compoundVariants: [
      { type: "icon-only", size: "sm", className: "size-8" },
      { type: "icon-only", size: "md", className: "size-10" },
      { type: "icon-only", size: "lg", className: "size-12" },
      { type: "icon-only", size: "xl", className: "size-16" },
      { type: "icon-only", size: "2xl", className: "size-20" },
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
      style={{ fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif" }}
      {...props}
    >
      {!isIconOnly && (
        <span className="cds-btn__label relative z-[2] whitespace-nowrap">{label}</span>
      )}
      {icon && (
        <span
          className={
            isIconOnly
              ? "cds-btn__icon size-4 flex items-center justify-center"
              : "cds-btn__icon absolute right-4 top-4 z-[1] size-4 flex items-center justify-center"
          }
        >
          {icon}
        </span>
      )}
    </button>
  );
}

export { buttonVariants };

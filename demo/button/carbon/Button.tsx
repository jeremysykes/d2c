import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";

/**
 * Carbon Button — CVA variants sourced from Figma MCP extraction.
 *
 * Figma source: component set 1854:1776
 * Extracted nodes: 1858:1775 (Medium/Primary), 9245:400267 (XL/Primary)
 *
 * Figma variant axes → CVA variant keys:
 * - Style → kind: primary, secondary, tertiary, ghost, danger-primary, danger-tertiary, danger-ghost
 * - Type → type: default (Text + Icon), icon-only (Icon only)
 * - Size → size: sm, md, lg, xl, 2xl
 * - State=Disabled → disabled: true/false
 *
 * Figma-extracted style values:
 * - Primary bg: var(--button/button-primary, #0f62fe)
 * - Text: var(--text/text-on-color, white)
 * - Font: IBM Plex Sans Regular, 14px/18px, 0.16px tracking
 * - Padding: pl-16px pr-64px (icon area), vertical varies by size
 * - Icon: 16x16, absolute right-16px, centered (md) or top-16px (xl/2xl)
 * - No border-radius (Carbon signature)
 */

const buttonVariants = cva(
  "cds-btn relative inline-flex overflow-clip cursor-pointer border-0 text-sm leading-[18px] tracking-[0.16px] font-normal",
  {
    variants: {
      // From Figma "Style" axis — bg/text colors from token references
      kind: {
        // bg: var(--button/button-primary, #0f62fe), text: var(--text/text-on-color, white)
        primary: "bg-[#0f62fe] text-white hover:bg-[#0353e9] active:bg-[#002d9c]",
        // bg: var(--button/button-secondary, #393939)
        secondary: "bg-[#393939] text-white hover:bg-[#4c4c4c] active:bg-[#6f6f6f]",
        // bg: transparent, border: var(--button/button-primary, #0f62fe)
        tertiary:
          "bg-transparent text-[#0f62fe] shadow-[inset_0_0_0_1px_#0f62fe] hover:bg-[#0353e9] hover:text-white hover:shadow-none active:bg-[#002d9c] active:text-white active:shadow-none",
        // bg: transparent, text: var(--link/link-primary, #0f62fe)
        ghost: "bg-transparent text-[#0f62fe] hover:bg-[#e8e8e8] active:bg-[#c6c6c6]",
        // bg: var(--button/button-danger-primary, #da1e28)
        "danger-primary": "bg-[#da1e28] text-white hover:bg-[#b81921] active:bg-[#750e13]",
        "danger-tertiary":
          "bg-transparent text-[#da1e28] shadow-[inset_0_0_0_1px_#da1e28] hover:bg-[#da1e28] hover:text-white hover:shadow-none active:bg-[#750e13] active:text-white active:shadow-none",
        "danger-ghost": "bg-transparent text-[#da1e28] hover:bg-[#e8e8e8] active:bg-[#c6c6c6]",
      },
      // From Figma "Size" axis — padding values from extracted nodes
      // Medium node: py-[11px] pl-[16px] pr-[64px] → h-10
      // XL node: pt-[16px] pb-[30px] pl-[16px] pr-[64px] → h-16
      size: {
        sm: "h-8 items-center",
        md: "h-10 items-center",
        lg: "h-12 items-center",
        xl: "h-16 items-start pt-4",
        "2xl": "h-20 items-start pt-4",
      },
      // From Figma "Type" axis
      type: {
        // Text + Icon: pl-16 pr-64 (right padding reserves icon area)
        default: "pl-4 pr-16 flex-col",
        // Icon only: square button, centered icon
        "icon-only": "justify-center items-center",
      },
      disabled: {
        // bg: var(--button/button-disabled, #c6c6c6), text: var(--text/text-on-color-disabled, #8d8d8d)
        true: "bg-[#c6c6c6] text-[#8d8d8d] cursor-not-allowed shadow-none hover:bg-[#c6c6c6] active:bg-[#c6c6c6]",
        false: "",
      },
    },
    compoundVariants: [
      // Icon-only buttons are square — size sets both width and height
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
      style={{ fontFamily: "var(--fixed\\/body\\/font-family, 'IBM Plex Sans', sans-serif)" }}
      {...props}
    >
      {!isIconOnly && (
        <span className="whitespace-nowrap relative z-[2]">{label}</span>
      )}
      {/* From Figma: icon 16x16, absolute right-16px, centered or top-aligned */}
      {icon && (
        <span
          className={
            isIconOnly
              ? "size-4 flex items-center justify-center"
              : "absolute right-4 top-1/2 -translate-y-1/2 z-[1] size-4 flex items-center justify-center"
          }
        >
          {icon}
        </span>
      )}
    </button>
  );
}

export { buttonVariants };

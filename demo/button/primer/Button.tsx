import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";

/**
 * Primer Button — styles sourced from Figma MCP extraction (node 30258:5709).
 *
 * Figma source values:
 * - primary bg: var(--button/primary/bgcolor/rest, #1f883d)
 * - primary border: var(--button/primary/bordercolor/rest, rgba(31,35,40,0.15))
 * - border-radius: var(--borderRadius-medium, 6px)
 * - gap: var(--control/medium/gap, 8px)
 * - padding: 6px vertical, 12px horizontal (var(--control/medium/paddingInline/normal))
 * - font: SF Pro Text / system sans-serif, Semibold, 14px/20px
 * - shadow: 0 1px 0 0 rgba(31,35,40,0.04)
 * - text: var(--button/primary/fgcolor/rest, white)
 * - icon: 16x16
 */

const buttonVariants = cva(
  [
    "primer-btn",
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "rounded-md",
    "border",
    "border-solid",
    "text-sm",
    "leading-5",
    "font-semibold",
    "cursor-pointer",
    "select-none",
    "transition-colors",
    "duration-100",
    "px-3",
    "py-1.5",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[#f6f8fa]",
          "text-[#25292e]",
          "border-[rgba(31,35,40,0.15)]",
          "shadow-[0_1px_0_0_rgba(31,35,40,0.04)]",
          "hover:bg-[#f3f4f6]",
          "active:bg-[#ebecef]",
        ].join(" "),
        primary: [
          "bg-[#1f883d]",
          "text-white",
          "border-[rgba(31,35,40,0.15)]",
          "shadow-[0_1px_0_0_rgba(31,35,40,0.04)]",
          "hover:bg-[#1a7f37]",
          "active:bg-[#197935]",
        ].join(" "),
        danger: [
          "bg-[#f6f8fa]",
          "text-[#cf222e]",
          "border-[rgba(31,35,40,0.15)]",
          "shadow-[0_1px_0_0_rgba(31,35,40,0.04)]",
          "hover:bg-[#a40e26]",
          "hover:text-white",
          "hover:border-[rgba(31,35,40,0.15)]",
          "active:bg-[#82071e]",
          "active:text-white",
        ].join(" "),
        outline: [
          "bg-[#f6f8fa]",
          "text-[#0969da]",
          "border-[rgba(31,35,40,0.15)]",
          "shadow-[0_1px_0_0_rgba(31,35,40,0.04)]",
          "hover:bg-[#0969da]",
          "hover:text-white",
          "hover:border-[rgba(31,35,40,0.15)]",
          "active:bg-[#0757ba]",
          "active:text-white",
        ].join(" "),
        invisible: [
          "bg-transparent",
          "text-[#0969da]",
          "border-transparent",
          "shadow-none",
          "hover:bg-[rgba(208,215,222,0.32)]",
          "active:bg-[rgba(208,215,222,0.48)]",
        ].join(" "),
      },
      size: {
        sm: "h-7 px-2 py-[3px] text-xs",
        md: "h-8 px-3 py-1.5",
        lg: "h-10 px-4 py-[10px]",
      },
      block: {
        true: "w-full",
        false: "",
      },
      disabled: {
        true: "bg-[#f6f8fa] text-[#8c959f] border-[rgba(31,35,40,0.15)] cursor-not-allowed opacity-50 hover:bg-[#f6f8fa] active:bg-[#f6f8fa]",
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
  trailingVisual?: ReactNode;
}

export function Button({
  label,
  leadingVisual,
  trailingVisual,
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
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
      }}
      {...props}
    >
      {leadingVisual && (
        <span className="primer-btn__leading-visual shrink-0 size-4 flex items-center justify-center overflow-clip">
          {leadingVisual}
        </span>
      )}
      <span className="primer-btn__label whitespace-nowrap">{label}</span>
      {trailingVisual && (
        <span className="primer-btn__trailing-visual shrink-0 size-4 flex items-center justify-center overflow-clip">
          {trailingVisual}
        </span>
      )}
    </button>
  );
}

export { buttonVariants };

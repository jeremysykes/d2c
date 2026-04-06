import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";

/**
 * Primer Button — CVA variants sourced from Figma MCP extraction.
 *
 * Figma source: component set 30258:5582, extracted node 30258:5709
 *
 * Figma variant axes → CVA:
 * - variant: secondary, primary, danger, invisible
 * - size: small (28px), medium (32px), large (40px)
 * - alignContent: center, start
 *
 * Figma CSS:
 * - bg: var(--button/primary/bgcolor/rest, #1f883d)
 * - border-radius: var(--borderRadius-medium, 6px)
 * - gap: var(--control/medium/gap, 8px)
 * - shadow: 0 1px 0 0 rgba(31,35,40,0.04)
 * - font: Semibold 14px/20px
 */

const buttonVariants = cva(
  "primer-btn relative inline-flex items-center gap-2 rounded-md border border-solid text-sm leading-5 font-semibold cursor-pointer select-none transition-colors duration-100",
  {
    variants: {
      variant: {
        secondary:
          "bg-[#f6f8fa] text-[#25292e] border-[rgba(31,35,40,0.15)] shadow-[0_1px_0_0_rgba(31,35,40,0.04)] hover:bg-[#f3f4f6] active:bg-[#ebecef]",
        primary:
          "bg-[#1f883d] text-white border-[rgba(31,35,40,0.15)] shadow-[0_1px_0_0_rgba(31,35,40,0.04)] hover:bg-[#1a7f37] active:bg-[#197935]",
        danger:
          "bg-[#f6f8fa] text-[#cf222e] border-[rgba(31,35,40,0.15)] shadow-[0_1px_0_0_rgba(31,35,40,0.04)] hover:bg-[#a40e26] hover:text-white active:bg-[#82071e] active:text-white",
        invisible:
          "bg-transparent text-[#0969da] border-transparent shadow-none hover:bg-[rgba(208,215,222,0.32)] active:bg-[rgba(208,215,222,0.48)]",
      },
      size: {
        sm: "h-7 px-2 py-[3px] text-xs",
        md: "h-8 px-3 py-1.5",
        lg: "h-10 px-4 py-[10px]",
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
        true: "bg-[#f6f8fa] text-[#8c959f] border-[rgba(31,35,40,0.15)] cursor-not-allowed opacity-50 hover:bg-[#f6f8fa] active:bg-[#f6f8fa]",
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
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif" }}
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

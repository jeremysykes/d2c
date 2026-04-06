import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";

/**
 * Polaris Button — CVA variants sourced from Figma MCP extraction.
 *
 * Figma source: component set 37:12833
 *
 * Figma variant axes → CVA:
 * - Variant: auto, primary, tertiary
 * - Tone: neutral, critical
 * - Disabled: true/false
 * - Icon only: true/false
 *
 * Figma CSS (from extraction):
 * - border-radius: var(--p-border-radius-200, 8px) → rounded-lg
 * - gap: var(--p-sapce-050, 2px) → gap-0.5
 * - padding: 12px horiz (--p-sapce-300), 6px vert (--p-sapce-150)
 * - font: Inter Variable Medium (550) / SemiBold (600 primary), 12px/16px
 * - Primary bg: gradient overlay + #303030 or #c70a24
 * - Auto bg: white + inset box-shadow border
 * - Disabled bg: var(--s-button/s-button-disabled, rgba(0,0,0,0.05))
 */

const buttonVariants = cva(
  "polaris-btn relative inline-flex items-center justify-center gap-0.5 rounded-lg text-xs leading-4 cursor-pointer select-none overflow-clip border-0 px-3 py-1.5 transition-all duration-100",
  {
    variants: {
      variant: {
        // From Figma: white bg, inset shadow border treatment
        auto: "bg-white text-[#303030] font-[550] shadow-[inset_0px_-1px_0px_0px_#b5b5b5,inset_0px_0px_0px_1px_rgba(0,0,0,0.1),inset_0px_0.5px_0px_1.5px_white]",
        // From Figma: gradient overlay for depth
        primary: "text-white font-semibold shadow-[inset_0px_-1px_0px_1px_rgba(0,0,0,0.8),inset_0px_0px_0px_1px_#303030,inset_0px_0.5px_0px_1.5px_rgba(255,255,255,0.25)]",
        // From Figma: transparent bg, no shadow
        tertiary: "bg-transparent text-[#303030] font-[550] shadow-none hover:bg-[#f1f1f1] active:bg-[#e3e3e3]",
      },
      tone: {
        neutral: "",
        critical: "",
      },
      iconOnly: {
        true: "gap-0 p-1.5",
        false: "",
      },
      disabled: {
        // From Figma: var(--s-button/s-button-disabled, rgba(0,0,0,0.05))
        true: "text-[#b5b5b5] shadow-none cursor-not-allowed",
        false: "",
      },
    },
    compoundVariants: [
      // Primary + neutral: dark gradient (from Figma)
      {
        variant: "primary",
        tone: "neutral",
        disabled: false,
        className: "bg-[#303030]",
      },
      // Primary + critical: red gradient + unique shadow (from Figma)
      {
        variant: "primary",
        tone: "critical",
        disabled: false,
        className: "bg-[#c70a24] shadow-[inset_0px_-1px_0px_1px_rgba(142,11,33,0.8),inset_0px_0px_0px_1px_rgba(163,10,36,0.8),inset_0px_0.5px_0px_1.5px_rgba(247,128,134,0.64)]",
      },
      // Auto + critical: critical text color (from Figma)
      {
        variant: "auto",
        tone: "critical",
        disabled: false,
        className: "text-[#8e0b21]",
      },
      // Tertiary + critical
      {
        variant: "tertiary",
        tone: "critical",
        disabled: false,
        className: "text-[#8e0b21]",
      },
      // Disabled overrides per variant
      {
        variant: "auto",
        disabled: true,
        className: "bg-[rgba(0,0,0,0.05)]",
      },
      {
        variant: "primary",
        disabled: true,
        className: "bg-[rgba(0,0,0,0.05)]",
      },
      {
        variant: "tertiary",
        disabled: true,
        className: "bg-[rgba(0,0,0,0.05)]",
      },
    ],
    defaultVariants: {
      variant: "auto",
      tone: "neutral",
      iconOnly: false,
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
  variant = "auto",
  tone,
  iconOnly,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  // Primary variant uses gradient overlay from Figma extraction
  const isPrimary = variant === "primary" && !disabled;
  const gradientStyle: React.CSSProperties | undefined = isPrimary
    ? {
        backgroundImage:
          "linear-gradient(180deg, rgba(48,48,48,0) 63.5%, rgba(255,255,255,0.15) 100%)",
      }
    : undefined;

  return (
    <button
      className={buttonVariants({ variant, tone, iconOnly, disabled, className })}
      disabled={disabled || undefined}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontFeatureSettings: "'cv10' 1",
        ...gradientStyle,
      }}
      {...props}
    >
      {iconOnly
        ? icon && <span className="size-5 flex items-center justify-center">{icon}</span>
        : (
          <>
            {icon && <span className="shrink-0 size-4 flex items-center justify-center">{icon}</span>}
            <span className="whitespace-nowrap">{label}</span>
          </>
        )
      }
    </button>
  );
}

export { buttonVariants };

import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";

/**
 * Polaris Button — high-fidelity reproduction from Figma extraction.
 *
 * Key Polaris details from live Figma data:
 * - 8px border-radius (--p-border-radius-200)
 * - Gradient overlay on primary for depth
 * - Inset box-shadows for border treatment (not CSS border)
 * - Inter Variable font, weight 550 (Medium) / 600 (SemiBold for primary)
 * - 12px font size, 16px line height
 * - 12px horizontal padding (--p-sapce-300), 6px vertical (--p-sapce-150)
 */

const buttonVariants = cva(
  [
    "polaris-btn",
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-0.5",
    "rounded-lg",
    "text-xs",
    "leading-4",
    "cursor-pointer",
    "select-none",
    "overflow-hidden",
    "border-0",
    "px-3",
    "py-1.5",
    "transition-all",
    "duration-100",
  ],
  {
    variants: {
      variant: {
        primary: [
          "text-white",
          "font-semibold",
          "shadow-[inset_0px_-1px_0px_1px_rgba(0,0,0,0.8),inset_0px_0px_0px_1px_#303030,inset_0px_0.5px_0px_1.5px_rgba(255,255,255,0.25)]",
        ].join(" "),
        secondary: [
          "text-[#303030]",
          "font-medium",
          "bg-white",
          "shadow-[inset_0px_-1px_0px_0px_#b5b5b5,inset_0px_0px_0px_1px_rgba(0,0,0,0.1),inset_0px_0.5px_0px_1.5px_white]",
          "hover:bg-[#f7f7f7]",
          "active:bg-[#f0f0f0]",
        ].join(" "),
        tertiary: [
          "text-[#303030]",
          "font-medium",
          "bg-transparent",
          "hover:bg-[#f1f1f1]",
          "active:bg-[#e3e3e3]",
        ].join(" "),
        plain: [
          "text-[#005bd3]",
          "font-medium",
          "bg-transparent",
          "px-0",
          "py-0",
          "hover:underline",
        ].join(" "),
        monochromePlain: [
          "text-[#303030]",
          "font-medium",
          "bg-transparent",
          "px-0",
          "py-0",
          "hover:underline",
        ].join(" "),
      },
      tone: {
        default: "",
        success: "",
        critical: "",
      },
      size: {
        micro: "h-5 px-1.5 py-0 text-[11px]",
        slim: "h-7 px-2 py-1",
        medium: "h-8 px-3 py-1.5",
        large: "h-10 px-4 py-2",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      disabled: {
        true: "bg-[rgba(0,0,0,0.05)] text-[#b5b5b5] shadow-none cursor-not-allowed hover:bg-[rgba(0,0,0,0.05)]",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        tone: "critical",
        disabled: false,
        className:
          "shadow-[inset_0px_-1px_0px_1px_rgba(142,11,33,0.8),inset_0px_0px_0px_1px_rgba(163,10,36,0.8),inset_0px_0.5px_0px_1.5px_rgba(247,128,134,0.64)]",
      },
      {
        variant: "secondary",
        tone: "critical",
        disabled: false,
        className: "text-[#8e0b21]",
      },
      {
        variant: "secondary",
        tone: "success",
        disabled: false,
        className: "text-[#29845a]",
      },
      {
        variant: "tertiary",
        tone: "critical",
        disabled: false,
        className: "text-[#8e0b21]",
      },
      {
        variant: "plain",
        tone: "critical",
        disabled: false,
        className: "text-[#8e0b21]",
      },
      {
        variant: "plain",
        tone: "success",
        disabled: false,
        className: "text-[#29845a]",
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

function getPrimaryBackground(
  tone: "default" | "success" | "critical" | null | undefined,
  disabled: boolean | null | undefined
): React.CSSProperties | undefined {
  if (disabled) {
    return {
      backgroundImage:
        "linear-gradient(180deg, rgba(48,48,48,0) 63.5%, rgba(255,255,255,0.15) 100%), linear-gradient(90deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.05) 100%)",
    };
  }
  if (tone === "critical") {
    return {
      backgroundImage:
        "linear-gradient(180deg, rgba(48,48,48,0) 63.5%, rgba(255,255,255,0.15) 100%), linear-gradient(90deg, #c70a24 0%, #c70a24 100%)",
    };
  }
  if (tone === "success") {
    return {
      backgroundImage:
        "linear-gradient(180deg, rgba(48,48,48,0) 63.5%, rgba(255,255,255,0.15) 100%), linear-gradient(90deg, #29845a 0%, #29845a 100%)",
    };
  }
  return {
    backgroundImage:
      "linear-gradient(180deg, rgba(48,48,48,0) 63.5%, rgba(255,255,255,0.15) 100%), linear-gradient(90deg, #303030 0%, #303030 100%)",
  };
}

export function Button({
  label,
  icon,
  variant = "secondary",
  tone = "default",
  size,
  fullWidth,
  disabled = false,
  className,
  style,
  ...props
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const primaryStyle = isPrimary ? getPrimaryBackground(tone, disabled) : undefined;

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
      style={{ ...primaryStyle, fontFeatureSettings: "'cv10' 1", ...style }}
      {...props}
    >
      {icon && <span className="polaris-btn__icon shrink-0 size-4">{icon}</span>}
      <span className="polaris-btn__label">{label}</span>
    </button>
  );
}

export { buttonVariants };

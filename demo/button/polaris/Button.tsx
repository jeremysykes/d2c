import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  [
    "polaris-btn",
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-1",
    "text-[13px]",
    "leading-5",
    "font-[550]",
    "rounded-lg",
    "border",
    "border-transparent",
    "cursor-pointer",
    "transition-colors",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-[#303030] text-white hover:bg-[#1a1a1a] active:bg-[#1a1a1a]",
        secondary:
          "bg-[#e3e3e3] text-[#303030] hover:bg-[#dbdbdb] active:bg-[#c9cccf]",
        tertiary:
          "bg-transparent text-[#303030] hover:bg-[#f1f1f1] active:bg-[#e3e3e3]",
        plain:
          "bg-transparent text-[#005bd3] border-transparent hover:underline",
        monochromePlain:
          "bg-transparent text-[#303030] border-transparent hover:underline",
      },
      tone: {
        default: "",
        success: "",
        critical: "",
      },
      size: {
        micro: "h-5 px-2 py-0 text-xs",
        slim: "h-7 px-3 py-0",
        medium: "h-8 px-3 py-0",
        large: "h-10 px-4 py-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      disabled: {
        true: "bg-[#f1f1f1] text-[#b5b5b5] border-transparent cursor-not-allowed hover:bg-[#f1f1f1] active:bg-[#f1f1f1]",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        tone: "critical",
        className:
          "bg-[#e51c00] text-white hover:bg-[#c41400] active:bg-[#a11200]",
      },
      {
        variant: "primary",
        tone: "success",
        className:
          "bg-[#29845a] text-white hover:bg-[#1d6b47] active:bg-[#155239]",
      },
      {
        variant: "secondary",
        tone: "critical",
        className: "text-[#e51c00]",
      },
      {
        variant: "secondary",
        tone: "success",
        className: "text-[#29845a]",
      },
      {
        variant: "plain",
        tone: "critical",
        className: "text-[#e51c00]",
      },
      {
        variant: "plain",
        tone: "success",
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

export function Button({
  label,
  icon,
  variant,
  tone,
  size,
  fullWidth,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
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
      {...props}
    >
      {icon && <span className="polaris-btn__icon w-4 h-4">{icon}</span>}
      <span className="polaris-btn__label">{label}</span>
    </button>
  );
}

export { buttonVariants };

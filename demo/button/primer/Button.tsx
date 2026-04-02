import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  [
    "primer-btn",
    "inline-flex",
    "items-center",
    "gap-2",
    "font-medium",
    "text-sm",
    "leading-5",
    "rounded-md",
    "border",
    "cursor-pointer",
    "transition-colors",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-[#f6f8fa] text-[#25292e] border-[#d1d9e0] hover:bg-[#eff2f5] active:bg-[#e6eaef]",
        primary:
          "bg-[#1f883d] text-white border-transparent hover:bg-[#1c8139] active:bg-[#197935]",
        danger:
          "bg-[#f6f8fa] text-[#d1242f] border-[#d1d9e0] hover:bg-[#cf222e] hover:text-white hover:border-transparent active:bg-[#a40e26] active:text-white",
        outline:
          "bg-[#f6f8fa] text-[#0969da] border-[#d1d9e0] hover:bg-[#0969da] hover:text-white hover:border-transparent active:bg-[#0757ba] active:text-white",
        invisible:
          "bg-transparent text-[#25292e] border-transparent hover:bg-[#e8ecf0] active:bg-[#d1d9e0]",
      },
      size: {
        sm: "h-7 px-3 py-0 text-xs",
        md: "h-8 px-4 py-0",
        lg: "h-10 px-4 py-0",
      },
      block: {
        true: "w-full justify-center",
        false: "",
      },
      disabled: {
        true: "bg-[#f6f8fa] text-[#818b98] border-[#d1d9e0] cursor-not-allowed hover:bg-[#f6f8fa] active:bg-[#f6f8fa]",
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

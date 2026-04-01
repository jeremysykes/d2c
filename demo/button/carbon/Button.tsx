import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  [
    "cds-btn",
    "inline-flex",
    "items-center",
    "font-sans",
    "text-sm",
    "leading-[18px]",
    "tracking-[0.16px]",
    "cursor-pointer",
    "border",
    "border-transparent",
    "transition-colors",
  ],
  {
    variants: {
      kind: {
        primary: "bg-[#0f62fe] text-white hover:bg-[#0043ce] active:bg-[#002d9c]",
        secondary: "bg-[#393939] text-white hover:bg-[#474747] active:bg-[#6f6f6f]",
        tertiary:
          "bg-transparent text-[#0f62fe] border-[#0f62fe] hover:bg-[#0353e9] hover:text-white active:bg-[#002d9c] active:text-white",
        ghost:
          "bg-transparent text-[#0f62fe] hover:bg-[#e8e8e8] active:bg-[#c6c6c6]",
        "danger-primary": "bg-[#da1e28] text-white hover:bg-[#ba1b23] active:bg-[#750e13]",
        "danger-tertiary":
          "bg-transparent text-[#da1e28] border-[#da1e28] hover:bg-[#da1e28] hover:text-white active:bg-[#750e13] active:text-white",
        "danger-ghost":
          "bg-transparent text-[#da1e28] hover:bg-[#e8e8e8] active:bg-[#c6c6c6]",
      },
      size: {
        sm: "h-8 px-4 py-0",
        md: "h-10 px-4 py-0",
        lg: "h-12 px-4 py-0",
        xl: "h-16 px-4 py-0",
        "2xl": "h-20 px-4 py-0",
      },
      type: {
        default: "",
        "icon-only": "justify-center px-4",
      },
      disabled: {
        true: "bg-[#c6c6c6] text-[#8d8d8d] border-transparent cursor-not-allowed hover:bg-[#c6c6c6] active:bg-[#c6c6c6]",
        false: "",
      },
    },
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
  return (
    <button
      className={buttonVariants({ kind, size, type, disabled, className })}
      disabled={disabled || undefined}
      {...props}
    >
      {type !== "icon-only" && <span className="cds-btn__label">{label}</span>}
      {icon && <span className="cds-btn__icon ml-2 w-4 h-4">{icon}</span>}
    </button>
  );
}

export { buttonVariants };

import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import "./tokens/generated/variables.css";
import "./tokens/semantic.css";

/**
 * Polaris Button — CVA variants using semantic token utilities.
 *
 * Figma source: component set 37:12833
 */

const buttonVariants = cva(
  [
    "polaris-btn inline-flex items-center justify-center overflow-clip border-0 cursor-pointer select-none transition-all duration-100",
    "font-[family-name:var(--polaris-typography-font-family)]",
    "text-[length:var(--polaris-typography-font-size)]",
    "leading-[var(--polaris-typography-line-height)]",
    "font-[number:var(--polaris-typography-font-weight)]",
    "rounded-[var(--polaris-spacing-border-radius)]",
    "gap-[var(--polaris-spacing-gap)]",
    "px-[var(--polaris-spacing-padding-horizontal)]",
    "py-1.5",
  ].join(" "),
  {
    variants: {
      variant: {
        auto: "bg-polaris-secondary text-polaris-secondary-foreground shadow-[inset_0px_-1px_0px_0px_var(--polaris-color-border-secondary),inset_0px_0px_0px_1px_rgba(0,0,0,0.1),inset_0px_0.5px_0px_1.5px_white]",
        primary: "text-polaris-primary-foreground shadow-[inset_0px_-1px_0px_1px_rgba(0,0,0,0.8),inset_0px_0px_0px_1px_var(--polaris-primary),inset_0px_0.5px_0px_1.5px_rgba(255,255,255,0.25)]",
        tertiary: "bg-polaris-tertiary text-polaris-tertiary-foreground shadow-none hover:bg-polaris-tertiary-hover active:bg-polaris-tertiary-active",
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
        true: "text-polaris-disabled-foreground shadow-none cursor-not-allowed",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        tone: "neutral",
        disabled: false,
        className: "bg-polaris-primary",
      },
      {
        variant: "primary",
        tone: "critical",
        disabled: false,
        className: "bg-polaris-critical shadow-[inset_0px_-1px_0px_1px_rgba(142,11,33,0.8),inset_0px_0px_0px_1px_rgba(163,10,36,0.8),inset_0px_0.5px_0px_1.5px_rgba(247,128,134,0.64)]",
      },
      {
        variant: "auto",
        tone: "critical",
        disabled: false,
        className: "text-polaris-critical-foreground",
      },
      {
        variant: "tertiary",
        tone: "critical",
        disabled: false,
        className: "text-polaris-critical-foreground",
      },
      {
        variant: "auto",
        disabled: true,
        className: "bg-polaris-disabled",
      },
      {
        variant: "primary",
        disabled: true,
        className: "bg-polaris-disabled",
      },
      {
        variant: "tertiary",
        disabled: true,
        className: "bg-polaris-disabled",
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
      style={gradientStyle}
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

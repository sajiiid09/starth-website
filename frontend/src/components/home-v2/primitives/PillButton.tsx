import React from "react";
import { cn } from "@/lib/utils";

type PillButtonVariant = "primary" | "secondary" | "ghost";
type PillButtonSize = "sm" | "md";

type PillButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PillButtonVariant;
  size?: PillButtonSize;
};

const variantClasses: Record<PillButtonVariant, string> = {
  primary:
    "bg-brand-teal text-brand-light border border-brand-teal hover:bg-transparent hover:text-brand-teal",
  secondary:
    "bg-transparent text-brand-teal border border-brand-teal hover:bg-brand-teal hover:text-brand-light",
  ghost:
    "bg-transparent text-brand-dark/70 border border-transparent hover:text-brand-dark"
};

const sizeClasses: Record<PillButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base"
};

const PillButton: React.FC<PillButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center rounded-full font-medium transition duration-250 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};

export default PillButton;

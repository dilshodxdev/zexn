import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-brand text-bg hover:bg-brand-hover font-semibold",
    secondary: "bg-surface-alt text-text border border-line hover:bg-surface",
    ghost: "bg-transparent text-muted hover:text-text hover:bg-surface-alt",
    danger: "bg-danger text-text hover:opacity-90",
  };

  const sizeStyles = {
    sm: "h-8 px-3 text-xs rounded-md gap-1.5",
    md: "h-10 px-4 text-sm rounded-md gap-2",
    lg: "h-12 px-5 text-base rounded-lg gap-2.5",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? "true" : undefined}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors outline-none select-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={size === "lg" ? "md" : "sm"} />
      ) : icon ? (
        <span className="flex shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

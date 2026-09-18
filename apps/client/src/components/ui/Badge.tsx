import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends PropsWithChildren {
  tone?: "neutral" | "brand" | "ok" | "warn" | "danger" | "info";
  className?: string;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  const toneStyles = {
    neutral: "bg-surface-alt text-muted border border-line",
    brand: "bg-brand-soft text-brand border border-brand/30",
    ok: "bg-ok-soft text-ok border border-ok/30",
    warn: "bg-warn-soft text-warn border border-warn/30",
    danger: "bg-danger-soft text-danger border border-danger/30",
    info: "bg-info-soft text-info border border-info/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

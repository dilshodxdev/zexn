import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  padding?: "none" | "md";
  className?: string;
}

export function Card({ title, subtitle, actions, padding = "md", className, children }: CardProps) {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <section
      className={cn(
        "rounded-card border border-line bg-surface shadow-card transition-colors",
        padding === "md" ? "p-4 sm:p-5" : "p-0",
        className,
      )}
    >
      {hasHeader && (
        <div className={cn("flex items-start justify-between gap-3", children ? "mb-4" : "")}>
          <div>
            {title && <h2 className="text-base font-semibold text-text">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

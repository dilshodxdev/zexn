import type { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface-alt text-muted">
        {icon || <FolderOpen className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

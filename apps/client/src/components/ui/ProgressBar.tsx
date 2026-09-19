import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: "brand" | "ok" | "warn" | "danger";
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  tone = "brand",
  size = "sm",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const toneClasses = {
    brand: "bg-brand",
    ok: "bg-ok",
    warn: "bg-warn",
    danger: "bg-danger",
  };

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-surface-alt border border-line/40",
        heightClasses[size],
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-300", toneClasses[tone])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

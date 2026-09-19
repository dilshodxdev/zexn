import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  tone?: "brand" | "ok" | "warn" | "danger";
  className?: string;
  children?: ReactNode;
}

export function ProgressRing({
  value,
  max = 100,
  size = 56,
  strokeWidth = 5,
  tone = "brand",
  className,
  children,
}: ProgressRingProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const toneClasses = {
    brand: "text-brand",
    ok: "text-ok",
    warn: "text-warn",
    danger: "text-danger",
  };

  return (
    <div
      className={cn("relative inline-flex items-center justify-center shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full -rotate-90 transform"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-surface-alt"
        />
        {/* Active progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className={cn("transition-all duration-500", toneClasses[tone])}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children !== undefined ? (
          children
        ) : (
          <span className="font-mono text-xs font-bold text-text">{percentage}%</span>
        )}
      </div>
    </div>
  );
}

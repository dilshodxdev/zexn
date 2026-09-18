import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      aria-hidden="true"
      className={cn("animate-spin", size === "sm" ? "h-4 w-4" : "h-6 w-6", className)}
    />
  );
}

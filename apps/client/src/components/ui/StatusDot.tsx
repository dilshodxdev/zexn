import { cn } from "@/lib/utils";

export interface StatusDotProps {
  ok: boolean;
  className?: string;
}

/** Kichik holat indikatori: ok = yashil, down = qizil. */
export function StatusDot({ ok, className }: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full transition-colors",
        ok ? "bg-ok" : "bg-danger",
        className,
      )}
    />
  );
}

import { cn } from "@/lib/utils";

/** Kichik holat indikatori: ok = yashil, down = qizil. */
export function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-2.5 w-2.5 rounded-full", ok ? "bg-ok" : "bg-danger")}
    />
  );
}

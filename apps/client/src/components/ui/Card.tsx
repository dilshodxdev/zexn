import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends PropsWithChildren {
  title?: string;
  className?: string;
}

export function Card({ title, className, children }: CardProps) {
  return (
    <section className={cn("rounded-xl border border-gray-200 bg-white p-5 shadow-sm", className)}>
      {title && <h2 className="mb-3 text-base font-semibold text-gray-800">{title}</h2>}
      {children}
    </section>
  );
}

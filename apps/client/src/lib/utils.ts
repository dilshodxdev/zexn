/** Tailwind class'larni shartli birlashtirish: cn("a", cond && "b") */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** DB'da UTC, UI'da Asia/Tashkent. Har sana ko'rsatishda shu funksiya. */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

/** Berilgan sanagacha necha kun qolganini hisoblaydi (manfiy bo'lsa muddat o'tgan) */
export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = target - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

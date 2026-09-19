export const CODE_DRAFT_KEY = "zexn-code-draft";

export function loadCodeDraft(): string {
  try {
    return localStorage.getItem(CODE_DRAFT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveCodeDraft(value: string): void {
  try {
    localStorage.setItem(CODE_DRAFT_KEY, value);
  } catch {
    // Storage mavjud bo'lmasa draft faqat joriy sahifada qoladi.
  }
}

export function clearCodeDraft(): void {
  try {
    localStorage.removeItem(CODE_DRAFT_KEY);
  } catch {
    // Storage mavjud bo'lmasa tozalash uchun boshqa ish kerak emas.
  }
}

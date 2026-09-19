import { type ErrorPatternCode } from "@zexn/shared";

function hasDirectStateMutation(content: string): boolean {
  const assignment = /\b(\w+)\.\w+\s*=\s*[^=]/g;
  if (assignment.test(content)) return true;

  const mutation = /\b(\w+)\.(?:push|pop|splice|sort|reverse|shift|unshift)\s*\(/g;
  for (const match of content.matchAll(mutation)) {
    const variable = match[1];
    if (variable && new RegExp(`\\bset\\w*\\(\\s*${variable}\\s*\\)`).test(content)) return true;
  }
  return false;
}

function hasMissingKeyProp(content: string): boolean {
  let offset = 0;
  while (true) {
    const index = content.indexOf(".map(", offset);
    if (index === -1) return false;
    const section = content.slice(index + 5, index + 305);
    if (/<[A-Za-z]/.test(section) && !/\bkey\s*=/.test(section)) return true;
    offset = index + 5;
  }
}

function hasMissingEffectDeps(content: string): boolean {
  let offset = 0;
  while (true) {
    const start = content.indexOf("useEffect(", offset);
    if (start === -1) return false;
    const tail = content.slice(start);
    const endMatch = /\}\s*\)/.exec(tail);
    if (!endMatch) return false;
    const call = tail.slice(0, endMatch.index + endMatch[0].length);
    if (!/\}\s*,\s*\[[\s\S]*?\]\s*\)/.test(call)) return true;
    offset = start + endMatch.index + endMatch[0].length;
  }
}

export function detectPatterns(content: string): ErrorPatternCode[] {
  const found = new Set<ErrorPatternCode>();
  if (hasDirectStateMutation(content)) found.add("DIRECT_STATE_MUTATION");
  if (hasMissingKeyProp(content)) found.add("MISSING_KEY_PROP");
  if (/key=\{\s*(?:index|i|idx)\s*\}/.test(content)) found.add("INDEX_AS_KEY");
  if (hasMissingEffectDeps(content)) found.add("MISSING_EFFECT_DEPS");
  if (
    /\{\s*\w+(?:\.\w+)*\.length\s*&&\s*</.test(content) ||
    /\{\s*(?:count|total)\s*&&\s*</.test(content)
  ) {
    found.add("NUMBER_AND_RENDER");
  }
  return [...found];
}

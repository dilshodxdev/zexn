import { SDT_WEIGHTS } from "@zexn/shared";

interface EvidenceInput {
  oldMastery: number;
  attempts: number;
  evidence: number;
  targeted?: boolean;
}

export function applyEvidence(input: EvidenceInput): number {
  const historical = input.targeted ? SDT_WEIGHTS.targetedHistorical : SDT_WEIGHTS.historical;
  const evidenceWeight = input.targeted ? SDT_WEIGHTS.targetedEvidence : SDT_WEIGHTS.evidence;
  return Math.max(
    0,
    Math.min(100, Math.round(input.oldMastery * historical + input.evidence * evidenceWeight)),
  );
}

export function computeConfidence(attempts: number): number {
  return Math.min(1, attempts / SDT_WEIGHTS.confidenceAttempts);
}

export function buildSummary(strong: string[], weak: string[]): string {
  if (strong.length === 0 && weak.length === 0) return "Hali yetarli dalil yo'q.";
  const parts: string[] = [];
  if (strong.length > 0) parts.push(`${strong.slice(0, 3).join(", ")} yaxshi.`);
  if (weak.length > 0) parts.push(`${weak.slice(0, 3).join(", ")}'da bo'shliq bor.`);
  return parts.join(" ");
}

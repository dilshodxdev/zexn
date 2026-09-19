import { useTranslation } from "react-i18next";
import type { AssignmentDifficulty } from "@zexn/shared";
import { Badge } from "@/components/ui";

interface DifficultyBadgeProps {
  difficulty: AssignmentDifficulty;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const { t } = useTranslation("assignments");

  const config: Record<AssignmentDifficulty, { tone: "ok" | "warn" | "danger"; dotColor: string }> =
    {
      EASY: { tone: "ok", dotColor: "bg-ok" },
      MEDIUM: { tone: "warn", dotColor: "bg-warn" },
      HARD: { tone: "danger", dotColor: "bg-danger" },
    };

  const { tone, dotColor } = config[difficulty];

  return (
    <Badge tone={tone} className={className}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{t(`difficulty.${difficulty}`)}</span>
    </Badge>
  );
}

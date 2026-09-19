import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, Eye, Sparkles } from "lucide-react";
import type { SubmissionStatus } from "@zexn/shared";
import { Badge } from "@/components/ui";

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

export function SubmissionStatusBadge({ status, className }: SubmissionStatusBadgeProps) {
  const { t } = useTranslation("assignments");

  const config = {
    NEW: {
      tone: "neutral" as const,
      icon: <Sparkles className="h-3 w-3" />,
    },
    IN_PROGRESS: {
      tone: "brand" as const,
      icon: <Clock className="h-3 w-3" />,
    },
    SUBMITTED: {
      tone: "warn" as const,
      icon: <Eye className="h-3 w-3" />,
    },
    DONE: {
      tone: "ok" as const,
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
  };

  const { tone, icon } = config[status];

  return (
    <Badge tone={tone} className={className}>
      {icon}
      <span>{t(`status.${status}`)}</span>
    </Badge>
  );
}

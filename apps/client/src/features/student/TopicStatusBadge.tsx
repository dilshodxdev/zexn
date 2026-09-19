import { useTranslation } from "react-i18next";
import type { TopicStatus } from "@zexn/shared";
import { Badge } from "@/components/ui";

interface TopicStatusBadgeProps {
  status: TopicStatus;
}

export function TopicStatusBadge({ status }: TopicStatusBadgeProps) {
  const { t } = useTranslation("student");

  switch (status) {
    case "done":
      return <Badge tone="ok">{t("topics.statusDone")}</Badge>;
    case "current":
      return <Badge tone="brand">{t("topics.statusCurrent")}</Badge>;
    case "weak":
      return <Badge tone="warn">{t("topics.statusWeak")}</Badge>;
    case "locked":
    default:
      return <Badge tone="neutral">{t("topics.statusLocked")}</Badge>;
  }
}

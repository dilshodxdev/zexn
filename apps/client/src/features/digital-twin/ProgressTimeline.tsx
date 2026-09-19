import { useTranslation } from "react-i18next";
import { MessageSquareMore } from "lucide-react";
import type { ProgressPoint } from "@zexn/shared";
import { Badge, Card } from "@/components/ui";
import { cn, formatDateTime } from "@/lib/utils";

interface ProgressTimelineProps {
  recentProgress: ProgressPoint[];
}

export function ProgressTimeline({ recentProgress }: ProgressTimelineProps) {
  const { t } = useTranslation("twin");

  return (
    <Card title={t("timeline.title")} className="space-y-4">
      {recentProgress.length === 0 ? (
        <p className="text-xs text-muted italic p-2">{t("timeline.empty")}</p>
      ) : (
        <div className="relative border-l border-line ml-3.5 pl-5 space-y-4">
          {recentProgress.map((point) => {
            const diff = point.newScore - point.previousScore;
            const diffColor = diff > 0 ? "text-ok" : diff < 0 ? "text-danger" : "text-muted";
            const diffSign = diff > 0 ? `+${diff}` : `${diff}`;
            const isInterview = point.source === "INTERVIEW";

            return (
              <div key={point.id} className="relative group">
                {/* Timeline bullet dot */}
                <div
                  className={cn(
                    "absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-surface",
                    isInterview ? "bg-brand" : "bg-brand/70",
                  )}
                />

                <div className="rounded-xl border border-line bg-surface-alt p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-text">
                        {point.skillName}
                      </span>
                      {isInterview && (
                        <Badge tone="brand" className="gap-1 py-0 px-1.5 text-[10px]">
                          <MessageSquareMore className="h-3 w-3" />
                          <span>{t("timeline.sources.INTERVIEW")}</span>
                        </Badge>
                      )}
                    </div>
                    <span className={cn("font-mono text-xs font-bold", diffColor)}>
                      {point.previousScore} -&gt; {point.newScore} ({diffSign})
                    </span>
                  </div>

                  <p className="text-xs text-text font-medium">{point.label}</p>

                  <div className="text-[11px] text-muted font-mono pt-1">
                    {formatDateTime(point.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

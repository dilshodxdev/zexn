import { useTranslation } from "react-i18next";
import { Award, Trophy } from "lucide-react";
import type { StudentOverview } from "@zexn/shared";

interface RatingListProps {
  rating: StudentOverview["rating"];
}

export function RatingList({ rating }: RatingListProps) {
  const { t } = useTranslation("student");

  if (!rating || rating.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-muted">
        <p>{t("panel.noRating")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-muted">
        {t("panel.ratingTitle")}
      </div>
      <div className="space-y-1.5">
        {rating.map((item) => {
          const initial = item.fullName.trim().charAt(0).toUpperCase() || "?";
          return (
            <div
              key={item.userId}
              className={`flex items-center justify-between rounded-2xl border p-2.5 transition-colors ${
                item.isMe
                  ? "border-brand/40 bg-surface-alt shadow-sm"
                  : "border-line bg-surface-alt/70 hover:bg-surface-alt"
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span
                  className={`w-3 text-[10px] font-bold ${
                    item.rank === 1 ? "text-brand" : "text-muted"
                  }`}
                >
                  {item.rank}
                </span>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-[9px] font-bold text-text border border-line">
                  {initial}
                </div>
                <span className="truncate text-xs font-semibold text-text">{item.fullName}</span>
              </div>
              <div className="flex shrink-0 items-center space-x-1 font-mono text-xs font-bold text-text">
                {item.rank === 1 ? (
                  <Trophy className="h-3.5 w-3.5 text-brand" />
                ) : (
                  <Award className="h-3.5 w-3.5 text-muted" />
                )}
                <span className={item.isMe ? "text-brand" : "text-text"}>{item.xp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

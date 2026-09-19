import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, ChevronRight, Search, Sparkles } from "lucide-react";
import type { StudentOverview, TopicNode } from "@zexn/shared";

interface TopicListProps {
  course: StudentOverview["course"];
  activeTopicId?: string | null;
  onSelectTopic: (topicId: string) => void;
  onOpenChat: () => void;
}

export function TopicList({ course, activeTopicId, onSelectTopic, onOpenChat }: TopicListProps) {
  const { t } = useTranslation("student");
  const [activeTab, setActiveTab] = useState<"courses" | "discussions">("courses");

  const percent =
    course.totalCount > 0 ? Math.round((course.completedCount / course.totalCount) * 100) : 0;

  return (
    <aside className="flex w-full md:w-72 shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-surface-alt text-brand border border-line">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-text">{t("curriculum.title")}</h2>
              <p className="text-[10px] text-muted leading-tight">{t("curriculum.subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={t("curriculum.search")}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-alt text-muted hover:text-text transition-colors border border-line"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tabs: Kurslar | Suhbatlar */}
        <div className="flex gap-4 border-b border-line px-4 text-xs text-muted">
          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            className={`pb-2.5 font-semibold transition-colors ${
              activeTab === "courses" ? "border-b-2 border-brand text-brand" : "hover:text-text"
            }`}
          >
            {t("curriculum.tabCourses")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("discussions")}
            className={`flex items-center gap-1.5 pb-2.5 font-medium transition-colors ${
              activeTab === "discussions" ? "border-b-2 border-brand text-brand" : "hover:text-text"
            }`}
          >
            <span>{t("curriculum.tabDiscussions")}</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-brand/30 bg-surface-alt text-[9px] font-bold text-brand">
              1
            </span>
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {/* AI Mentor Quick Card */}
          <div
            onClick={onOpenChat}
            className="flex cursor-pointer items-center justify-between rounded-2xl border border-line bg-surface-alt p-3 transition-all hover:border-brand/40"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface text-brand border border-line">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-text truncate">
                  {t("curriculum.aiMentorCardTitle")}
                </div>
                <div className="text-[10px] text-muted truncate">
                  {t("curriculum.aiMentorCardSubtitle")}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-bg">
                1
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-muted" />
            </div>
          </div>

          {/* Course Name Header */}
          <div className="flex items-center space-x-1.5 px-2 pt-2 pb-1 text-xs font-semibold text-text truncate">
            <span className="h-2 w-2 rounded-full bg-brand inline-block shrink-0" />
            <span className="truncate">{course.title}</span>
          </div>

          {/* Topics List */}
          <nav className="space-y-1 text-xs">
            {course.topics.map((topic: TopicNode) => {
              const isActive = activeTopicId === topic.id;
              let itemClasses =
                "flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer transition-colors border ";

              if (isActive || topic.status === "current") {
                itemClasses += "bg-surface-alt text-text border-brand/40 shadow-sm";
              } else if (topic.status === "done") {
                itemClasses += "border-transparent hover:bg-surface-alt text-text";
              } else if (topic.status === "weak") {
                itemClasses += "border-warn/30 bg-surface-alt/50 text-warn hover:bg-surface-alt";
              } else {
                itemClasses += "border-transparent hover:bg-surface-alt text-muted";
              }

              let chipClasses =
                "rounded-full px-2 py-0.5 font-mono text-[10px] font-bold shrink-0 ";
              if (isActive || topic.status === "current") {
                chipClasses += "bg-brand text-bg";
              } else if (topic.status === "done") {
                chipClasses += "bg-ok/20 text-ok border border-ok/30";
              } else if (topic.status === "weak") {
                chipClasses += "bg-warn/20 text-warn border border-warn/30";
              } else {
                chipClasses += "bg-surface-alt text-muted border border-line";
              }

              return (
                <div key={topic.id} onClick={() => onSelectTopic(topic.id)} className={itemClasses}>
                  <div className="flex items-center space-x-2 truncate mr-2">
                    <ChevronRight
                      className={`h-3 w-3 shrink-0 ${
                        isActive || topic.status === "current" ? "text-brand" : "text-muted"
                      }`}
                    />
                    <span className="truncate font-medium">{topic.title}</span>
                  </div>
                  <span className={chipClasses}>
                    {topic.lessonsDone}/{topic.lessonsTotal}
                  </span>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer with progress */}
      <div className="border-t border-line bg-bg p-3.5">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
          <div className="flex items-center space-x-1.5 truncate mr-2">
            <span className="truncate font-medium text-text">{course.title}</span>
          </div>
          <span className="font-mono text-xs font-bold text-brand">{percent}%</span>
        </div>
        <div className="mb-1.5 h-1.5 w-full rounded-full bg-surface-alt overflow-hidden border border-line">
          <div
            className="h-1.5 rounded-full bg-brand transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-[10px] text-muted">
          {t("curriculum.lessonsCompleted", {
            completed: course.completedCount,
            total: course.totalCount,
          })}
        </div>
      </div>
    </aside>
  );
}

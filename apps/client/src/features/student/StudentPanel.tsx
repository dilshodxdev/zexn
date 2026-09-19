import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  Send,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import type { StudentOverview } from "@zexn/shared";
import { NextStepCard } from "./NextStepCard";
import { RatingList } from "./RatingList";

interface StudentPanelProps {
  overview: StudentOverview;
  onOpenChat: () => void;
  onSelectTopic: (topicId: string) => void;
}

export function StudentPanel({ overview, onOpenChat, onSelectTopic }: StudentPanelProps) {
  const { t } = useTranslation("student");
  const [activeTab, setActiveTab] = useState<"general" | "lesson" | "task" | "attendance">(
    "general",
  );

  const { student, stats, nextStep, course, rating } = overview;
  const initial = student.fullName.trim().charAt(0).toUpperCase() || "S";
  const xpPercent =
    stats.levelXp > 0 ? Math.min(100, Math.round((stats.xp / stats.levelXp) * 100)) : 0;

  const weakTopics = course.topics.filter((top) => top.status === "weak");
  const fallbackTopics = course.topics.filter((top) => top.status !== "done");

  return (
    <aside className="flex w-full md:w-80 shrink-0 flex-col overflow-y-auto rounded-3xl border border-line bg-surface">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-brand" />
          <h2 className="text-xs font-bold text-text">{t("panel.title")}</h2>
        </div>
        <p className="pl-6 text-[10px] text-muted leading-tight">{t("panel.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-line px-4 text-xs text-muted">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-1 pb-2.5 font-semibold transition-colors ${
            activeTab === "general" ? "border-b-2 border-brand text-brand" : "hover:text-text"
          }`}
        >
          <User className="h-3 w-3" />
          <span>{t("panel.tabGeneral")}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("lesson")}
          className={`flex items-center gap-1 pb-2.5 font-medium transition-colors ${
            activeTab === "lesson" ? "border-b-2 border-brand text-brand" : "hover:text-text"
          }`}
        >
          <Clock className="h-3 w-3" />
          <span>{t("panel.tabLesson")}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("task")}
          className={`flex items-center gap-1 pb-2.5 font-medium transition-colors ${
            activeTab === "task" ? "border-b-2 border-brand text-brand" : "hover:text-text"
          }`}
        >
          <CheckCircle className="h-3 w-3" />
          <span>{t("panel.tabTask")}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-1 pb-2.5 font-medium transition-colors ${
            activeTab === "attendance" ? "border-b-2 border-brand text-brand" : "hover:text-text"
          }`}
        >
          <Calendar className="h-3 w-3" />
          <span>{t("panel.tabAttendance")}</span>
        </button>
      </div>

      {/* Tab content */}
      <div className="p-3.5 space-y-3">
        {/* User Card */}
        <div className="flex items-center space-x-3 rounded-2xl border border-line bg-surface-alt p-3 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-bg text-sm shadow">
            {initial}
          </div>
          <div className="truncate">
            <h3 className="truncate text-sm font-bold text-text">{student.fullName}</h3>
            <div className="flex items-center space-x-1 text-[11px] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand inline-block" />
              <span>{t("header.online")}</span>
            </div>
            <div className="font-mono text-[10px] text-muted">ID: #{student.shortId}</div>
          </div>
        </div>

        {/* XP Level Bar */}
        <div className="rounded-2xl border border-line bg-surface-alt p-3 shadow-sm">
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted">
            <span className="font-semibold text-text">{t("panel.xpLevel")}</span>
            <div className="flex items-center gap-1 font-mono">
              <span className="font-bold text-text">{stats.xp}</span>
              <span className="text-muted">/{stats.levelXp}</span>
              <span className="text-brand">★</span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-surface overflow-hidden border border-line">
            <div
              className="h-2 rounded-full bg-brand transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Telegram Bot Card */}
        <div className="rounded-2xl border border-line bg-surface-alt p-3 shadow-sm">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-text">
              <Send className="h-3.5 w-3.5 text-brand" />
              <span>{t("panel.telegramBot")}</span>
            </div>
            {student.hasTelegram ? (
              <span className="rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold text-bg">
                {t("panel.connected")}
              </span>
            ) : (
              <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[9px] font-medium text-muted">
                {t("panel.connectTelegram")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-muted truncate">
            {student.telegramUsername ? (
              <span className="truncate text-brand hover:underline cursor-pointer">
                @{student.telegramUsername}
              </span>
            ) : (
              <span>ID: #{student.shortId}</span>
            )}
          </div>
        </div>

        {/* 4 Mini Metric Cards */}
        <div className="grid grid-cols-2 gap-2">
          {/* Streak */}
          <div className="rounded-2xl border border-line bg-surface-alt p-3 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-medium text-muted">{t("panel.streak")}</span>
              <Flame className="h-3.5 w-3.5 text-brand" />
            </div>
            <div className="mt-1 text-sm font-bold text-text">
              {stats.streakDays}{" "}
              <span className="text-[10px] font-normal text-muted">{t("panel.days")}</span>
            </div>
          </div>

          {/* Record */}
          <div className="rounded-2xl border border-line bg-surface-alt p-3 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-medium text-muted">{t("panel.record")}</span>
              <Zap className="h-3.5 w-3.5 text-brand" />
            </div>
            <div className="mt-1 text-sm font-bold text-text">
              {stats.streakRecord}{" "}
              <span className="text-[10px] font-normal text-muted">{t("panel.days")}</span>
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded-2xl border border-line bg-surface-alt p-3 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-medium text-muted">{t("panel.achievements")}</span>
              <Award className="h-3.5 w-3.5 text-brand" />
            </div>
            <div className="mt-1 text-sm font-bold text-text">
              {stats.achievementsEarned}{" "}
              <span className="text-[10px] font-normal text-muted">/{stats.achievementsTotal}</span>
            </div>
          </div>

          {/* Total XP */}
          <div className="rounded-2xl border border-line bg-surface-alt p-3 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-medium text-muted">{t("panel.totalXp")}</span>
              <Sparkles className="h-3.5 w-3.5 text-brand" />
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-brand">{stats.xp}</div>
          </div>
        </div>

        {/* AI Mentor Card */}
        <NextStepCard
          nextStep={nextStep}
          level={stats.level}
          weakTopics={weakTopics}
          fallbackTopics={fallbackTopics}
          onOpenChat={onOpenChat}
          onSelectTopic={onSelectTopic}
        />

        {/* Rating List */}
        <RatingList rating={rating} />
      </div>
    </aside>
  );
}

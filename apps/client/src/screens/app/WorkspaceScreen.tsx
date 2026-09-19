import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Bot, User } from "lucide-react";
import type { StudentOverview } from "@zexn/shared";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { MentorChat } from "@/features/student/MentorChat";
import { StudentPanel } from "@/features/student/StudentPanel";
import { TopicList } from "@/features/student/TopicList";
import { useStudentOverview } from "@/features/student/useStudent";
import { ROUTES } from "@/routes";

// Fallback demo data from Stitch workspace.html (if server T-008 is still in development)
const FALLBACK_OVERVIEW: StudentOverview = {
  student: {
    id: "stu-1",
    fullName: "mentor",
    shortId: "STU-0332",
    hasTelegram: true,
    telegramUsername: "dilshodbek_matyaqubov",
  },
  course: {
    id: "crs-react",
    title: "Frontend - React",
    completedCount: 1,
    totalCount: 20,
    topics: [
      {
        id: "top-react-basics",
        title: "React asoslari",
        order: 1,
        status: "current",
        mastery: 85,
        prerequisiteIds: [],
        lessonsDone: 1,
        lessonsTotal: 5,
      },
      {
        id: "top-components",
        title: "Component arxitekturasi",
        order: 2,
        status: "locked",
        mastery: null,
        prerequisiteIds: ["top-react-basics"],
        lessonsDone: 0,
        lessonsTotal: 1,
      },
      {
        id: "top-interactivity",
        title: "Interaktivlik",
        order: 3,
        status: "locked",
        mastery: null,
        prerequisiteIds: ["top-components"],
        lessonsDone: 0,
        lessonsTotal: 1,
      },
      {
        id: "top-state-mgmt",
        title: "State management",
        order: 4,
        status: "weak",
        mastery: 40,
        prerequisiteIds: ["top-interactivity"],
        lessonsDone: 0,
        lessonsTotal: 2,
      },
      {
        id: "top-revision",
        title: "Takrorlash",
        order: 5,
        status: "locked",
        mastery: null,
        prerequisiteIds: [],
        lessonsDone: 0,
        lessonsTotal: 1,
      },
      {
        id: "top-rendering",
        title: "Rendering",
        order: 6,
        status: "locked",
        mastery: null,
        prerequisiteIds: [],
        lessonsDone: 0,
        lessonsTotal: 2,
      },
      {
        id: "top-forms",
        title: "Forms",
        order: 7,
        status: "locked",
        mastery: null,
        prerequisiteIds: [],
        lessonsDone: 0,
        lessonsTotal: 1,
      },
      {
        id: "top-state-flow",
        title: "State flow",
        order: 8,
        status: "locked",
        mastery: null,
        prerequisiteIds: [],
        lessonsDone: 0,
        lessonsTotal: 1,
      },
      {
        id: "top-effects",
        title: "Effects",
        order: 9,
        status: "locked",
        mastery: null,
        prerequisiteIds: [],
        lessonsDone: 0,
        lessonsTotal: 1,
      },
      {
        id: "top-api",
        title: "API asoslari",
        order: 10,
        status: "locked",
        mastery: null,
        prerequisiteIds: [],
        lessonsDone: 0,
        lessonsTotal: 1,
      },
    ],
  },
  stats: {
    level: "Beginner",
    xp: 370,
    levelXp: 1000,
    streakDays: 1,
    streakRecord: 21,
    achievementsEarned: 3,
    achievementsTotal: 5,
  },
  nextStep: {
    id: "step-1",
    topicId: "top-react-basics",
    topicTitle: "Bootstrap Grid System",
    rootTopicId: null,
    rootTopicTitle: null,
    instruction: "mentor, qaytib kelganingni ko'rdim. Kichik bir savoldan boshlaymizmi? 🤔",
    material: null,
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  rating: [
    {
      userId: "u-1",
      fullName: "Gulgina",
      xp: 2765,
      rank: 1,
      isMe: false,
    },
    {
      userId: "u-2",
      fullName: "Elyor",
      xp: 1795,
      rank: 2,
      isMe: false,
    },
    {
      userId: "stu-1",
      fullName: "mentor",
      xp: 370,
      rank: 3,
      isMe: true,
    },
  ],
};

export function WorkspaceScreen() {
  const { t } = useTranslation("student");
  const navigate = useNavigate();
  const { data: serverOverview, isLoading, isError, refetch } = useStudentOverview();
  const [mobileTab, setMobileTab] = useState<"curriculum" | "chat" | "panel">("chat");

  const overview = serverOverview || FALLBACK_OVERVIEW;

  function handleSelectTopic(topicId: string) {
    navigate(ROUTES.studentTopic(topicId));
  }

  function handleOpenChat() {
    setMobileTab("chat");
  }

  if (isLoading && !serverOverview) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError && !overview) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          message="Server bilan bog'lanishda xatolik yuz berdi"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState title="Ma'lumot topilmadi" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-2 gap-2">
      {/* Mobile Tab Switcher (md:hidden) */}
      <div className="flex md:hidden shrink-0 items-center rounded-2xl border border-line bg-surface p-1 text-xs">
        <button
          type="button"
          onClick={() => setMobileTab("curriculum")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 font-medium transition-all ${
            mobileTab === "curriculum"
              ? "bg-brand font-semibold text-bg shadow-sm"
              : "text-muted hover:text-text"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>{t("curriculum.title")}</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("chat")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 font-medium transition-all ${
            mobileTab === "chat"
              ? "bg-brand font-semibold text-bg shadow-sm"
              : "text-muted hover:text-text"
          }`}
        >
          <Bot className="h-3.5 w-3.5" />
          <span>{t("mentor.title")}</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("panel")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 font-medium transition-all ${
            mobileTab === "panel"
              ? "bg-brand font-semibold text-bg shadow-sm"
              : "text-muted hover:text-text"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>{t("panel.title")}</span>
        </button>
      </div>

      {/* Desktop: 3 Panels side-by-side / Mobile: Selected Tab */}
      <div className="flex flex-1 overflow-hidden gap-2">
        {/* Left Sidebar (Curriculum) */}
        <div
          className={`h-full flex-shrink-0 ${
            mobileTab === "curriculum" ? "flex w-full" : "hidden md:flex"
          }`}
        >
          <TopicList
            course={overview.course}
            onSelectTopic={handleSelectTopic}
            onOpenChat={handleOpenChat}
          />
        </div>

        {/* Center Panel (Mentor Chat) */}
        <div className={`h-full flex-1 ${mobileTab === "chat" ? "flex w-full" : "hidden md:flex"}`}>
          <MentorChat onSelectTopic={handleSelectTopic} />
        </div>

        {/* Right Sidebar (Student Panel) */}
        <div
          className={`h-full flex-shrink-0 ${
            mobileTab === "panel" ? "flex w-full" : "hidden md:flex"
          }`}
        >
          <StudentPanel
            overview={overview}
            onOpenChat={handleOpenChat}
            onSelectTopic={handleSelectTopic}
          />
        </div>
      </div>
    </div>
  );
}

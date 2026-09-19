import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button, EmptyState, ErrorState, PageHeader, Spinner } from "@/components/ui";
import { TwinHeader } from "@/features/digital-twin/TwinHeader";
import { CurrentStateCard } from "@/features/digital-twin/CurrentStateCard";
import { TwinNextStepCard } from "@/features/digital-twin/TwinNextStepCard";
import { SkillMap } from "@/features/digital-twin/SkillMap";
import { PatternList } from "@/features/digital-twin/PatternList";
import { ProgressTimeline } from "@/features/digital-twin/ProgressTimeline";
import { TwinInterviews } from "@/features/digital-twin/TwinInterviews";
import { useDigitalTwin } from "@/features/digital-twin/useDigitalTwin";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";
import { ApiError } from "@/lib/api";

export function StudentTwinScreen() {
  const { t } = useTranslation("twin");
  const { studentId = "" } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { currentMembership } = useAuthStore();

  const isCenterAdmin = currentMembership?.role === "CENTER_ADMIN";

  const { data: twin, isLoading, error, refetch } = useDigitalTwin(studentId);

  function handleBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate(isCenterAdmin ? ROUTES.adminTasks : ROUTES.teacherTasks);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    const is404 = error instanceof ApiError && error.status === 404;

    if (is404) {
      return (
        <div className="flex h-full items-center justify-center p-6">
          <EmptyState
            title={t("notFound")}
            description={t("notFoundDesc")}
            action={
              <Button
                variant="secondary"
                size="sm"
                className="min-h-[44px]"
                onClick={handleBack}
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                {t("back")}
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          message={error instanceof Error ? error.message : t("errorLoad")}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          title={t("notFound")}
          description={t("notFoundDesc")}
          action={
            <Button
              variant="secondary"
              size="sm"
              className="min-h-[44px]"
              onClick={handleBack}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              {t("back")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-5 lg:p-7">
      <main className="mx-auto max-w-7xl space-y-5 rounded-[2.25rem] border border-line bg-surface p-4 shadow-pop sm:p-6 lg:p-8">
        {/* Page Header with Back button */}
        <PageHeader
          title={t("title")}
          subtitle={twin.course.title}
          actions={
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px]"
              onClick={handleBack}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              {t("backToTasks")}
            </Button>
          }
        />

        {/* Digital Twin Header */}
        <TwinHeader
          student={twin.student}
          course={twin.course}
          overallMastery={twin.overallMastery}
          confidence={twin.confidence}
        />

        {/*
          Responsive layout:
          Desktop (lg:): 2 columns
            Left col: CurrentState, SkillMap, Patterns
            Right col: NextStep, Timeline
          Mobile (<lg): 1 column
            Order: CurrentState -> NextStep -> SkillMap -> Patterns -> Timeline
        */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:items-start">
          {/* 1. Current State */}
          <div className="order-1 lg:col-start-1 lg:row-start-1 space-y-6">
            <CurrentStateCard
              fullName={twin.student.fullName}
              level={twin.course.level}
              overallMastery={twin.overallMastery}
              summary={twin.summary}
            />
          </div>

          {/* 2. Next Step */}
          <div className="order-2 lg:col-start-2 lg:row-start-1 space-y-6">
            <TwinNextStepCard studentId={studentId} nextSteps={twin.nextSteps} />
          </div>

          {/* 3. Skill Map */}
          <div className="order-3 lg:col-start-1 lg:row-start-2 space-y-6">
            <SkillMap
              strongSkills={twin.strongSkills}
              developingSkills={twin.developingSkills}
              weakSkills={twin.weakSkills}
              unassessedSkills={twin.unassessedSkills}
            />
          </div>

          {/* 4. Patterns */}
          <div className="order-4 lg:col-start-1 lg:row-start-3 space-y-6">
            <PatternList
              activePatterns={twin.activePatterns}
              resolvedPatterns={twin.resolvedPatterns}
            />
          </div>

          {/* 5. Timeline & Interviews */}
          <div className="order-5 lg:col-start-2 lg:row-start-2 lg:row-span-2 space-y-6">
            <ProgressTimeline recentProgress={twin.recentProgress} />
            <TwinInterviews studentId={studentId} />
          </div>
        </div>
      </main>
    </div>
  );
}

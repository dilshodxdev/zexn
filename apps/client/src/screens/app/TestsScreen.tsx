import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2, FileQuestion } from "lucide-react";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Spinner } from "@/components/ui";
import { useStudentTests } from "@/features/student/useStudent";
import { ROUTES } from "@/routes";

// Fallback tests if server T-008 is still in development
const FALLBACK_TESTS = [
  {
    id: "test-react-basics",
    title: "React asoslari diagnostik testi",
    topicId: "top-react-basics",
    topicTitle: "React asoslari",
    questionCount: 5,
    status: "available" as const,
    lastScore: null,
  },
  {
    id: "test-components",
    title: "Component arxitekturasi testi",
    topicId: "top-components",
    topicTitle: "Component arxitekturasi",
    questionCount: 8,
    status: "available" as const,
    lastScore: 65,
  },
  {
    id: "test-state-mgmt",
    title: "State management chuqur tahlili",
    topicId: "top-state-mgmt",
    topicTitle: "State management",
    questionCount: 6,
    status: "available" as const,
    lastScore: 40,
  },
];

export function TestsScreen() {
  const { t } = useTranslation("student");
  const { data: serverTests, isLoading, isError, refetch } = useStudentTests();

  const tests = serverTests && serverTests.length > 0 ? serverTests : FALLBACK_TESTS;

  if (isLoading && !serverTests) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError && !tests) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          message="Testlar ro'yxatini yuklashda xatolik yuz berdi"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title={t("tests.title")}
          subtitle={t("tests.subtitle")}
          actions={
            <Link to={ROUTES.app}>
              <Button variant="ghost" size="sm">
                {t("attempt.backToWorkspace")}
              </Button>
            </Link>
          }
        />

        {tests.length === 0 ? (
          <EmptyState title={t("tests.empty")} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tests.map((test) => {
              const isDone = test.status === "completed" || test.lastScore !== null;
              return (
                <Card
                  key={test.id}
                  className="flex flex-col justify-between border-line bg-surface p-5 shadow-sm hover:border-brand/30 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-alt text-brand border border-line">
                        <FileQuestion className="h-4 w-4" />
                      </div>
                      {isDone ? (
                        <Badge tone="ok">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {test.lastScore !== null
                            ? t("tests.lastScore", { score: test.lastScore })
                            : t("tests.completed")}
                        </Badge>
                      ) : (
                        <Badge tone="brand">{t("tests.available")}</Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-text">{test.title}</h3>
                      <p className="mt-1 text-xs text-muted">{test.topicTitle}</p>
                    </div>

                    <div className="text-[11px] font-mono text-muted">
                      {t("tests.questionCount", { count: test.questionCount })}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line flex justify-end">
                    <Link to={ROUTES.studentTestRun(test.id)}>
                      <Button
                        variant={isDone ? "secondary" : "primary"}
                        size="sm"
                        icon={<ArrowRight className="h-3.5 w-3.5" />}
                      >
                        {isDone ? t("tests.retake") : t("tests.start")}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

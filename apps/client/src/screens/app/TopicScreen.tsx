import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink, FileText, Play, Video } from "lucide-react";
import { Button, Card, EmptyState, ErrorState, Spinner } from "@/components/ui";
import { TopicStatusBadge } from "@/features/student/TopicStatusBadge";
import { useTopicDetail } from "@/features/student/useStudent";
import { ROUTES } from "@/routes";

export function TopicScreen() {
  const { t } = useTranslation("student");
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useTopicDetail(topicId || "");

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          message="Mavzu tafsilotlarini olishda xatolik yuz berdi"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const { topic, description, materials, gap, availableTestId } = data;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.app)}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            {t("topics.back")}
          </Button>

          <TopicStatusBadge status={topic.status} />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{topic.title}</h1>
          <p className="text-sm text-muted leading-relaxed">
            {description || "Ushbu mavzu bo'yicha asosiy tushunchalar va darsliklar."}
          </p>
        </div>

        {/* Knowledge Gap Alert if present */}
        {gap && (
          <div className="rounded-2xl border border-warn/30 bg-warn/10 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-warn">{t("topics.gapTitle")}</h3>
            <p className="text-xs text-text leading-relaxed">{gap.explanation}</p>
            {gap.rootTopicTitle && (
              <p className="text-xs font-medium text-warn">
                {t("topics.rootCause", { topic: gap.rootTopicTitle })}
              </p>
            )}
          </div>
        )}

        {/* Action: Take Test button if available */}
        {availableTestId && (
          <Card className="flex items-center justify-between border-brand/30 bg-surface-alt p-4">
            <div>
              <h3 className="text-sm font-bold text-text">{t("topics.takeTest")}</h3>
              <p className="text-xs text-muted">
                Ushbu mavzuni o'zlashtirganingizni tekshirish uchun test topshiring
              </p>
            </div>
            <Link to={ROUTES.studentTestRun(availableTestId)}>
              <Button variant="primary" size="md" icon={<Play className="h-4 w-4" />}>
                {t("topics.takeTest")}
              </Button>
            </Link>
          </Card>
        )}

        {/* Materials list */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-text">{t("topics.materialsTitle")}</h2>

          {materials.length === 0 ? (
            <EmptyState title={t("topics.noMaterials")} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {materials.map((mat) => {
                const isVideo = mat.kind === "video";
                return (
                  <Card
                    key={mat.id}
                    className="flex items-center justify-between border-line bg-surface p-4 hover:border-brand/30 transition-all"
                  >
                    <div className="flex items-center space-x-3 truncate mr-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-alt text-brand border border-line">
                        {isVideo ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </div>
                      <div className="truncate">
                        <h4 className="truncate text-xs font-semibold text-text">{mat.title}</h4>
                        <span className="font-mono text-[10px] text-muted uppercase">
                          {mat.kind}
                        </span>
                      </div>
                    </div>

                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-alt text-muted hover:text-brand transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

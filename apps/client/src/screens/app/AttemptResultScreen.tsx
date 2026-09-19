import { Link, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ArrowRight, Award, CheckCircle2, Sparkles, Trophy } from "lucide-react";
import type { AttemptResult } from "@zexn/shared";
import { Badge, Button, Card } from "@/components/ui";
import { ROUTES } from "@/routes";

export function AttemptResultScreen() {
  const { t } = useTranslation("student");
  const location = useLocation();

  const stateResult = (location.state as { result?: AttemptResult } | undefined)?.result;

  if (!stateResult) {
    return <Navigate to={ROUTES.studentTests} replace />;
  }

  const result = stateResult;

  const isSuccess = result.score >= 70;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Score Card */}
        <Card className="border-line bg-surface p-6 sm:p-8 text-center shadow-pop space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-line bg-surface-alt shadow-sm">
            {isSuccess ? (
              <Trophy className="h-8 w-8 text-brand" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-warn" />
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text">{t("attempt.resultTitle")}</h1>
            <p className="mt-1 text-xs text-muted">
              {t("attempt.correctCount", { correct: result.correct, total: result.total })}
            </p>
          </div>

          {/* Score display */}
          <div className="py-2">
            <div className="font-mono text-5xl sm:text-6xl font-black text-brand">
              {result.score}%
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("attempt.xpEarned", { xp: result.xpEarned })}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-line flex justify-center">
            <Link to={ROUTES.app}>
              <Button variant="primary" size="md" icon={<ArrowRight className="h-4 w-4" />}>
                {t("attempt.backToWorkspace")}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Knowledge Gaps */}
        {result.gaps.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warn" />
              <span>{t("attempt.gapsTitle")}</span>
            </h2>

            <div className="space-y-3">
              {result.gaps.map((gap, idx) => (
                <Card key={idx} className="border-warn/30 bg-surface-alt p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text">{gap.topicTitle}</h3>
                    <Badge tone="warn">{Math.round(gap.confidence * 100)}% ishonchlilik</Badge>
                  </div>

                  {gap.explanation && (
                    <p className="text-xs text-muted leading-relaxed">{gap.explanation}</p>
                  )}

                  {gap.rootTopicTitle && (
                    <div className="text-xs font-medium text-warn">
                      {t("attempt.rootCauseLabel")}: {gap.rootTopicTitle}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Next Steps */}
        {result.nextSteps.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <Award className="h-4 w-4 text-brand" />
              <span>{t("attempt.nextStepsTitle")}</span>
            </h2>

            <div className="space-y-3">
              {result.nextSteps.map((step) => (
                <Card
                  key={step.id}
                  className="flex items-center justify-between border-line bg-surface p-4"
                >
                  <div className="space-y-1 truncate mr-2">
                    <h4 className="text-xs font-bold text-text truncate">{step.topicTitle}</h4>
                    <p className="text-xs text-muted">{step.instruction}</p>
                  </div>
                  <Badge tone="brand">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Topshiriq
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

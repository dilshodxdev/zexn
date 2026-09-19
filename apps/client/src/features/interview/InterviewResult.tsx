import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import type { InterviewSession } from "@zexn/shared";
import { Badge, Button, Card, ProgressRing } from "@/components/ui";
import { ROUTES } from "@/routes";

interface InterviewResultProps {
  session: InterviewSession;
}

export function InterviewResult({ session }: InterviewResultProps) {
  const { t } = useTranslation("interview");
  const navigate = useNavigate();

  const isAbandoned = session.status === "ABANDONED";
  const result = session.result;

  if (isAbandoned || !result) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Card className="max-w-md border-line bg-surface p-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-alt text-muted">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-text">{t("result.abandonedTitle")}</h2>
            <p className="text-xs text-muted leading-relaxed">{t("result.abandonedDesc")}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="min-h-[44px]"
            onClick={() => navigate(ROUTES.studentInterview)}
            icon={<RotateCcw className="h-4 w-4" />}
          >
            {t("result.again")}
          </Button>
        </Card>
      </div>
    );
  }

  const scoreTone = result.score >= 70 ? "ok" : result.score >= 40 ? "warn" : "danger";

  const hasMastery = result.masteryBefore !== null && result.masteryAfter !== null;
  const masteryDiff = hasMastery ? (result.masteryAfter ?? 0) - (result.masteryBefore ?? 0) : 0;
  const isMasteryUp = masteryDiff > 0;
  const isMasteryDown = masteryDiff < 0;

  const trackTitle = t(`tracks.${session.track}`);
  const displayTitle = session.skill ? `${trackTitle} (${session.skill.name})` : trackTitle;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Top Header Card with Score */}
        <Card className="border-line bg-surface p-6 text-center shadow-pop space-y-4">
          <Badge tone="brand" className="mx-auto">
            {displayTitle}
          </Badge>

          <div className="space-y-1">
            <h1 className="text-xl font-black text-text sm:text-2xl">{t("result.title")}</h1>
            <p className="text-xs text-muted">{t("result.subtitle", { track: trackTitle })}</p>
          </div>

          {/* Scores: Main overall score + Theory and Code sub-scores */}
          <div className="flex flex-col items-center justify-center py-2 space-y-4">
            <div className="flex flex-col items-center">
              <ProgressRing value={result.score} tone={scoreTone} size={96} strokeWidth={8}>
                <span className="font-mono text-xl font-black text-text">{result.score}%</span>
              </ProgressRing>
              <span className="mt-2 font-mono text-xs text-muted">{t("result.scoreLabel")}</span>
            </div>

            {/* Theory & Code sub-scores */}
            <div className="flex items-center justify-center gap-8 border-t border-line/60 pt-4 w-full max-w-xs">
              <div className="flex flex-col items-center space-y-1">
                <ProgressRing
                  value={result.theoryScore}
                  tone={
                    result.theoryScore >= 70 ? "ok" : result.theoryScore >= 40 ? "warn" : "danger"
                  }
                  size={52}
                  strokeWidth={5}
                >
                  <span className="font-mono text-xs font-bold text-text">
                    {result.theoryScore}%
                  </span>
                </ProgressRing>
                <span className="text-[11px] text-muted">{t("result.theoryScoreLabel")}</span>
              </div>

              <div className="flex flex-col items-center space-y-1">
                <ProgressRing
                  value={result.codeScore}
                  tone={result.codeScore >= 70 ? "ok" : result.codeScore >= 40 ? "warn" : "danger"}
                  size={52}
                  strokeWidth={5}
                >
                  <span className="font-mono text-xs font-bold text-text">{result.codeScore}%</span>
                </ProgressRing>
                <span className="text-[11px] text-muted">{t("result.codeScoreLabel")}</span>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="rounded-2xl border border-line bg-surface-alt/70 p-4 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-brand">
              <Sparkles className="h-4 w-4" />
              <h2 className="text-xs font-bold text-text">{t("result.summaryTitle")}</h2>
            </div>
            <p className="text-xs text-text leading-relaxed">{result.summary}</p>
          </div>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Strengths */}
          <Card className="border-line bg-surface p-4 space-y-3">
            <div className="flex items-center gap-2 text-ok">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <h2 className="text-xs font-bold text-text">{t("result.strengthsTitle")}</h2>
            </div>
            {result.strengths.length === 0 ? (
              <p className="text-xs text-muted italic">{t("result.noStrengths")}</p>
            ) : (
              <ul className="space-y-1.5 text-xs text-muted">
                {result.strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-ok leading-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Weaknesses */}
          <Card className="border-line bg-surface p-4 space-y-3">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <h2 className="text-xs font-bold text-text">{t("result.weaknessesTitle")}</h2>
            </div>
            {result.weaknesses.length === 0 ? (
              <p className="text-xs text-muted italic">{t("result.noWeaknesses")}</p>
            ) : (
              <ul className="space-y-1.5 text-xs text-muted">
                {result.weaknesses.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-danger leading-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* SDT Updated Card (Only if masteryBefore & masteryAfter exist) */}
        {hasMastery && session.skill && (
          <Card className="border-line bg-surface p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-line ${
                    isMasteryUp
                      ? "bg-ok-soft text-ok"
                      : isMasteryDown
                        ? "bg-danger-soft text-danger"
                        : "bg-surface-alt text-muted"
                  }`}
                >
                  {isMasteryUp ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : isMasteryDown ? (
                    <TrendingDown className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text">{t("result.sdtUpdatedTitle")}</h2>
                  <p className="text-xs text-muted">
                    {isMasteryUp
                      ? t("result.sdtChangeIncreased", {
                          skill: session.skill.name,
                          before: result.masteryBefore,
                          after: result.masteryAfter,
                          diff: masteryDiff,
                        })
                      : isMasteryDown
                        ? t("result.sdtChangeDecreased", {
                            skill: session.skill.name,
                            before: result.masteryBefore,
                            after: result.masteryAfter,
                            diff: masteryDiff,
                          })
                        : t("result.sdtChangeUnchanged", {
                            skill: session.skill.name,
                            before: result.masteryBefore,
                          })}
                  </p>
                </div>
              </div>

              <div className="font-mono text-sm font-black text-text">
                <span>{result.masteryBefore}%</span>
                <span className="mx-1.5 text-muted">-&gt;</span>
                <span
                  className={isMasteryUp ? "text-ok" : isMasteryDown ? "text-danger" : "text-text"}
                >
                  {result.masteryAfter}%
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="secondary"
            size="md"
            className="min-h-[44px] w-full sm:w-auto"
            onClick={() => navigate(ROUTES.app)}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            {t("result.backHome")}
          </Button>

          <Button
            variant="primary"
            size="md"
            className="min-h-[44px] w-full sm:w-auto"
            onClick={() => navigate(ROUTES.studentInterview)}
            icon={<RotateCcw className="h-4 w-4" />}
          >
            {t("result.again")}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Monitor,
  Server,
  Smartphone,
  Layers,
  Bot,
  Apple,
  Play,
  Sparkles,
  Check,
} from "lucide-react";
import { type InterviewTrack, type InterviewLevel, INTERVIEW_LEVELS } from "@zexn/shared";
import { Badge, Button, Card, Spinner, ErrorState } from "@/components/ui";
import { ROUTES } from "@/routes";
import { ApiError } from "@/lib/api";
import { useInterviewTracks, useInterviewSkills, useStartInterview } from "./useInterview";

const TRACK_ICONS: Record<InterviewTrack, typeof Monitor> = {
  frontend: Monitor,
  backend: Server,
  mobile: Smartphone,
  fullstack: Layers,
  android: Bot,
  ios: Apple,
};

export function TrackPicker() {
  const { t } = useTranslation("interview");
  const navigate = useNavigate();

  const { data: tracks, isLoading, error, refetch } = useInterviewTracks();
  const { data: skills } = useInterviewSkills();
  const startMutation = useStartInterview();

  const [selectedTrack, setSelectedTrack] = useState<InterviewTrack>("frontend");
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<InterviewLevel>("medium");

  async function handleStart() {
    try {
      const session = await startMutation.mutateAsync({
        track: selectedTrack,
        skillId: selectedTrack === "frontend" && selectedSkillId ? selectedSkillId : undefined,
        level: selectedLevel,
      });
      navigate(ROUTES.studentInterviewRun(session.id));
    } catch (err: unknown) {
      if (
        (err instanceof ApiError && err.status === 409 && err.meta?.sessionId) ||
        (typeof err === "object" &&
          err !== null &&
          "status" in err &&
          err.status === 409 &&
          "meta" in err &&
          typeof (err as { meta?: { sessionId?: string } }).meta?.sessionId === "string")
      ) {
        const activeSessionId =
          err instanceof ApiError
            ? (err.meta?.sessionId as string)
            : (err as { meta: { sessionId: string } }).meta.sessionId;
        navigate(ROUTES.studentInterviewRun(activeSessionId));
        return;
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : t("error")}
        onRetry={() => void refetch()}
      />
    );
  }

  const trackList = tracks ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-text sm:text-lg">{t("picker.title")}</h2>
        <p className="mt-1 text-xs text-muted sm:text-sm">{t("picker.subtitle")}</p>
      </div>

      {/* 6 Tracks Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trackList.map((trackInfo) => {
          const isSelected = selectedTrack === trackInfo.track;
          const Icon = TRACK_ICONS[trackInfo.track] ?? Smartphone;

          return (
            <button
              key={trackInfo.track}
              type="button"
              onClick={() => setSelectedTrack(trackInfo.track)}
              className={`flex flex-col justify-between gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-brand bg-brand-soft/20 shadow-sm ring-1 ring-brand"
                  : "border-line bg-surface hover:border-brand/40 hover:bg-surface-alt/60"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-alt text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-bg">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text sm:text-base">
                    {t(`tracks.${trackInfo.track}`)}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted leading-relaxed">
                    {t(`trackDescriptions.${trackInfo.track}`)}
                  </p>
                </div>

                {/* Languages chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {trackInfo.languages.map((lang) => (
                    <Badge key={lang} tone="neutral" className="px-1.5 py-0 text-[10px] font-mono">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats footer */}
              <div className="border-t border-line/60 pt-2 text-[11px] text-muted flex items-center justify-between">
                <span>
                  {trackInfo.interviewCount > 0
                    ? t("picker.attemptsCount", { count: trackInfo.interviewCount })
                    : t("picker.noAttempts")}
                </span>
                {trackInfo.bestScore !== null && (
                  <span className="font-semibold text-text">
                    {t("picker.bestScore", { score: trackInfo.bestScore })}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Track Configuration & Options Panel */}
      <Card className="border-line bg-surface p-4 sm:p-5 space-y-4">
        {/* If Frontend, Optional Skill link */}
        {selectedTrack === "frontend" && (
          <div className="space-y-2 border-b border-line pb-4">
            <label className="text-xs font-bold text-text">{t("picker.optionalSkill")}</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => setSelectedSkillId("")}
                className={`rounded-xl border p-2.5 text-left text-xs transition-colors ${
                  selectedSkillId === ""
                    ? "border-brand bg-brand-soft/30 font-semibold text-text"
                    : "border-line bg-surface-alt text-muted hover:text-text"
                }`}
              >
                {t("picker.allSkills")}
              </button>
              {skills?.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setSelectedSkillId(skill.id)}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-left text-xs transition-colors ${
                    selectedSkillId === skill.id
                      ? "border-brand bg-brand-soft/30 font-semibold text-text"
                      : "border-line bg-surface-alt text-muted hover:text-text"
                  }`}
                >
                  <span className="truncate">{skill.name}</span>
                  <Badge
                    tone={skill.tier === "strong" ? "ok" : "brand"}
                    className="text-[10px] ml-1 shrink-0"
                  >
                    {skill.mastery}%
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Level selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text">{t("picker.selectLevel")}</label>
          <div className="flex flex-wrap gap-2">
            {INTERVIEW_LEVELS.map((lvl) => (
              <Button
                key={lvl}
                type="button"
                variant={selectedLevel === lvl ? "primary" : "secondary"}
                size="sm"
                className="min-h-[40px] px-4"
                onClick={() => setSelectedLevel(lvl)}
              >
                {t(`level.${lvl}`)}
              </Button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2 border-t border-line">
          <Button
            variant="primary"
            size="lg"
            className="w-full min-h-[44px] sm:w-auto"
            loading={startMutation.isPending}
            onClick={() => void handleStart()}
            icon={
              startMutation.isPending ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )
            }
          >
            {startMutation.isPending
              ? t("picker.starting")
              : t("picker.startTrack", {
                  track: t(`tracks.${selectedTrack}`),
                })}
          </Button>
        </div>
      </Card>
    </div>
  );
}

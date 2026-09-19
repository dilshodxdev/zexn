import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bot, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import type { NextStep, TopicNode } from "@zexn/shared";
import { Button } from "@/components/ui";
import { useMarkNextStepDone } from "./useStudent";

interface NextStepCardProps {
  nextStep: NextStep | null;
  level: string;
  weakTopics: TopicNode[];
  fallbackTopics: TopicNode[];
  onOpenChat?: () => void;
  onSelectTopic?: (topicId: string) => void;
}

export function NextStepCard({
  nextStep,
  level,
  weakTopics,
  fallbackTopics,
  onOpenChat,
  onSelectTopic,
}: NextStepCardProps) {
  const { t } = useTranslation("student");
  const markDoneMutation = useMarkNextStepDone();
  const [justDone, setJustDone] = useState(false);

  const chips = weakTopics.length > 0 ? weakTopics.slice(0, 3) : fallbackTopics.slice(0, 3);

  async function handleDone() {
    if (!nextStep) return;
    try {
      await markDoneMutation.mutateAsync(nextStep.id);
      setJustDone(true);
      setTimeout(() => setJustDone(false), 2500);
    } catch {
      // Error handled by query or inline
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-alt p-3.5 space-y-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-text">
          <Bot className="h-3.5 w-3.5 text-brand" />
          <span>{t("panel.aiMentor")}</span>
        </div>
        <span className="rounded-full border border-brand/30 bg-surface px-2 py-0.5 text-[9px] font-medium text-brand">
          {level}
        </span>
      </div>

      <p className="text-[11px] text-muted leading-snug">
        {nextStep?.instruction || t("panel.noNextStep")}
      </p>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {chips.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => onSelectTopic?.(topic.id)}
              className="rounded-full border border-line bg-surface hover:bg-surface-alt px-2.5 py-1 text-[10px] text-text transition-colors"
            >
              {topic.title}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onOpenChat}
          className="inline-flex items-center space-x-1 text-[10px] font-medium text-brand hover:underline"
        >
          <Sparkles className="h-3 w-3" />
          <span>{t("panel.proactiveChatLink")}</span>
          <ChevronRight className="h-3 w-3" />
        </button>

        {nextStep && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleDone}
            disabled={markDoneMutation.isPending || justDone}
            icon={justDone ? <CheckCircle2 className="h-3 w-3 text-ok" /> : undefined}
          >
            {justDone ? t("panel.doneSuccess") : t("panel.doneButton")}
          </Button>
        )}
      </div>
    </div>
  );
}

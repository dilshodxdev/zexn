import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  BookOpen,
  LogOut,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { INTERVIEW_ANSWER_MAX, INTERVIEW_CODE_MAX, type InterviewSession } from "@zexn/shared";
import { Badge, Button, Card, ProgressBar, Spinner } from "@/components/ui";
import { CodeEditor } from "@/features/student/CodeEditor";
import { ApiError } from "@/lib/api";
import { useAnswerInterview, useAbandonInterview } from "./useInterview";

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="my-2 overflow-hidden rounded-xl border border-line bg-surface-alt">
      {language ? (
        <div className="border-b border-line px-3 py-1 font-mono text-[10px] text-muted">
          {language}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-3 text-xs leading-5 text-text font-mono">
        <code>{code.replace(/\n$/, "")}</code>
      </pre>
    </div>
  );
}

function MessageText({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) => {
        const code = /^```([^\n`]*)\n?([\s\S]*?)```$/.exec(part);
        return code ? (
          <CodeBlock key={index} language={code[1]?.trim() ?? ""} code={code[2] ?? ""} />
        ) : (
          <Fragment key={index}>
            <span className="whitespace-pre-wrap break-words">{part}</span>
          </Fragment>
        );
      })}
    </>
  );
}

interface InterviewChatProps {
  session: InterviewSession;
}

export function InterviewChat({ session }: InterviewChatProps) {
  const { t } = useTranslation("interview");
  const [inputText, setInputText] = useState("");
  const [codeDraft, setCodeDraft] = useState<string>("");
  const [expandedModelAnswers, setExpandedModelAnswers] = useState<Record<number, boolean>>({});
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const answerMutation = useAnswerInterview(session.id);
  const abandonMutation = useAbandonInterview(session.id);

  const turns = session.turns;
  const currentTurn = turns[turns.length - 1];
  const isAwaitingAnswer = currentTurn && currentTurn.answer === null;
  const isGrading = answerMutation.isPending;

  // Sync starterCode when new code turn appears
  useEffect(() => {
    if (currentTurn && currentTurn.kind === "code" && currentTurn.answer === null) {
      setCodeDraft(currentTurn.starterCode ?? "");
    }
  }, [currentTurn?.index, currentTurn?.kind, currentTurn?.starterCode, currentTurn?.answer]);

  // Auto-scroll on turns change or grading status
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns.length, currentTurn?.answer, isGrading]);

  function toggleModelAnswer(turnIndex: number) {
    setExpandedModelAnswers((prev) => ({
      ...prev,
      [turnIndex]: !prev[turnIndex],
    }));
  }

  async function handleSend() {
    if (!currentTurn || isGrading) return;

    const answerValue = currentTurn.kind === "code" ? codeDraft.trim() : inputText.trim();
    if (!answerValue) return;

    setErrorMessage(null);
    try {
      await answerMutation.mutateAsync({ answer: answerValue });
      setInputText("");
      setCodeDraft("");
    } catch (err: unknown) {
      if (
        (err instanceof ApiError && err.status === 503) ||
        (typeof err === "object" && err !== null && "status" in err && err.status === 503)
      ) {
        setErrorMessage(t("chat.aiUnavailable"));
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(t("chat.aiUnavailable"));
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      void handleSend();
    }
  }

  async function handleAbandon() {
    try {
      await abandonMutation.mutateAsync();
      setShowAbandonConfirm(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  }

  const answeredProgress = Math.min(
    100,
    Math.round((session.answeredCount / session.questionCount) * 100),
  );

  const displayTitle = session.skill
    ? `${t(`tracks.${session.track}`)} (${session.skill.name})`
    : t(`tracks.${session.track}`);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-bg">
      {/* Top Bar: Progress & Abandon */}
      <div className="shrink-0 border-b border-line bg-surface px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-text">
              <span className="truncate">{displayTitle}</span>
              <span className="font-mono text-muted">
                {t("chat.progress", {
                  current: Math.min(
                    session.questionCount,
                    session.answeredCount + (isAwaitingAnswer ? 1 : 0),
                  ),
                  total: session.questionCount,
                })}
              </span>
            </div>
            <ProgressBar value={answeredProgress} tone="brand" size="sm" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] text-muted hover:text-danger shrink-0"
            onClick={() => setShowAbandonConfirm(true)}
            icon={<LogOut className="h-4 w-4" />}
          >
            {t("chat.abandon")}
          </Button>
        </div>
      </div>

      {/* Abandon Confirmation Modal */}
      {showAbandonConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm">
          <Card className="max-w-md border-line bg-surface p-6 shadow-pop space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text">{t("chat.abandonConfirmTitle")}</h3>
              <p className="text-xs text-muted leading-relaxed">{t("chat.abandonConfirmDesc")}</p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="min-h-[44px]"
                onClick={() => setShowAbandonConfirm(false)}
                disabled={abandonMutation.isPending}
              >
                {t("chat.abandonNo")}
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="min-h-[44px]"
                loading={abandonMutation.isPending}
                onClick={() => void handleAbandon()}
              >
                {t("chat.abandonYes")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {turns.map((turn) => (
            <div key={turn.index} className="space-y-4">
              {/* AI Question (Left) */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand text-bg shadow-sm">
                  <span className="font-mono text-sm font-bold">✱</span>
                </div>
                <div className="max-w-[90%] sm:max-w-[80%] rounded-2xl border border-line bg-surface p-4 text-xs sm:text-sm text-text shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand">
                      Q{turn.index}
                    </span>
                    <Badge tone={turn.kind === "code" ? "brand" : "info"} className="gap-1">
                      {turn.kind === "code" ? (
                        <Code2 className="h-3 w-3" />
                      ) : (
                        <BookOpen className="h-3 w-3" />
                      )}
                      <span>{t(`kind.${turn.kind}`)}</span>
                    </Badge>
                    {turn.language && (
                      <Badge tone="neutral" className="font-mono text-[10px]">
                        {turn.language}
                      </Badge>
                    )}
                  </div>
                  <MessageText text={turn.question} />
                </div>
              </div>

              {/* Student Answer (Right, if answered) */}
              {turn.answer && (
                <div className="flex items-start justify-end gap-3">
                  <div className="max-w-[90%] sm:max-w-[80%] rounded-2xl border border-brand/30 bg-surface-alt p-4 text-xs sm:text-sm text-text shadow-sm">
                    {turn.kind === "code" ? (
                      <CodeBlock code={turn.answer} language={turn.language ?? "tsx"} />
                    ) : (
                      <MessageText text={turn.answer} />
                    )}
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-alt text-muted">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              )}

              {/* Evaluation Card (if graded) */}
              {turn.score !== null && (
                <div className="ml-11 max-w-[90%] sm:max-w-[80%]">
                  <Card className="border-line bg-surface-alt/70 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-brand" />
                        <span className="text-xs font-bold text-text">
                          {t("chat.scoreLabel", { score: turn.score })}
                        </span>
                      </div>
                      <Badge tone={turn.score >= 70 ? "ok" : turn.score >= 40 ? "warn" : "danger"}>
                        {turn.score >= 70
                          ? t("chat.gradeGood")
                          : turn.score >= 40
                            ? t("chat.gradeAverage")
                            : t("chat.gradeNeedsWork")}
                      </Badge>
                    </div>

                    {turn.feedback && (
                      <p className="text-xs text-muted leading-relaxed">{turn.feedback}</p>
                    )}

                    {turn.modelAnswer && (
                      <div className="border-t border-line/60 pt-2">
                        <button
                          type="button"
                          onClick={() => toggleModelAnswer(turn.index)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-brand hover:underline"
                        >
                          <span>{t("chat.modelAnswerTitle")}</span>
                          {expandedModelAnswers[turn.index] ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                        {expandedModelAnswers[turn.index] && (
                          <div className="mt-2 rounded-lg border border-line bg-surface p-2.5 text-xs text-text leading-relaxed">
                            {turn.kind === "code" || turn.modelAnswer.includes("```") ? (
                              <MessageText text={turn.modelAnswer} />
                            ) : (
                              <CodeBlock
                                code={turn.modelAnswer}
                                language={turn.language ?? "tsx"}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </div>
          ))}

          {/* AI Evaluating Indicator */}
          {isGrading && (
            <div className="flex items-center gap-3 ml-11 text-xs text-brand animate-pulse">
              <Spinner size="sm" />
              <span>{t("chat.aiEvaluating")}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area (Bottom) */}
      {isAwaitingAnswer && (
        <div className="shrink-0 border-t border-line bg-surface p-3 sm:p-4 pb-safe">
          <div className="mx-auto max-w-4xl space-y-2">
            {errorMessage && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-danger/40 bg-danger-soft/30 p-2.5 text-xs text-danger">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[36px] text-danger underline"
                  onClick={() => void handleSend()}
                >
                  {t("chat.retry")}
                </Button>
              </div>
            )}

            {currentTurn.kind === "code" ? (
              /* Code Editor Input */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-1.5 font-medium text-text">
                    <Code2 className="h-3.5 w-3.5 text-brand" />
                    <span>{t("chat.codeEditorHint")}</span>
                  </div>
                  {currentTurn.language && (
                    <Badge tone="neutral" className="font-mono text-[10px]">
                      {currentTurn.language}
                    </Badge>
                  )}
                </div>

                <div className="rounded-xl border border-line bg-surface-alt overflow-hidden">
                  <CodeEditor
                    language={currentTurn.language ?? "tsx"}
                    value={codeDraft}
                    onChange={(val) => setCodeDraft(val.slice(0, INTERVIEW_CODE_MAX))}
                    height="260px"
                    className="min-h-[220px] sm:min-h-[280px]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[11px] text-muted">
                    {codeDraft.length} / {INTERVIEW_CODE_MAX}
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    className="min-h-[44px]"
                    loading={isGrading}
                    disabled={!codeDraft.trim() || isGrading}
                    onClick={() => void handleSend()}
                    icon={<Code2 className="h-4 w-4" />}
                  >
                    {t("chat.sendCode")}
                  </Button>
                </div>
              </div>
            ) : (
              /* Theory Textarea Input */
              <div className="relative rounded-2xl border border-line bg-surface-alt focus-within:border-brand transition-colors">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.slice(0, INTERVIEW_ANSWER_MAX))}
                  onKeyDown={handleKeyDown}
                  disabled={isGrading}
                  placeholder={t("chat.placeholder")}
                  rows={3}
                  className="w-full resize-none bg-transparent p-3 text-xs sm:text-sm text-text placeholder:text-muted focus:outline-none disabled:opacity-60"
                />

                <div className="flex items-center justify-between border-t border-line/60 px-3 py-2">
                  <span className="font-mono text-[11px] text-muted">
                    {inputText.length} / {INTERVIEW_ANSWER_MAX}
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    className="min-h-[44px]"
                    loading={isGrading}
                    disabled={!inputText.trim() || isGrading}
                    onClick={() => void handleSend()}
                    icon={<Send className="h-4 w-4" />}
                  >
                    {t("chat.send")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

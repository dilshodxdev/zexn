import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { TestDetail } from "@zexn/shared";
import { Button, Card, ErrorState, Spinner } from "@/components/ui";
import { useSubmitTestAttempt, useTestDetail } from "@/features/student/useStudent";
import { ApiError } from "@/lib/api";
import { ROUTES } from "@/routes";

const FALLBACK_TEST_DETAIL: TestDetail = {
  id: "test-react-basics",
  title: "React asoslari diagnostik testi",
  topicId: "top-react-basics",
  questions: [
    {
      id: "q-1",
      text: "React-da komponent nima va uning asosiy vazifasi nimadan iborat?",
      options: [
        { id: "opt-1a", text: "UI ning qayta ishlatiluvchi, mustaqil va izolyatsiyalangan qismi" },
        { id: "opt-1b", text: "Faqat server bilan HTTP so'rovlar almashuvchi modul" },
        { id: "opt-1c", text: "CSS uslublarini HTML ga aylantiruvchi kompilyator" },
      ],
    },
    {
      id: "q-2",
      text: "JSX sintaksisi aslida nimaga aylanadi?",
      options: [
        { id: "opt-2a", text: "React.createElement() funksiya chaqiruvlariga" },
        { id: "opt-2b", text: "To'g'ridan-to'g'ri brauzer DOM nodelariga" },
        { id: "opt-2c", text: "Oddiy matnli HTML faylga" },
      ],
    },
    {
      id: "q-3",
      text: "useState hooki funksional komponentda nima uchun kerak?",
      options: [
        { id: "opt-3a", text: "Komponentning ichki holatini (state) saqlash va boshqarish uchun" },
        { id: "opt-3b", text: "Sahifa URL manzilini o'zgartirish uchun" },
        { id: "opt-3c", text: "Faqat backend ma'lumotlarini keshlash uchun" },
      ],
    },
  ],
};

export function TestRunScreen() {
  const { t } = useTranslation("student");
  const { testId = "" } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const { data: serverTest, isLoading, isError, refetch } = useTestDetail(testId);
  const submitMutation = useSubmitTestAttempt(testId);

  const test = serverTest || FALLBACK_TEST_DETAIL;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (isLoading && !serverTest) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError && !test) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          message="Test savollarini yuklashda xatolik yuz berdi"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const currentQ = test.questions[currentIndex];
  const isLast = currentIndex === test.questions.length - 1;
  const isAllAnswered = test.questions.every((q) => Boolean(answers[q.id]));
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;

  function selectOption(optionId: string) {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));
  }

  async function handleSubmit() {
    if (!isAllAnswered || submitMutation.isPending) return;

    const formattedAnswers = Object.entries(answers).map(([questionId, optionId]) => ({
      questionId,
      optionId,
    }));

    try {
      const result = await submitMutation.mutateAsync({ answers: formattedAnswers });
      navigate(ROUTES.studentAttemptResult(result.attemptId), { state: { result } });
    } catch {
      // Server xatoligida javoblar saqlanib qoladi va ErrorState ko'rsatiladi
    }
  }

  const progressPercent = Math.round(((currentIndex + 1) / test.questions.length) * 100);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header with progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-semibold text-text">{test.title}</span>
            <span className="font-mono font-bold text-brand">
              {t("tests.questionNumber", {
                current: currentIndex + 1,
                total: test.questions.length,
              })}
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden border border-line">
            <div
              className="h-1.5 rounded-full bg-brand transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQ && (
          <Card className="border-line bg-surface p-6 shadow-pop space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-text leading-snug">
              {currentQ.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = currentAnswer === opt.id;
                const letter = String.fromCharCode(65 + idx); // A, B, C...
                return (
                  <div
                    key={opt.id}
                    onClick={() => selectOption(opt.id)}
                    className={`flex cursor-pointer items-center space-x-3 rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "border-brand bg-brand-soft shadow-sm"
                        : "border-line bg-surface-alt hover:border-brand/40"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold border transition-colors ${
                        isSelected
                          ? "border-brand bg-brand text-bg"
                          : "border-line bg-surface text-muted"
                      }`}
                    >
                      {letter}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-text leading-relaxed">
                      {opt.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {submitMutation.isError && (
          <ErrorState
            message={
              submitMutation.error instanceof ApiError
                ? submitMutation.error.message
                : (submitMutation.error as Error)?.message || t("tests.submitError")
            }
            onRetry={handleSubmit}
          />
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0 || submitMutation.isPending}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Orqaga
          </Button>

          {isLast ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!isAllAnswered || submitMutation.isPending}
              icon={<CheckCircle2 className="h-4 w-4" />}
            >
              {submitMutation.isPending ? (
                <Spinner size="sm" />
              ) : submitMutation.isError ? (
                t("tests.resubmit")
              ) : (
                t("tests.submit")
              )}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                setCurrentIndex((prev) => Math.min(test.questions.length - 1, prev + 1))
              }
              disabled={!currentAnswer}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              {t("tests.next")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Eraser, Send } from "lucide-react";
import type { MentorMessage } from "@zexn/shared";
import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { clearCodeDraft, loadCodeDraft, saveCodeDraft } from "./codeDraft";
import { CodeEditor, type CodeLanguage } from "./CodeEditor";
import { useSendMentorMessage } from "./useMentor";

interface CodePanelProps {
  onSent: (student: MentorMessage, mentor: MentorMessage) => void;
  onOpenChat: () => void;
}

export default function CodePanel({ onSent, onOpenChat }: CodePanelProps) {
  const { t } = useTranslation("student");
  const [language, setLanguage] = useState<CodeLanguage>("tsx");
  const [code, setCode] = useState(loadCodeDraft);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toolbarTarget, setToolbarTarget] = useState<HTMLElement | null>(null);
  const sendMutation = useSendMentorMessage();

  const languageOptions = [
    { value: "tsx", label: t("code.languages.tsx") },
    { value: "javascript", label: t("code.languages.javascript") },
    { value: "typescript", label: t("code.languages.typescript") },
    { value: "html", label: t("code.languages.html") },
    { value: "css", label: t("code.languages.css") },
  ];

  useEffect(() => {
    setToolbarTarget(document.getElementById("mentor-code-toolbar"));
  }, []);

  function handleCodeChange(value: string) {
    setCode(value);
    saveCodeDraft(value);
    if (value.trim()) setError(null);
  }

  function handleClear() {
    setCode("");
    setQuestion("");
    setError(null);
    clearCodeDraft();
  }

  async function handleSend() {
    const trimmed = code.trim();
    if (!trimmed || sendMutation.isPending) {
      if (!trimmed) setError(t("code.emptyError"));
      return;
    }
    setError(null);
    const message = `\`\`\`${language}\n${trimmed}\n\`\`\`${question.trim() ? `\n${question.trim()}` : ""}`;
    try {
      const result = await sendMutation.mutateAsync({ text: message });
      onSent(result.student, result.mentor);
      setQuestion("");
      onOpenChat();
    } catch (caught: unknown) {
      setError(
        caught instanceof ApiError && caught.status === 429
          ? t("mentor.rateLimitWait")
          : t("code.sendError"),
      );
    }
  }

  return (
    <div className="flex min-h-[40vh] flex-1 flex-col gap-1.5 overflow-hidden p-1.5 md:p-2">
      {toolbarTarget
        ? createPortal(
            <div className="flex w-full flex-wrap items-center justify-end gap-1.5">
              <select
                aria-label={t("code.language")}
                title={t("code.language")}
                value={language}
                onChange={(event) => setLanguage(event.target.value as CodeLanguage)}
                className="h-11 min-w-24 rounded-md border border-line bg-surface-alt px-2 text-xs text-text outline-none focus:border-brand md:h-8"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                aria-label={t("code.questionLabel")}
                placeholder={t("code.questionPlaceholder")}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                disabled={sendMutation.isPending}
                className="h-11 min-w-40 flex-1 rounded-md border border-line bg-surface-alt px-2 text-xs text-text placeholder:text-muted outline-none focus:border-brand md:h-8 md:max-w-72"
              />
              <Button
                size="sm"
                variant="secondary"
                className="min-h-11 md:min-h-8"
                icon={<Eraser className="h-4 w-4" />}
                onClick={handleClear}
              >
                {t("code.clear")}
              </Button>
              <Button
                size="sm"
                className="min-h-11 flex-1 md:min-h-8 md:flex-none"
                icon={<Send className="h-4 w-4" />}
                loading={sendMutation.isPending}
                disabled={!code.trim()}
                onClick={() => void handleSend()}
              >
                {t("code.sendToMentor")}
              </Button>
            </div>,
            toolbarTarget,
          )
        : null}

      <CodeEditor language={language} value={code} onChange={handleCodeChange} />
      {error ? <p className="px-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

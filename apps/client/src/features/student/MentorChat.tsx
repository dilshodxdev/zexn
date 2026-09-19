import { Fragment, lazy, Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bot, Code2, MessageSquare, Send, Sparkles, Trash2, User } from "lucide-react";
import type { MentorMessage } from "@zexn/shared";
import { Spinner } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useMentorMessages, useSendMentorMessage } from "./useMentor";

const CodePanel = lazy(() => import("./CodePanel"));

function CodeBlock({ code, language }: { code: string; language: string }) {
  const { t } = useTranslation("student");
  const [expanded, setExpanded] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");
  const isLong = lines.length > 20;
  const shown = isLong && !expanded ? lines.slice(0, 20) : lines;

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-line bg-surface-alt">
      {language ? (
        <div className="border-b border-line px-3 py-1 font-mono text-[10px] text-muted">
          {language}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-3 text-xs leading-5 text-text">
        <code>{shown.join("\n")}</code>
      </pre>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="min-h-11 w-full border-t border-line px-3 text-left text-xs font-semibold text-brand"
        >
          {expanded ? t("code.showLess") : t("code.showMore")}
        </button>
      ) : null}
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

interface MentorChatProps {
  onSelectTopic?: (topicId: string) => void;
}

export function MentorChat({ onSelectTopic: _onSelectTopic }: MentorChatProps) {
  const { t } = useTranslation("student");
  const [activeTab, setActiveTab] = useState<"chat" | "code">("chat");
  const [inputText, setInputText] = useState("");
  const [localMessages, setLocalMessages] = useState<MentorMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: serverMessages, isLoading } = useMentorMessages();
  const sendMutation = useSendMentorMessage();

  // Initialize local messages from server
  useEffect(() => {
    if (serverMessages && serverMessages.length > 0 && localMessages.length === 0) {
      setLocalMessages(serverMessages);
    }
  }, [serverMessages, localMessages.length]);

  // Fallback initial greeting if server returned empty messages
  useEffect(() => {
    if (!isLoading && localMessages.length === 0) {
      setLocalMessages([
        {
          id: "welcome-1",
          role: "mentor",
          text: "Qani, mentor, oxirgi darsdan davom etaylik - qaysi qism qiyinroq tuyuldi?",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [isLoading, localMessages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || sendMutation.isPending) return;

    const optimisticMsg: MentorMessage = {
      id: "opt-" + Date.now(),
      role: "student",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");

    try {
      const res = await sendMutation.mutateAsync({ text: trimmed });
      setLocalMessages((prev) => [...prev, res.mentor]);
    } catch (err: unknown) {
      const is429 = err instanceof ApiError && err.status === 429;

      const replyText = is429 ? t("mentor.rateLimitWait") : t("mentor.sendError");
      const errorMsg: MentorMessage = {
        id: "err-" + Date.now(),
        role: "mentor",
        text: replyText,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, errorMsg]);
    }
  }

  function handleClear() {
    setLocalMessages([]);
  }

  function handleCodeSent(student: MentorMessage, mentor: MentorMessage) {
    setLocalMessages((messages) => [...messages, student, mentor]);
  }

  function formatHHMM(iso: string): string {
    try {
      return new Intl.DateTimeFormat("uz-UZ", {
        timeZone: "Asia/Tashkent",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return "";
    }
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      {/* Top Bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface px-4">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface-alt text-brand">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-text">{t("mentor.title")}</div>
            <div className="text-[10px] text-muted">{t("mentor.subtitle")}</div>
          </div>
        </div>

        {/* Tab pills */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center rounded-full border border-line bg-bg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1 font-semibold transition-all ${
                activeTab === "chat" ? "bg-brand text-bg shadow-sm" : "text-muted hover:text-text"
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              <span>{t("mentor.tabChat")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono transition-all ${
                activeTab === "code"
                  ? "bg-brand text-bg shadow-sm font-semibold"
                  : "text-muted hover:text-text"
              }`}
            >
              <Code2 className="h-3 w-3" />
              <span>{t("mentor.tabCode")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb subheader */}
      <div
        className={`flex shrink-0 items-center justify-between gap-2 border-b border-line bg-bg px-3 text-xs text-muted md:px-4 ${
          activeTab === "code" ? "min-h-11 flex-wrap py-1" : "h-8"
        }`}
      >
        <div className="flex items-center space-x-2">
          <span className="hover:text-text cursor-pointer">{t("mentor.breadcrumbCourse")}</span>
          <span className="text-muted">/</span>
          <span className="flex items-center gap-1.5 rounded-full border border-brand/30 bg-surface-alt px-2.5 py-0.5 text-[11px] font-medium text-brand">
            {t("mentor.breadcrumbMentor")}
            <span className="h-1.5 w-1.5 rounded-full bg-brand inline-block" />
          </span>
        </div>
        {activeTab === "code" ? (
          <div id="mentor-code-toolbar" className="flex min-w-0 flex-1 items-center" />
        ) : (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center space-x-1.5 text-xs text-muted hover:text-text transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t("mentor.clearChat")}</span>
          </button>
        )}
      </div>

      {/* Center content */}
      {activeTab === "code" ? (
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Spinner size="md" />
            </div>
          }
        >
          <CodePanel onSent={handleCodeSent} onOpenChat={() => setActiveTab("chat")} />
        </Suspense>
      ) : (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading && localMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : localMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              {t("mentor.empty")}
            </div>
          ) : (
            localMessages.map((msg) => {
              const isMentor = msg.role === "mentor";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 max-w-2xl ${
                    isMentor ? "" : "ml-auto flex-row-reverse space-x-reverse"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border mt-0.5 ${
                      isMentor
                        ? "border-line bg-surface-alt text-brand"
                        : "border-brand/30 bg-brand text-bg font-bold"
                    }`}
                  >
                    {isMentor ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div>
                    <div
                      className={`flex items-center space-x-2 text-[11px] mb-1.5 ${
                        isMentor ? "" : "justify-end"
                      }`}
                    >
                      <span className="font-semibold text-text">
                        {isMentor ? t("mentor.title") : t("mentor.you")}
                      </span>
                      <span className="font-mono text-[10px] text-muted">
                        {formatHHMM(msg.createdAt)}
                      </span>
                    </div>

                    <div
                      className={`text-xs p-4 leading-relaxed shadow-sm ${
                        isMentor
                          ? "rounded-3xl rounded-tl-sm border border-line bg-surface-alt text-text"
                          : "rounded-3xl rounded-tr-sm border border-brand/30 bg-brand-soft text-text"
                      }`}
                    >
                      <MessageText text={msg.text} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input area */}
      {activeTab === "chat" ? (
        <div className="border-t border-line bg-surface p-4">
          <form
            onSubmit={handleSend}
            className="relative flex items-center rounded-full border border-line bg-surface-alt p-1.5 pl-4 shadow-inner focus-within:border-brand/40"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sendMutation.isPending}
              placeholder={t("mentor.inputPlaceholder")}
              className="flex-1 bg-transparent border-0 px-2 text-xs text-text placeholder:text-muted focus:outline-none disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sendMutation.isPending}
              aria-label={t("mentor.send")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-bg font-bold shadow transition-all hover:bg-brand-hover disabled:opacity-40"
            >
              {sendMutation.isPending ? <Spinner size="sm" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}

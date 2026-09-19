import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import type { InterviewLanguage } from "@zexn/shared";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

export type CodeLanguage =
  | "tsx"
  | "javascript"
  | "typescript"
  | "html"
  | "css"
  | "python"
  | "sql"
  | "dart"
  | "kotlin"
  | "java"
  | "swift"
  | InterviewLanguage;

interface CodeEditorProps {
  language: CodeLanguage;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  height?: string | number;
}

function readTheme(): "vs" | "vs-dark" {
  return document.documentElement.getAttribute("data-theme") === "light" ? "vs" : "vs-dark";
}

export function CodeEditor({ language, value, onChange, className, height }: CodeEditorProps) {
  const [theme, setTheme] = useState<"vs" | "vs-dark">(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "h-full min-h-[40vh] flex-1 overflow-hidden rounded-xl border border-line bg-surface-alt",
        className,
      )}
    >
      <Editor
        height={height}
        language={language}
        value={value}
        theme={theme}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        loading={
          <div className="flex h-full items-center justify-center">
            <Spinner size="md" />
          </div>
        }
        options={{
          automaticLayout: true,
          fontSize: 13,
          minimap: { enabled: false },
          wordWrap: "on",
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}

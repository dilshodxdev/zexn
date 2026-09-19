import { useTranslation } from "react-i18next";
import { BrainCircuit, Sparkles } from "lucide-react";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { ClassInsights } from "@/features/digital-twin/ClassInsights";
import { ClassStudentsTable } from "@/features/digital-twin/ClassStudentsTable";
import { useClassDigitalTwin } from "@/features/digital-twin/useDigitalTwin";

export function ClassTwinScreen() {
  const { t } = useTranslation("twin");
  const { data, isLoading, isError, error, refetch } = useClassDigitalTwin();

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
          message={error instanceof Error ? error.message : t("class.errorLoad")}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (data.students.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          title={t("class.empty")}
          description={t("class.emptyDescription")}
          icon={<BrainCircuit className="h-7 w-7 text-brand" />}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-5 lg:p-7">
      <main className="mx-auto max-w-7xl rounded-[2.25rem] border border-line bg-surface p-4 shadow-pop sm:p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand">
              <Sparkles className="h-4 w-4" />
              <span>{t("class.eyebrow")}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">
              {t("class.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">{t("class.subtitle")}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-bg shadow-card">
            <BrainCircuit className="h-7 w-7" />
          </div>
        </header>

        <div className="space-y-5">
          <ClassInsights data={data} />
          <ClassStudentsTable students={data.students} />
        </div>
      </main>
    </div>
  );
}

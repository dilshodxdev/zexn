import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui";
import { AiPromptForm } from "@/features/settings/AiPromptForm";

export function SuperAdminSettingsScreen() {
  const { t } = useTranslation("settings");

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title={t("platformTitle")} subtitle={t("platformSubtitle")} />
        <AiPromptForm scope="platform" />
      </div>
    </div>
  );
}

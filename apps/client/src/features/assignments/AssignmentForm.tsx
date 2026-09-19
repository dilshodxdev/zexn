import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, X } from "lucide-react";
import {
  createAssignmentBodySchema,
  type AssignmentDifficulty,
  type AssignmentManageItem,
  type AssignmentTopic,
  type CreateAssignmentBody,
} from "@zexn/shared";
import { Button, Card, Spinner } from "@/components/ui";

interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AssignmentManageItem | null;
  topics: AssignmentTopic[];
  onSubmit: (data: CreateAssignmentBody & { isActive?: boolean }) => Promise<void>;
  isPending: boolean;
}

export function AssignmentForm({
  isOpen,
  onClose,
  initialData,
  topics,
  onSubmit,
  isPending,
}: AssignmentFormProps) {
  const { t } = useTranslation("assignments");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topicId, setTopicId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<AssignmentDifficulty>("EASY");
  const [dueAt, setDueAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [resources, setResources] = useState<Array<{ title: string; url: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setTopicId(initialData.topic?.id || "");
      setDifficulty(initialData.difficulty);
      try {
        const d = new Date(initialData.dueAt);
        // Format to YYYY-MM-DDThh:mm for datetime-local
        const pad = (n: number) => n.toString().padStart(2, "0");
        const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDueAt(localIso);
      } catch {
        setDueAt("");
      }
      setIsActive(initialData.isActive);
      setResources(initialData.resources || []);
    } else {
      setTitle("");
      setDescription("");
      setTopicId("");
      setDifficulty("EASY");
      // Default dueAt: 7 days from now
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T23:59`;
      setDueAt(localIso);
      setIsActive(true);
      setResources([]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  function handleAddResource() {
    if (resources.length >= 10) return;
    setResources((prev) => [...prev, { title: "", url: "" }]);
  }

  function handleRemoveResource(index: number) {
    setResources((prev) => prev.filter((_, idx) => idx !== index));
  }

  function handleResourceChange(index: number, field: "title" | "url", value: string) {
    setResources((prev) =>
      prev.map((res, idx) => (idx === index ? { ...res, [field]: value } : res)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // Convert local datetime to full ISO 8601 string
    let isoDueAt = "";
    if (dueAt) {
      try {
        isoDueAt = new Date(dueAt).toISOString();
      } catch {
        isoDueAt = "";
      }
    }

    const payload = {
      title,
      description,
      topicId: topicId ? topicId : null,
      difficulty,
      dueAt: isoDueAt,
      resources: resources.filter((r) => r.title.trim() && r.url.trim()),
    };

    const parsed = createAssignmentBodySchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    await onSubmit({ ...parsed.data, isActive });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-xs p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-line bg-surface p-6 shadow-pop my-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h2 className="text-base sm:text-lg font-bold text-text">
            {initialData ? t("manage.editAssignment") : t("manage.newAssignment")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted hover:bg-surface-alt hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              {t("manage.formTitle")} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("manage.formTitlePlaceholder")}
              className="w-full rounded-xl border border-line bg-surface-alt px-3.5 py-2 text-xs sm:text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none"
            />
            {errors.title && <p className="mt-1 text-xs text-danger">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              {t("manage.formDescription")} *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={t("manage.formDescriptionPlaceholder")}
              className="w-full rounded-xl border border-line bg-surface-alt px-3.5 py-2 text-xs sm:text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none"
            />
            {errors.description && <p className="mt-1 text-xs text-danger">{errors.description}</p>}
          </div>

          {/* Grid: Topic, Difficulty, Due Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                {t("manage.formTopic")}
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface-alt px-3 py-2 text-xs sm:text-sm text-text focus:border-brand focus:outline-none"
              >
                <option value="">{t("manage.formTopicNone")}</option>
                {topics.map((top) => (
                  <option key={top.id} value={top.id}>
                    {top.order}. {top.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                {t("manage.formDifficulty")} *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as AssignmentDifficulty)}
                className="w-full rounded-xl border border-line bg-surface-alt px-3 py-2 text-xs sm:text-sm text-text focus:border-brand focus:outline-none"
              >
                <option value="EASY">{t("difficulty.EASY")}</option>
                <option value="MEDIUM">{t("difficulty.MEDIUM")}</option>
                <option value="HARD">{t("difficulty.HARD")}</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                {t("manage.formDueAt")} *
              </label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface-alt px-3 py-1.5 text-xs sm:text-sm text-text focus:border-brand focus:outline-none"
              />
              {errors.dueAt && <p className="mt-1 text-xs text-danger">{errors.dueAt}</p>}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text">
                {t("manage.formResources")} ({resources.length}/10)
              </label>
              {resources.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddResource}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("manage.formAddResource")}
                </button>
              )}
            </div>

            {resources.map((res, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={res.title}
                  onChange={(e) => handleResourceChange(idx, "title", e.target.value)}
                  placeholder={t("manage.formResourceTitle")}
                  className="flex-1 rounded-xl border border-line bg-surface-alt px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-brand focus:outline-none"
                />
                <input
                  type="url"
                  value={res.url}
                  onChange={(e) => handleResourceChange(idx, "url", e.target.value)}
                  placeholder={t("manage.formResourceUrl")}
                  className="flex-1 rounded-xl border border-line bg-surface-alt px-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-brand focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveResource(idx)}
                  className="p-1.5 text-muted hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* If Editing: isActive checkbox */}
          {initialData && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveCheckbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded accent-brand"
              />
              <label
                htmlFor="isActiveCheckbox"
                className="text-xs font-medium text-text cursor-pointer"
              >
                {t("manage.formIsActive")}
              </label>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <Button variant="ghost" size="md" type="button" onClick={onClose} disabled={isPending}>
              {t("manage.formCancel")}
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isPending}
              icon={isPending ? <Spinner size="sm" /> : undefined}
            >
              {initialData ? t("manage.formSave") : t("manage.formCreate")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

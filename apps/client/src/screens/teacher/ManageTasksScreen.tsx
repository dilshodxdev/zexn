import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Edit2, Eye, Plus } from "lucide-react";
import type { AssignmentManageItem, CreateAssignmentBody } from "@zexn/shared";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  ProgressBar,
  Spinner,
} from "@/components/ui";
import { AssignmentForm } from "@/features/assignments/AssignmentForm";
import { DifficultyBadge } from "@/features/assignments/DifficultyBadge";
import { DueLabel } from "@/features/assignments/DueLabel";
import {
  useAssignmentTopics,
  useCreateAssignment,
  useManageAssignments,
  useUpdateAssignment,
} from "@/features/assignments/useAssignments";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

export function ManageTasksScreen() {
  const { t } = useTranslation("assignments");
  const navigate = useNavigate();
  const { currentMembership } = useAuthStore();

  const isCenterAdmin = currentMembership?.role === "CENTER_ADMIN";

  const { data: assignments, isLoading, isError, refetch } = useManageAssignments();
  const { data: topics = [] } = useAssignmentTopics();

  const createMutation = useCreateAssignment();
  const [editingAssignment, setEditingAssignment] = useState<AssignmentManageItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const updateMutation = useUpdateAssignment(editingAssignment?.id || "");

  function handleOpenCreate() {
    setEditingAssignment(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(assignment: AssignmentManageItem, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  }

  async function handleFormSubmit(data: CreateAssignmentBody & { isActive?: boolean }) {
    if (editingAssignment) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
  }

  function getDetailRoute(id: string) {
    return isCenterAdmin ? ROUTES.adminTask(id) : ROUTES.teacherTask(id);
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title={t("manage.title")}
          subtitle={t("manage.subtitle")}
          actions={
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              icon={<Plus className="h-4 w-4" />}
            >
              {t("manage.newAssignment")}
            </Button>
          }
        />

        {/* List / States */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : isError ? (
          <div className="py-12">
            <ErrorState message={t("error.load")} onRetry={() => void refetch()} />
          </div>
        ) : !assignments || assignments.length === 0 ? (
          <EmptyState title={t("empty.title")} description={t("empty.description")} />
        ) : (
          <div className="space-y-3">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-surface-alt text-muted uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Vazifa</th>
                    <th className="py-3 px-4">Mavzu</th>
                    <th className="py-3 px-4">Qiyinlik</th>
                    <th className="py-3 px-4">Muddat</th>
                    <th className="py-3 px-4">Tekshirish</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line font-medium text-text">
                  {assignments.map((item) => {
                    const donePercent =
                      item.studentCount > 0
                        ? Math.round((item.doneCount / item.studentCount) * 100)
                        : 0;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => navigate(getDetailRoute(item.id))}
                        className="cursor-pointer hover:bg-surface-alt transition-colors"
                      >
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text truncate">{item.title}</span>
                            {!item.isActive && (
                              <Badge tone="neutral" className="text-[10px]">
                                {t("manage.closed")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted line-clamp-1">{item.description}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          {item.topic ? (
                            <Badge tone="neutral" className="text-[11px]">
                              {item.topic.title}
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <DifficultyBadge difficulty={item.difficulty} />
                        </td>

                        <td className="py-3.5 px-4">
                          <DueLabel dueAt={item.dueAt} />
                        </td>

                        <td className="py-3.5 px-4">
                          {item.submittedCount > 0 ? (
                            <Badge tone="warn" className="text-[11px] font-bold">
                              {t("manage.awaitingReview", { count: item.submittedCount })}
                            </Badge>
                          ) : (
                            <span className="text-muted text-[11px]">0</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between text-[10px] text-muted">
                              <span>
                                {t("manage.studentsProgress", {
                                  done: item.doneCount,
                                  total: item.studentCount,
                                })}
                              </span>
                              <span>{donePercent}%</span>
                            </div>
                            <ProgressBar value={donePercent} tone="brand" size="sm" />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleOpenEdit(item, e)}
                              icon={<Edit2 className="h-3.5 w-3.5" />}
                            >
                              {t("manage.editAssignment")}
                            </Button>
                            <Link to={getDetailRoute(item.id)} onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={<Eye className="h-3.5 w-3.5" />}
                              >
                                Ko'rish
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {assignments.map((item) => {
                const donePercent =
                  item.studentCount > 0
                    ? Math.round((item.doneCount / item.studentCount) * 100)
                    : 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(getDetailRoute(item.id))}
                    className="rounded-card p-4 border border-line bg-surface space-y-3 cursor-pointer hover:border-brand/40 shadow-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text">{item.title}</h3>
                          {!item.isActive && (
                            <Badge tone="neutral" className="text-[9px]">
                              {t("manage.closed")}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted line-clamp-1">{item.description}</p>
                      </div>
                      <DifficultyBadge difficulty={item.difficulty} />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {item.topic && <Badge tone="neutral">{item.topic.title}</Badge>}
                      {item.submittedCount > 0 && (
                        <Badge tone="warn" className="font-bold">
                          {t("manage.awaitingReview", { count: item.submittedCount })}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 pt-1 border-t border-line">
                      <div className="flex justify-between text-[11px] text-muted">
                        <span>
                          {t("manage.studentsProgress", {
                            done: item.doneCount,
                            total: item.studentCount,
                          })}
                        </span>
                        <span>{donePercent}%</span>
                      </div>
                      <ProgressBar value={donePercent} tone="brand" size="sm" />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-line">
                      <DueLabel dueAt={item.dueAt} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleOpenEdit(item, e)}
                        icon={<Edit2 className="h-3.5 w-3.5" />}
                      >
                        {t("manage.editAssignment")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assignment Form Dialog */}
        <AssignmentForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          initialData={editingAssignment}
          topics={topics}
          onSubmit={handleFormSubmit}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
}

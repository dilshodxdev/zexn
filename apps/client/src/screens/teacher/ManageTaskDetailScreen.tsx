import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Edit2, ExternalLink } from "lucide-react";
import type { CreateAssignmentBody } from "@zexn/shared";
import { Badge, Button, Card, ErrorState, PageHeader, Spinner } from "@/components/ui";
import { AssignmentForm } from "@/features/assignments/AssignmentForm";
import { DifficultyBadge } from "@/features/assignments/DifficultyBadge";
import { DueLabel } from "@/features/assignments/DueLabel";
import { ReviewPanel } from "@/features/assignments/ReviewPanel";
import { SubmissionsTable } from "@/features/assignments/SubmissionsTable";
import {
  useAssignmentTopics,
  useManageAssignmentDetail,
  useUpdateAssignment,
} from "@/features/assignments/useAssignments";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

export function ManageTaskDetailScreen() {
  const { t } = useTranslation("assignments");
  const { assignmentId = "" } = useParams<{ assignmentId: string }>();
  const { currentMembership } = useAuthStore();

  const isCenterAdmin = currentMembership?.role === "CENTER_ADMIN";
  const backPath = isCenterAdmin ? ROUTES.adminTasks : ROUTES.teacherTasks;

  const { data: detail, isLoading, isError, refetch } = useManageAssignmentDetail(assignmentId);

  const { data: topics = [] } = useAssignmentTopics();
  const updateMutation = useUpdateAssignment(assignmentId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState message={t("error.detail")} onRetry={() => void refetch()} />
      </div>
    );
  }

  const { assignment, submissions } = detail;

  async function handleFormSubmit(data: CreateAssignmentBody & { isActive?: boolean }) {
    await updateMutation.mutateAsync(data);
    setIsFormOpen(false);
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page Header */}
        <PageHeader
          title={assignment.title}
          subtitle={assignment.topic?.title}
          actions={
            <Link to={backPath}>
              <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
                Vazifalarga qaytish
              </Button>
            </Link>
          }
        />

        {/* Assignment Info Card */}
        <Card className="border-line bg-surface p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-line pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <DifficultyBadge difficulty={assignment.difficulty} />
              <DueLabel dueAt={assignment.dueAt} />
              {assignment.isActive ? (
                <Badge tone="ok" className="text-[10px]">
                  {t("manage.active")}
                </Badge>
              ) : (
                <Badge tone="neutral" className="text-[10px]">
                  {t("manage.closed")}
                </Badge>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFormOpen(true)}
              icon={<Edit2 className="h-3.5 w-3.5" />}
            >
              {t("manage.editAssignment")}
            </Button>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              {t("detail.description")}
            </h3>
            <p className="text-xs sm:text-sm text-text leading-relaxed whitespace-pre-line">
              {assignment.description}
            </p>
          </div>

          {/* Resources */}
          {assignment.resources.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-line">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                {t("detail.materialsTitle")}
              </h4>
              <div className="flex flex-col gap-1.5">
                {assignment.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand hover:underline"
                  >
                    <span>{res.title}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Submissions List */}
        <SubmissionsTable
          submissions={submissions}
          onSelectStudent={(id) => setSelectedStudentId(id)}
          selectedStudentId={selectedStudentId}
        />

        {/* Edit Form Dialog */}
        <AssignmentForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          initialData={assignment}
          topics={topics}
          onSubmit={handleFormSubmit}
          isPending={updateMutation.isPending}
        />

        {/* Review Side Panel */}
        <ReviewPanel
          assignmentId={assignmentId}
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      </div>
    </div>
  );
}

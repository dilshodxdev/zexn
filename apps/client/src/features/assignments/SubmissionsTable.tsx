import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";
import type { SubmissionRow } from "@zexn/shared";
import { EmptyState, ProgressBar } from "@/components/ui";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

interface SubmissionsTableProps {
  submissions: SubmissionRow[];
  onSelectStudent: (studentId: string) => void;
  selectedStudentId?: string | null;
}

export function SubmissionsTable({
  submissions,
  onSelectStudent,
  selectedStudentId,
}: SubmissionsTableProps) {
  const { t } = useTranslation("assignments");
  const { currentMembership } = useAuthStore();

  const isCenterAdmin = currentMembership?.role === "CENTER_ADMIN";
  const twinUrl = (studentId: string) =>
    isCenterAdmin ? ROUTES.adminStudentTwin(studentId) : ROUTES.teacherStudentTwin(studentId);

  if (submissions.length === 0) {
    return <EmptyState title={t("manage.noSubmissions")} />;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-text">{t("manage.submissionsTitle")}</h3>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-surface-alt text-muted uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">{t("manage.colStudent")}</th>
              <th className="py-3 px-4">{t("manage.colStatus")}</th>
              <th className="py-3 px-4">{t("manage.colProgress")}</th>
              <th className="py-3 px-4">{t("manage.colScore")}</th>
              <th className="py-3 px-4">{t("manage.colSubmittedAt")}</th>
              <th className="py-3 px-4 text-right">{t("manage.digitalTwin")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line font-medium text-text">
            {submissions.map((sub) => {
              const isSelected = selectedStudentId === sub.studentId;
              const isSubmitted = sub.status === "SUBMITTED";

              return (
                <tr
                  key={sub.studentId}
                  onClick={() => onSelectStudent(sub.studentId)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-brand-soft/30"
                      : isSubmitted
                        ? "bg-warn-soft/10 hover:bg-surface-alt"
                        : "hover:bg-surface-alt"
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-text">{sub.fullName}</div>
                    <div className="text-[11px] text-muted font-mono">@{sub.login}</div>
                  </td>
                  <td className="py-3 px-4">
                    <SubmissionStatusBadge status={sub.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-24 space-y-1">
                      <div className="text-[10px] font-mono text-muted">{sub.progress}%</div>
                      <ProgressBar value={sub.progress} size="sm" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {sub.score !== null ? (
                      <span className="font-mono font-bold text-ok">{sub.score} ball</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted">
                    {sub.submittedAt ? formatDateTime(sub.submittedAt) : "-"}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Link
                      to={twinUrl(sub.studentId)}
                      title={t("manage.digitalTwinFull")}
                      aria-label={t("manage.digitalTwinFull")}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-line bg-surface-alt text-muted hover:text-brand hover:border-brand/40 transition-colors"
                    >
                      <Activity className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {submissions.map((sub) => {
          const isSelected = selectedStudentId === sub.studentId;
          return (
            <div
              key={sub.studentId}
              onClick={() => onSelectStudent(sub.studentId)}
              className={`rounded-card p-3.5 border transition-all cursor-pointer ${
                isSelected ? "border-brand bg-brand-soft/20" : "border-line bg-surface shadow-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text">{sub.fullName}</h4>
                  <span className="text-[11px] text-muted font-mono">@{sub.login}</span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={twinUrl(sub.studentId)}
                    title={t("manage.digitalTwinFull")}
                    aria-label={t("manage.digitalTwinFull")}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-line bg-surface-alt text-muted hover:text-brand hover:border-brand/40 transition-colors"
                  >
                    <Activity className="h-4 w-4" />
                  </Link>
                  <SubmissionStatusBadge status={sub.status} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-line">
                <div className="flex items-center gap-2">
                  <span className="text-muted">{t("manage.colProgress")}:</span>
                  <span className="font-mono font-bold text-text">{sub.progress}%</span>
                </div>
                <div>
                  {sub.score !== null ? (
                    <span className="font-mono font-bold text-ok">{sub.score} ball</span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

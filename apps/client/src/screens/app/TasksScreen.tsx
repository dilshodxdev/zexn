import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import {
  AssignmentFilters,
  type SortOptionType,
  type StatusFilterType,
} from "@/features/assignments/AssignmentFilters";
import { AssignmentRow } from "@/features/assignments/AssignmentRow";
import { AssignmentStatsRow } from "@/features/assignments/AssignmentStatsRow";
import { useStudentAssignments } from "@/features/assignments/useAssignments";
import { useStudentOverview } from "@/features/student/useStudent";

export function TasksScreen() {
  const { t } = useTranslation("assignments");

  const { data, isLoading, isError, refetch } = useStudentAssignments();
  const { data: overview } = useStudentOverview();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");
  const [sortBy, setSortBy] = useState<SortOptionType>("due_asc");

  const items = data?.items || [];
  const streakDays = data?.streakDays || 0;

  // Counts for tabs
  const counts = useMemo(() => {
    const c = {
      ALL: items.length,
      NEW: 0,
      IN_PROGRESS: 0,
      SUBMITTED: 0,
      DONE: 0,
    };
    for (const item of items) {
      if (item.status === "NEW") c.NEW++;
      else if (item.status === "IN_PROGRESS") c.IN_PROGRESS++;
      else if (item.status === "SUBMITTED") c.SUBMITTED++;
      else if (item.status === "DONE") c.DONE++;
    }
    return c;
  }, [items]);

  // Subtitle course & topic
  const currentTopic = overview?.course.topics.find(
    (tp) => tp.status === "current" || tp.status === "weak",
  );
  const courseTitle = overview?.course.title;
  const courseTopicPath =
    courseTitle && currentTopic ? `${courseTitle} / ${currentTopic.title}` : courseTitle || "";

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((item) => item.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "due_asc") {
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      }
      if (sortBy === "due_desc") {
        return new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime();
      }
      if (sortBy === "difficulty") {
        const diffWeight = { EASY: 1, MEDIUM: 2, HARD: 3 };
        return diffWeight[a.difficulty] - diffWeight[b.difficulty];
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [items, statusFilter, search, sortBy]);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header & Stats */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Sarlavha bloki */}
          <div className="space-y-1 max-w-xl">
            <span className="text-[11px] font-bold tracking-wider text-muted uppercase">
              {t("header")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-text">{t("title")}</h1>
            {courseTopicPath && (
              <p className="text-xs sm:text-sm font-semibold text-brand">{courseTopicPath}</p>
            )}
            <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
              {t("subtitle")}
            </p>
          </div>

          {/* Right 4 Stat Cards */}
          <AssignmentStatsRow
            totalCount={counts.ALL}
            newCount={counts.NEW}
            doneCount={counts.DONE}
            streakDays={streakDays}
            className="w-full lg:w-auto"
          />
        </div>

        {/* Filters and Tabs */}
        <AssignmentFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          counts={counts}
        />

        {/* Content list / States */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : isError ? (
          <div className="py-12">
            <ErrorState message={t("error.load")} onRetry={() => void refetch()} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState title={t("empty.title")} description={t("empty.description")} />
        ) : filteredItems.length === 0 ? (
          <EmptyState title={t("empty.filterTitle")} description={t("empty.filterDescription")} />
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <AssignmentRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

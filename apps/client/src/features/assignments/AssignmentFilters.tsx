import { useTranslation } from "react-i18next";
import { ArrowUpDown, Search } from "lucide-react";
import type { SubmissionStatus } from "@zexn/shared";

export type StatusFilterType = "ALL" | SubmissionStatus;
export type SortOptionType = "due_asc" | "due_desc" | "difficulty" | "title";

interface AssignmentFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: StatusFilterType;
  onStatusFilterChange: (status: StatusFilterType) => void;
  sortBy: SortOptionType;
  onSortByChange: (sort: SortOptionType) => void;
  counts: Record<StatusFilterType, number>;
  className?: string;
}

export function AssignmentFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  counts,
  className = "",
}: AssignmentFiltersProps) {
  const { t } = useTranslation("assignments");

  const tabs: Array<{ id: StatusFilterType; label: string; count: number }> = [
    { id: "ALL", label: t("filters.tabAll"), count: counts.ALL },
    { id: "NEW", label: t("filters.tabNew"), count: counts.NEW },
    { id: "IN_PROGRESS", label: t("filters.tabInProgress"), count: counts.IN_PROGRESS },
    { id: "SUBMITTED", label: t("filters.tabSubmitted"), count: counts.SUBMITTED },
    { id: "DONE", label: t("filters.tabDone"), count: counts.DONE },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search input */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            className="w-full rounded-2xl border border-line bg-surface py-2 pl-9 pr-3 text-xs text-text placeholder:text-muted focus:border-brand focus:outline-none transition-colors"
          />
        </div>

        {/* Center: Tabs with count badge */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusFilterChange(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-brand text-bg shadow-sm"
                    : "border border-line bg-surface text-muted hover:text-text"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-bg/20 text-bg" : "bg-surface-alt text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Sort Select */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 h-3.5 w-3.5 text-muted pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortOptionType)}
              aria-label={t("filters.sortLabel")}
              className="rounded-2xl border border-line bg-surface py-1.5 pl-8 pr-8 text-xs font-medium text-text appearance-none focus:border-brand focus:outline-none transition-colors cursor-pointer"
            >
              <option value="due_asc">{t("filters.sortDueAsc")}</option>
              <option value="due_desc">{t("filters.sortDueDesc")}</option>
              <option value="difficulty">{t("filters.sortDifficulty")}</option>
              <option value="title">{t("filters.sortTitle")}</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-muted text-[10px]">▼</div>
          </div>
        </div>
      </div>
    </div>
  );
}

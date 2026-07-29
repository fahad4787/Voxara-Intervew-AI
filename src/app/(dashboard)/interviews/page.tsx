"use client";

import { Briefcase, Search } from "lucide-react";
import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useOwnerInterviews } from "@/hooks/useInterviews";
import { PageHeader } from "@/components/layout/Container";
import { DashboardContent } from "@/components/layout/DashboardShell";
import { CreateInterviewButton } from "@/components/interviews/CreateInterviewButton";
import { InterviewRow } from "@/components/interviews/InterviewRow";
import { InterviewTable } from "@/components/interviews/InterviewTable";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";
import { DIFFICULTY_OPTIONS } from "@/lib/utils/constants";
import {
  STATUS_FILTERS,
  type StatusFilterValue,
} from "@/lib/utils/status";
import type { InterviewDifficulty, InterviewStatus } from "@/types/interview";

function InterviewsPageContent() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") ||
    "all") as StatusFilterValue;
  const { interviews, loading, removeInterview } = useOwnerInterviews();
  const [status, setStatus] = useState<StatusFilterValue>(
    STATUS_FILTERS.some((f) => f.value === initialStatus)
      ? initialStatus
      : "all",
  );
  const [difficulty, setDifficulty] = useState<"all" | InterviewDifficulty>(
    "all",
  );
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: interviews.length };
    for (const filter of STATUS_FILTERS) {
      if (filter.value === "all") continue;
      map[filter.value] = interviews.filter(
        (item) => item.status === filter.value,
      ).length;
    }
    return map;
  }, [interviews]);

  const visibleFilters = useMemo(
    () =>
      STATUS_FILTERS.filter(
        (filter) => filter.value === "all" || (counts[filter.value] ?? 0) > 0,
      ),
    [counts],
  );

  const activeStatus = visibleFilters.some((f) => f.value === status)
    ? status
    : "all";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return interviews.filter((item) => {
      if (
        activeStatus !== "all" &&
        item.status !== (activeStatus as InterviewStatus)
      ) {
        return false;
      }
      if (difficulty !== "all" && item.difficulty !== difficulty) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.candidateName.toLowerCase().includes(q) ||
        (item.candidateEmail?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [interviews, activeStatus, difficulty, query]);

  return (
    <DashboardContent>
      <PageHeader
        eyebrow="Pipeline"
        title="Interviews"
        description="Create JD-based sessions, share invites, and review scorecards."
      />

      {loading ? (
        <PageSpinner label="Loading interviews…" />
      ) : interviews.length === 0 ? (
        <Panel>
          <PanelBody>
            <EmptyState
              icon={<Briefcase className="h-5 w-5" />}
              title="No interviews yet"
              description="Create your first interview from a job description. You’ll get questions and an invite link for the candidate."
              action={
                <CreateInterviewButton>Create interview</CreateInterviewButton>
              }
              className="border-0 bg-transparent"
            />
          </PanelBody>
        </Panel>
      ) : (
        <Panel>
          <PanelHeader
            title="All sessions"
            description={`${filtered.length} shown · ${interviews.length} total`}
            action={<Badge tone="brand">{filtered.length} results</Badge>}
          />

          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
            <div
              className="flex flex-wrap gap-1.5"
              role="tablist"
              aria-label="Filter by status"
            >
              {visibleFilters.map((filter) => {
                const count = counts[filter.value] ?? 0;
                const active = activeStatus === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStatus(filter.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.12em] transition-colors",
                      active
                        ? "bg-[var(--ink)] text-white"
                        : "bg-[var(--surface-muted)] text-[var(--ink-muted)] hover:text-[var(--ink)]",
                    )}
                  >
                    {filter.label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                        active ? "bg-white/15" : "bg-[var(--surface-elevated)]",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative min-w-[14rem] flex-1 sm:w-56 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]" />
                <Input
                  aria-label="Search interviews"
                  placeholder="Search role or candidate"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                aria-label="Filter by difficulty"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "all" | InterviewDifficulty)
                }
                className="sm:w-40"
              >
                <option value="all">All levels</option>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <PanelBody>
              <EmptyState
                title="No matches"
                description="Try a different status, level, or search term."
                className="border-0 bg-transparent py-10"
              />
            </PanelBody>
          ) : (
            <InterviewTable flush>
              {filtered.map((interview) => (
                <InterviewRow
                  key={interview.id}
                  interview={interview}
                  onDelete={removeInterview}
                />
              ))}
            </InterviewTable>
          )}
        </Panel>
      )}
    </DashboardContent>
  );
}

export default function InterviewsPage() {
  return (
    <Suspense fallback={null}>
      <InterviewsPageContent />
    </Suspense>
  );
}

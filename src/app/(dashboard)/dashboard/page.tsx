"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock3,
  Gauge,
} from "lucide-react";
import { useOwnerInterviews } from "@/hooks/useInterviews";
import { PageHeader } from "@/components/layout/Container";
import { DashboardContent } from "@/components/layout/DashboardShell";
import { CreateInterviewButton } from "@/components/interviews/CreateInterviewButton";
import { InterviewRow } from "@/components/interviews/InterviewRow";
import { InterviewTable } from "@/components/interviews/InterviewTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/utils/constants";

export default function DashboardPage() {
  const { interviews, loading, removeInterview } = useOwnerInterviews();

  const completed = interviews.filter((item) => item.status === "completed");
  const active = interviews.filter(
    (item) => item.status === "ready" || item.status === "in_progress",
  );
  const inProgress = interviews.filter((item) => item.status === "in_progress");
  const avgScore =
    completed.length === 0
      ? null
      : Math.round(
          completed.reduce(
            (sum, item) => sum + (item.report?.scores.overall ?? 0),
            0,
          ) / completed.length,
        );

  const stats = [
    {
      label: "Total interviews",
      value: String(interviews.length),
      href: "/interviews",
      icon: Briefcase,
      hint: "All sessions",
    },
    {
      label: "Active",
      value: String(active.length),
      href: "/interviews?status=ready",
      icon: Clock3,
      hint: "Ready or live",
    },
    {
      label: "Completed",
      value: String(completed.length),
      href: "/interviews?status=completed",
      icon: CheckCircle2,
      hint: "With reports",
    },
    {
      label: "Avg score",
      value: avgScore === null ? "—" : String(avgScore),
      href: "/interviews?status=completed",
      icon: Gauge,
      hint: "Completed only",
    },
  ];

  const recent = interviews.slice(0, 5);
  const awaiting = interviews
    .filter((item) => item.status === "ready")
    .slice(0, 3);

  return (
    <DashboardContent>
      <PageHeader
        eyebrow="Workspace"
        title={`Welcome to ${APP_NAME}`}
        description="Track sessions, share invites, and review scorecards from one place."
      />

      {loading ? (
        <PageSpinner label="Loading overview…" />
      ) : (
        <div className="space-y-6">
          <Panel>
            <PanelHeader
              title="Pipeline snapshot"
              description="Jump into any slice of your interview list."
            />
            <PanelBody className="!p-0">
              <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => (
                  <Link
                    key={stat.label}
                    href={stat.href}
                    className={cn(
                      "group flex items-start gap-3 px-5 py-5 transition-colors hover:bg-[var(--surface-wash)] sm:px-6",
                      index > 0 && "border-t border-[var(--border)] sm:border-t-0",
                      index % 2 === 1 && "sm:border-l",
                      index >= 2 && "xl:border-t-0",
                      index > 0 && "xl:border-l",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                      <stat.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                          {stat.label}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-[var(--ink-faint)] opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>
                      <span className="mt-1 block font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)]">
                        {stat.value}
                      </span>
                      <span className="mt-1 block text-xs text-[var(--ink-muted)]">
                        {stat.hint}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </PanelBody>
          </Panel>

          {awaiting.length > 0 ? (
            <Panel>
              <PanelHeader
                title="Waiting on candidates"
                description={`${awaiting.length} ready invite${awaiting.length === 1 ? "" : "s"} to share.`}
                action={
                  <Button href="/interviews?status=ready" variant="secondary" size="sm">
                    View ready
                  </Button>
                }
              />
              <PanelBody className="space-y-3 !pt-4">
                {awaiting.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-[var(--ink)]">
                          {interview.title}
                        </p>
                        <Badge tone="info">ready</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-[var(--ink-muted)]">
                        {interview.candidateName}
                        {interview.candidateEmail
                          ? ` · ${interview.candidateEmail}`
                          : ""}
                      </p>
                    </div>
                    <Button
                      href={`/interviews/${interview.id}`}
                      variant="secondary"
                      size="sm"
                    >
                      Open invite
                    </Button>
                  </div>
                ))}
              </PanelBody>
            </Panel>
          ) : null}

          {inProgress.length > 0 ? (
            <Panel>
              <PanelHeader
                title="Live now"
                description="Candidates currently in a room."
                action={<Badge tone="warning">{inProgress.length} live</Badge>}
              />
              <PanelBody className="!p-0">
                <InterviewTable flush>
                  {inProgress.map((interview) => (
                    <InterviewRow
                      key={interview.id}
                      interview={interview}
                      onDelete={removeInterview}
                    />
                  ))}
                </InterviewTable>
              </PanelBody>
            </Panel>
          ) : null}

          <Panel>
            <PanelHeader
              title="Recent interviews"
              description="Latest sessions across your workspace."
              action={
                <Link
                  href="/interviews"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-strong)] hover:underline"
                >
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              }
            />
            {recent.length === 0 ? (
              <PanelBody>
                <EmptyState
                  icon={<Briefcase className="h-5 w-5" />}
                  title="No interviews yet"
                  description="Create your first interview from a job description and send the candidate invite link."
                  action={
                    <CreateInterviewButton>Create interview</CreateInterviewButton>
                  }
                  className="border-0 bg-transparent py-10"
                />
              </PanelBody>
            ) : (
              <PanelBody className="!p-0">
                <InterviewTable flush>
                  {recent.map((interview) => (
                    <InterviewRow
                      key={interview.id}
                      interview={interview}
                      onDelete={removeInterview}
                    />
                  ))}
                </InterviewTable>
              </PanelBody>
            )}
          </Panel>
        </div>
      )}
    </DashboardContent>
  );
}

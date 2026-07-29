"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock3,
  Sparkles,
} from "lucide-react";
import { useOwnerInterviews } from "@/hooks/useInterviews";
import { PageHeader } from "@/components/layout/Container";
import { DashboardContent } from "@/components/layout/DashboardShell";
import { CreateInterviewButton } from "@/components/interviews/CreateInterviewButton";
import { InterviewCard } from "@/components/interviews/InterviewCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Progress";
import { DisplayTitle, IconTile } from "@/components/ui/Typography";
import { APP_NAME } from "@/lib/utils/constants";

export default function DashboardPage() {
  const { interviews, loading, removeInterview } = useOwnerInterviews();

  const completed = interviews.filter((item) => item.status === "completed");
  const active = interviews.filter(
    (item) => item.status === "ready" || item.status === "in_progress",
  );
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
      icon: Briefcase,
    },
    {
      label: "Active",
      value: String(active.length),
      icon: Clock3,
    },
    {
      label: "Completed",
      value: String(completed.length),
      icon: CheckCircle2,
    },
    {
      label: "Avg score",
      value: avgScore === null ? "—" : String(avgScore),
      icon: Sparkles,
    },
  ];

  const recent = interviews.slice(0, 4);

  return (
    <DashboardContent>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome to ${APP_NAME}`}
        description="Track interview progress, share candidate invites, and review scored reports from one place."
        actions={<CreateInterviewButton />}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-start justify-between gap-3 pt-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
                      {stat.label}
                    </p>
                    <DisplayTitle
                      as="h3"
                      size="md"
                      className="mt-2 text-3xl sm:text-3xl"
                    >
                      {stat.value}
                    </DisplayTitle>
                  </div>
                  <IconTile>
                    <stat.icon className="h-4 w-4" />
                  </IconTile>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-[var(--ink)]">Recent interviews</h2>
            <Link
              href="/interviews"
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-strong)] hover:underline"
            >
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-5 w-5" />}
              title="No interviews yet"
              description="Create your first interview from a job description and send the candidate invite link."
              action={
                <CreateInterviewButton>Create interview</CreateInterviewButton>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
              {recent.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onDelete={removeInterview}
                />
              ))}
            </div>
          )}

          {active.length > 0 ? (
            <Card className="mt-8">
              <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Badge tone="warning">{active.length} awaiting candidates</Badge>
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">
                    Share invite links so candidates can join their live AI
                    interview rooms.
                  </p>
                </div>
                <Button href="/interviews" variant="secondary" size="sm">
                  Open interviews
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </DashboardContent>
  );
}

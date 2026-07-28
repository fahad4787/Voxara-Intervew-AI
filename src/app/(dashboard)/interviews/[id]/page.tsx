"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, LayoutDashboard, RefreshCw, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { saveInterviewClient } from "@/lib/db/interviews.client";
import { formatDate } from "@/lib/utils/cn";
import { useInterview } from "@/hooks/useInterviews";
import type { InterviewSession } from "@/types/interview";
import { PageHeader } from "@/components/layout/Container";
import { DashboardContent } from "@/components/layout/DashboardShell";
import { InviteLink } from "@/components/interviews/InterviewCard";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { TranscriptPanel } from "@/components/interview/TranscriptPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Progress";

type Params = { params: Promise<{ id: string }> };

type RescoreResponse = InterviewSession & { persisted?: boolean };

export default function InterviewDetailPage({ params }: Params) {
  return (
    <Suspense
      fallback={
        <DashboardContent>
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8" />
          </div>
        </DashboardContent>
      }
    >
      <InterviewDetailContent params={params} />
    </Suspense>
  );
}

function InterviewDetailContent({ params }: Params) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showThanks = searchParams.get("thanks") === "1";
  const { id } = use(params);
  const { interview, loading, error, removeInterview, updateInterview } =
    useInterview(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rescoring, setRescoring] = useState(false);
  const [rescoreError, setRescoreError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!interview) return;
    setDeleting(true);
    try {
      await removeInterview();
      setConfirmOpen(false);
      router.push("/interviews");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Failed to delete interview",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRescore = async () => {
    if (!interview) return;
    setRescoring(true);
    setRescoreError(null);
    try {
      const result = await apiFetch<RescoreResponse>(
        `/api/interviews/${interview.id}/rescore`,
        {
          method: "POST",
          body: JSON.stringify({
            token: interview.token,
            session: interview,
          }),
        },
      );

      const { persisted, ...next } = result;
      if (!persisted) {
        await saveInterviewClient(next);
      }
      updateInterview(next);
    } catch (err) {
      setRescoreError(
        err instanceof Error ? err.message : "Failed to re-score interview",
      );
    } finally {
      setRescoring(false);
    }
  };

  if (loading) {
    return (
      <DashboardContent>
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardContent>
    );
  }

  if (!interview) {
    return (
      <DashboardContent>
        <EmptyState
          title="Interview not found"
          description={error || "This interview may have been removed."}
          action={
            <Link href="/interviews">
              <Button variant="secondary">Back to interviews</Button>
            </Link>
          }
        />
      </DashboardContent>
    );
  }

  const canRescore = interview.messages.some((m) => m.role === "candidate");

  return (
    <>
      <DashboardContent>
        {showThanks ? (
          <Card className="mb-6 border-emerald-200 bg-emerald-50/60">
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-[var(--ink)]">
                    Thank you — interview submitted
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    {interview.candidateName} finished “{interview.title}”. The
                    scorecard below is ready to review.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard">
                  <Button size="sm">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/interviews">
                  <Button size="sm" variant="secondary">
                    All interviews
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <PageHeader
          eyebrow={showThanks ? "Interview complete" : "Interview detail"}
          title={
            showThanks
              ? `Thank you, ${interview.candidateName}`
              : interview.title
          }
          description={
            showThanks
              ? `You finished the ${interview.title} interview. Review the report, transcript, and invite details below.`
              : `${interview.candidateName} · ${interview.difficulty} · ${interview.durationMinutes} min · created ${formatDate(interview.createdAt)}`
          }
          actions={
            <div className="flex flex-wrap gap-2">
              {showThanks ? (
                <Link href="/dashboard">
                  <Button>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : null}
              {/* TEMP: remove once scoring calibration feels reliable */}
              {canRescore ? (
                <Button
                  variant="soft"
                  onClick={() => void handleRescore()}
                  loading={rescoring}
                  disabled={rescoring || deleting}
                >
                  <RefreshCw className="h-4 w-4" />
                  Re-score interview
                </Button>
              ) : null}
              <Button
                variant="ghost"
                onClick={() => setConfirmOpen(true)}
                disabled={deleting || rescoring}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Link href="/interviews">
                <Button variant="secondary">Back to list</Button>
              </Link>
            </div>
          }
        />

        {rescoreError ? (
          <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {rescoreError}
          </p>
        ) : null}

        <div className="mb-6 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{interview.status.replace("_", " ")}</Badge>
            {interview.plan ? (
              <Badge>
                {interview.plan.focusSkills.slice(0, 3).join(" · ")}
              </Badge>
            ) : null}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--ink)]">
              Candidate invite link
            </p>
            <InviteLink token={interview.token} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {rescoring ? (
              <Card>
                <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--ink-muted)]">
                  <Spinner /> Re-scoring with the latest logic…
                </CardContent>
              </Card>
            ) : interview.report ? (
              <ReportSummary report={interview.report} />
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-[var(--ink-muted)]">
                  Report will appear here after the candidate completes the
                  interview.
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-medium text-[var(--ink)]">
                  Job description
                </h3>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink-muted)]">
                  {interview.jobDescription}
                </p>
              </CardContent>
            </Card>

            {interview.plan ? (
              <Card>
                <CardHeader>
                  <h3 className="font-medium text-[var(--ink)]">
                    Planned questions
                  </h3>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-[var(--ink-muted)]">
                    {interview.plan.questions.map((question, index) => (
                      <li key={question} className="flex gap-2">
                        <span className="font-semibold text-[var(--accent-strong)]">
                          {index + 1}.
                        </span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <h3 className="font-medium text-[var(--ink)]">Transcript</h3>
              </CardHeader>
              <CardContent>
                {interview.messages.length === 0 ? (
                  <p className="text-sm text-[var(--ink-muted)]">
                    No messages yet
                  </p>
                ) : (
                  <TranscriptPanel
                    messages={interview.messages}
                    className="max-h-[28rem]"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardContent>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete interview?"
        description={`“${interview.title}” for ${interview.candidateName} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete interview"
        loading={deleting}
      />
    </>
  );
}

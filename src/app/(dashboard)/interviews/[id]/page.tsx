"use client";

import { Suspense, use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronLeft, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import { saveInterviewClient } from "@/lib/db/interviews.client";
import { formatDate } from "@/lib/utils/format";
import { statusLabel, statusTone } from "@/lib/utils/status";
import { useInterview } from "@/hooks/useInterviews";
import type { InterviewSession } from "@/types/interview";
import { DashboardContent } from "@/components/layout/DashboardShell";
import { InviteLink } from "@/components/interviews/InviteLink";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { TranscriptPanel } from "@/components/interview/TranscriptPanel";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { BodyText, DisplayTitle } from "@/components/ui/Typography";

type Params = { params: Promise<{ id: string }> };

type RescoreResponse = InterviewSession & { persisted?: boolean };

export default function InterviewDetailPage({ params }: Params) {
  return (
    <Suspense fallback={null}>
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [rescoring, setRescoring] = useState(false);
  const [rescoreError, setRescoreError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!interview) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await removeInterview();
      setConfirmOpen(false);
      router.push("/interviews");
    } catch (err) {
      setDeleteError(
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
        <PageSpinner label="Loading interview…" />
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
            <Button href="/interviews" variant="secondary">
              Back to interviews
            </Button>
          }
        />
      </DashboardContent>
    );
  }

  const canRescore = interview.messages.some((m) => m.role === "candidate");
  const questionCount = interview.plan?.questions.length ?? 0;

  return (
    <>
      <DashboardContent>
        {showThanks ? (
          <InlineAlert tone="success" className="mb-6 flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Interview submitted</p>
              <p className="mt-1 text-[var(--ink-muted)]">
                {interview.candidateName} finished “{interview.title}”. Review
                the scorecard below.
              </p>
            </div>
          </InlineAlert>
        ) : null}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link
              href="/interviews"
              className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            >
              <ChevronLeft className="h-4 w-4" />
              Interviews
            </Link>
            <DisplayTitle>{interview.title}</DisplayTitle>
            <BodyText className="mt-2 max-w-2xl">
              {`${interview.candidateName} · ${interview.difficulty} · ${interview.durationMinutes} min · ${formatDate(interview.createdAt)}`}
            </BodyText>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone[interview.status]}>
              {statusLabel(interview.status)}
            </Badge>
            {canRescore ? (
              <Button
                variant="soft"
                onClick={() => void handleRescore()}
                loading={rescoring}
                disabled={rescoring || deleting}
                leadingIcon={RefreshCw}
              >
                Re-score
              </Button>
            ) : null}
            <Button
              variant="dangerGhost"
              size="sm"
              iconOnly
              onClick={() => setConfirmOpen(true)}
              disabled={deleting || rescoring}
              leadingIcon={Trash2}
              aria-label="Delete interview"
            />
          </div>
        </div>

        {rescoreError ? (
          <InlineAlert className="mb-4">{rescoreError}</InlineAlert>
        ) : null}
        {deleteError ? (
          <InlineAlert className="mb-4">{deleteError}</InlineAlert>
        ) : null}

        <div className="space-y-6">
          {interview.status !== "completed" ? (
            <Panel>
              <PanelHeader
                title="Session details"
                description="Status, focus skills, and the candidate invite link."
              />
              <PanelBody className="space-y-4">
                {interview.plan?.focusSkills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {interview.plan.focusSkills.slice(0, 5).map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                ) : null}
                <div>
                  <p className="mb-2 text-sm font-medium text-[var(--ink)]">
                    Candidate invite
                  </p>
                  <InviteLink token={interview.token} />
                </div>
              </PanelBody>
            </Panel>
          ) : null}

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div className="min-w-0">
              {rescoring ? (
                <PageSpinner
                  label="Re-scoring…"
                  fill={false}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] py-16"
                />
              ) : interview.report ? (
                <ReportSummary report={interview.report} />
              ) : (
                <Panel>
                  <PanelBody className="py-12 text-center text-sm text-[var(--ink-muted)]">
                    Report appears here after the candidate finishes.
                  </PanelBody>
                </Panel>
              )}
            </div>

            <Accordion type="multiple" defaultValue={["transcript"]}>
              <AccordionItem
                id="job"
                title="Job description"
                meta="Role brief used to build the interview"
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink-muted)]">
                  {interview.jobDescription}
                </p>
              </AccordionItem>

              {interview.plan ? (
                <AccordionItem
                  id="questions"
                  title="Planned questions"
                  meta={`${questionCount} question${questionCount === 1 ? "" : "s"}`}
                >
                  <ol className="space-y-3 text-sm text-[var(--ink-muted)]">
                    {interview.plan.questions.map((question, index) => (
                      <li key={question} className="flex gap-2">
                        <span className="font-[family-name:var(--font-data)] font-medium text-[var(--accent-strong)]">
                          {index + 1}.
                        </span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ol>
                </AccordionItem>
              ) : null}

              <AccordionItem
                id="transcript"
                title="Transcript"
                meta={
                  interview.messages.length === 0
                    ? "No messages yet"
                    : `${interview.messages.length} turns`
                }
              >
                {interview.messages.length === 0 ? (
                  <p className="text-sm text-[var(--ink-muted)]">
                    No messages yet. The conversation will show here once the
                    candidate starts.
                  </p>
                ) : (
                  <TranscriptPanel
                    messages={interview.messages}
                    className="max-h-[28rem]"
                  />
                )}
              </AccordionItem>
            </Accordion>
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

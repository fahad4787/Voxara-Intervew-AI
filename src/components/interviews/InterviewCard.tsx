"use client";

import Link from "next/link";
import { ArrowUpRight, Copy, Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { InterviewSession } from "@/types/interview";
import { formatDate, recommendationLabel } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const statusTone = {
  draft: "neutral",
  ready: "info",
  in_progress: "warning",
  completed: "success",
  cancelled: "danger",
} as const;

export function InterviewCard({
  interview,
  onDelete,
}: {
  interview: InterviewSession;
  onDelete?: (interview: InterviewSession) => Promise<void> | void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(interview);
      setConfirmOpen(false);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Failed to delete interview",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card className="transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[var(--ink)]">
                {interview.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                {interview.candidateName}
                {interview.candidateEmail
                  ? ` · ${interview.candidateEmail}`
                  : ""}
              </p>
            </div>
            <Badge tone={statusTone[interview.status]}>
              {interview.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-[var(--ink-muted)]">
            <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1">
              {interview.difficulty}
            </span>
            <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1">
              {interview.durationMinutes} min
            </span>
            <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1">
              {formatDate(interview.createdAt)}
            </span>
          </div>

          {interview.report ? (
            <p className="text-sm text-[var(--ink)]">
              Score{" "}
              <span className="font-semibold">
                {interview.report.scores.overall}
              </span>{" "}
              · {recommendationLabel(interview.report.feedback.recommendation)}
            </p>
          ) : (
            <p className="text-sm text-[var(--ink-muted)]">
              Invite the candidate to begin the AI video interview.
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            {onDelete ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                aria-label={`Delete ${interview.title}`}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
            <Link href={`/interviews/${interview.id}`}>
              <Button variant="soft" size="sm">
                Open
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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

export function InviteLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`/interview/${token}`);

  useEffect(() => {
    setUrl(`${window.location.origin}/interview/${token}`);
  }, [token]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="flex-1 truncate rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-xs text-[var(--ink-muted)]">
        {url}
      </code>
      <Button variant="secondary" size="sm" onClick={() => void copy()}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy invite"}
      </Button>
      <Link href={`/interview/${token}`} target="_blank">
        <Button size="sm">Open room</Button>
      </Link>
    </div>
  );
}

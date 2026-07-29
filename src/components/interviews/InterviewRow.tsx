"use client";

import { ArrowUpRight, Trash2 } from "lucide-react";
import { useState } from "react";
import type { InterviewSession } from "@/types/interview";
import { formatDate, recommendationLabel } from "@/lib/utils/format";
import { statusLabel, statusTone } from "@/lib/utils/status";
import { INTERVIEW_COLS } from "@/components/interviews/interviewGrid";
import { InviteLink } from "@/components/interviews/InviteLink";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { cn } from "@/lib/utils/cn";

export function InterviewRow({
  interview,
  onDelete,
  className,
}: {
  interview: InterviewSession;
  onDelete?: (interview: InterviewSession) => Promise<void> | void;
  className?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(interview);
      setConfirmOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete interview",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {error ? (
        <InlineAlert className="mb-3" tone="error">
          {error}
        </InlineAlert>
      ) : null}

      <div
        className={cn(
          "grid gap-3 border-b border-[var(--border)] py-3.5 sm:items-center sm:gap-4",
          INTERVIEW_COLS,
          className,
        )}
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-[var(--ink)]">
            {interview.title}
          </p>
          <p className="mt-0.5 truncate text-sm text-[var(--ink-muted)]">
            {interview.candidateName}
            {interview.candidateEmail ? ` · ${interview.candidateEmail}` : ""}
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-[var(--ink-muted)]">
          <Badge tone={statusTone[interview.status]}>
            {statusLabel(interview.status)}
          </Badge>
          <span className="font-[family-name:var(--font-data)]">
            {interview.difficulty}
          </span>
          <span className="font-[family-name:var(--font-data)]">
            {interview.durationMinutes}m
          </span>
        </div>

        <div className="font-[family-name:var(--font-data)] tabular-nums text-[var(--ink)]">
          {interview.report ? (
            <span
              className="text-lg font-bold"
              title={recommendationLabel(
                interview.report.feedback.recommendation,
              )}
            >
              {interview.report.scores.overall}
            </span>
          ) : (
            <span className="text-sm text-[var(--ink-faint)]">—</span>
          )}
        </div>

        <p className="font-[family-name:var(--font-data)] text-xs text-[var(--ink-muted)]">
          {formatDate(interview.createdAt)}
        </p>

        <div className="flex flex-wrap items-center justify-end gap-1">
          {interview.status === "ready" ? (
            <InviteLink token={interview.token} compact />
          ) : null}
          {onDelete ? (
            <Button
              variant="dangerGhost"
              size="sm"
              iconOnly
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
              leadingIcon={Trash2}
              aria-label={`Delete ${interview.title}`}
            />
          ) : null}
          <Button
            href={`/interviews/${interview.id}`}
            variant="secondary"
            size="sm"
            icon={ArrowUpRight}
          >
            Open
          </Button>
        </div>
      </div>

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

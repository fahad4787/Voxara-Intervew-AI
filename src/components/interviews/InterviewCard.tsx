"use client";

import { ArrowUpRight, Trash2 } from "lucide-react";
import { useState } from "react";
import type { InterviewSession } from "@/types/interview";
import { formatDate, recommendationLabel } from "@/lib/utils/format";
import { statusLabel, statusTone } from "@/lib/utils/status";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InlineAlert } from "@/components/ui/InlineAlert";

export function InterviewCard({
  interview,
  onDelete,
}: {
  interview: InterviewSession;
  onDelete?: (interview: InterviewSession) => Promise<void> | void;
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
      <Card className="hover:border-[var(--ink-faint)]">
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
              {statusLabel(interview.status)}
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
              Share the invite so the candidate can start.
            </p>
          )}

          {error ? <InlineAlert>{error}</InlineAlert> : null}

          <div className="flex items-center justify-end gap-2">
            {onDelete ? (
              <Button
                variant="dangerGhost"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                leadingIcon={Trash2}
                aria-label={`Delete ${interview.title}`}
              >
                Delete
              </Button>
            ) : null}
            <Button
              href={`/interviews/${interview.id}`}
              variant="soft"
              size="sm"
              icon={ArrowUpRight}
            >
              Open
            </Button>
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

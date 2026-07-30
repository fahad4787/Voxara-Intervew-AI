"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { BodyText } from "@/components/ui/Typography";
import type { InterviewSession } from "@/types/interview";

export function InterviewComplete({ session }: { session: InterviewSession }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const showInDashboard = ready && Boolean(user);

  useEffect(() => {
    if (!showInDashboard) return;
    router.replace(`/interviews/${session.id}?thanks=1`);
  }, [showInDashboard, router, session.id]);

  if (!ready || showInDashboard) {
    return (
      <PageSpinner
        label={
          showInDashboard ? "Opening your dashboard…" : "Finishing up…"
        }
        fill={false}
        className="min-h-[calc(100dvh-3.5rem-4rem)]"
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Thank you, {session.candidateName}
        </h1>
        <BodyText className="mx-auto mt-2 max-w-md">
          You finished the {session.title} interview. Here’s a summary of how
          the session scored.
        </BodyText>
        <div className="mt-4">
          <Badge tone="success">Session submitted</Badge>
        </div>
      </div>

      {session.report ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-soft)] sm:p-6">
          <ReportSummary report={session.report} />
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-6 py-8 text-center shadow-[var(--shadow-soft)]">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            You’re all set
          </h2>
          <BodyText className="mx-auto mt-2 max-w-md">
            Thanks for your time with Ava. You can close this tab now. The
            hiring team will review your responses shortly.
          </BodyText>
        </div>
      )}

      <BodyText className="text-center text-sm text-[var(--ink-faint)]">
        You can close this tab whenever you’re ready.
      </BodyText>
    </div>
  );
}

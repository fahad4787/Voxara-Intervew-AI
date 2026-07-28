"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/layout/Container";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { TranscriptPanel } from "@/components/interview/TranscriptPanel";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Progress";
import { BodyText } from "@/components/ui/Typography";
import type { InterviewSession } from "@/types/interview";

export function InterviewComplete({ session }: { session: InterviewSession }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const report = session.report;
  // Single-admin portal: signed-in users belong in dashboard chrome.
  const showInDashboard = ready && Boolean(user);

  useEffect(() => {
    if (!showInDashboard) return;
    router.replace(`/interviews/${session.id}?thanks=1`);
  }, [showInDashboard, router, session.id]);

  if (!ready || showInDashboard) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
          <Spinner />{" "}
          {showInDashboard ? "Opening your dashboard…" : "Finishing up…"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Interview complete"
        title={`Thank you, ${session.candidateName}`}
        description={`You finished the ${session.title} interview. Your answers are saved for the hiring team.`}
      />

      <Card>
        <CardContent className="flex flex-col gap-5 py-8 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <Badge tone="success">Session submitted</Badge>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              You’re all set
            </h3>
            <BodyText className="mt-2 max-w-xl">
              Thanks for your time with Ava. You can close this tab now. The
              recruiter will review your responses shortly.
            </BodyText>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {report ? (
            <ReportSummary report={report} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--ink-muted)]">
                <Spinner /> Preparing your practice summary…
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <h3 className="font-medium text-[var(--ink)]">Transcript</h3>
          </CardHeader>
          <CardContent>
            {session.messages.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">No messages yet</p>
            ) : (
              <TranscriptPanel
                messages={session.messages}
                className="max-h-[28rem]"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

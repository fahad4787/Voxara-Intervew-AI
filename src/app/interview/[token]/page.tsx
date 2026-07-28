"use client";

import { use, useEffect, useState } from "react";
import { getInterviewByTokenClient } from "@/lib/db/interviews.client";
import type { InterviewSession } from "@/types/interview";
import { Logo } from "@/components/brand/Logo";
import { Container, PageHeader } from "@/components/layout/Container";
import { InterviewRoom } from "@/components/interview/InterviewRoom";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Progress";

type Params = { params: Promise<{ token: string }> };

export default function CandidateInterviewPage({ params }: Params) {
  const { token } = use(params);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    void getInterviewByTokenClient(token)
      .then((item) => {
        if (!active) return;
        if (!item) {
          setSession(null);
          setError("This interview link is invalid or has expired.");
          return;
        }
        setSession(item);
        setFinished(item.status === "completed");
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setSession(null);
        setError(
          err instanceof Error ? err.message : "Unable to load interview",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const showLiveIntro = Boolean(session) && !finished;

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-12">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6">
          <Logo showWordmark />
        </div>
      </header>
      <Container className="pt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : !session ? (
          <EmptyState
            title="Interview not found"
            description={
              error || "Ask the recruiter to resend your invite link."
            }
          />
        ) : (
          <>
            {showLiveIntro ? (
              <PageHeader
                eyebrow="Live interview"
                title={session.title}
                description={`Welcome ${session.candidateName}. Enable your camera, listen to Ava, and answer out loud.`}
              />
            ) : null}
            <InterviewRoom
              initialSession={session}
              onCompleted={() => setFinished(true)}
            />
          </>
        )}
      </Container>
    </div>
  );
}

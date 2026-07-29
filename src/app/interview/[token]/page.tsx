"use client";

import { use, useEffect, useState } from "react";
import { getInterviewByTokenClient } from "@/lib/db/interviews.client";
import type { InterviewSession } from "@/types/interview";
import { Logo } from "@/components/brand/Logo";
import { Container, PageHeader } from "@/components/layout/Container";
import { InterviewRoom } from "@/components/interview/InterviewRoom";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { cn } from "@/lib/utils/cn";

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
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6">
          <Logo showWordmark />
        </div>
      </header>

      {loading ? (
        <PageSpinner
          label="Preparing your interview…"
          fill={false}
          className="min-h-[calc(100dvh-3.5rem)]"
        />
      ) : (
        <div className={cn("pb-12", showLiveIntro && "hero-atmosphere")}>
          <Container className="pt-8">
            {!session ? (
              <EmptyState
                title="Interview not found"
                description={
                  error || "Ask the recruiter to resend your invite link."
                }
              />
            ) : (
              <>
                {showLiveIntro ? (
                  <div className="reveal-on-load mb-8">
                    <PageHeader
                      eyebrow="Live interview"
                      title={session.title}
                      description={`Welcome ${session.candidateName}. Enable your camera, listen to Ava, and answer out loud.`}
                    />
                  </div>
                ) : null}
                <div
                  className={
                    showLiveIntro ? "reveal-on-load reveal-delay-1" : undefined
                  }
                >
                  <InterviewRoom
                    initialSession={session}
                    onCompleted={() => setFinished(true)}
                  />
                </div>
              </>
            )}
          </Container>
        </div>
      )}
    </div>
  );
}

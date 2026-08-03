"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  deleteInterviewClient,
  getInterviewClient,
  listOwnerInterviewsClient,
} from "@/lib/db/interviews.client";
import type { InterviewSession } from "@/types/interview";

export function useOwnerInterviews() {
  const { user, ready } = useAuth();
  const userId = user?.id;
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      setInterviews([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    void listOwnerInterviewsClient(userId)
      .then((items) => {
        if (!active) return;
        setInterviews(items);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load interviews",
        );
        setInterviews([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ready, userId]);

  const removeInterview = useCallback(async (session: InterviewSession) => {
    await deleteInterviewClient(session);
    setInterviews((prev) => prev.filter((item) => item.id !== session.id));
  }, []);

  return { interviews, loading, error, user, removeInterview };
}

export function useInterview(id: string) {
  const { user, ready } = useAuth();
  const userId = user?.id;
  const [interview, setInterview] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !userId || !id) return;

    let active = true;
    setLoading(true);

    void getInterviewClient(id)
      .then((item) => {
        if (!active) return;
        if (!item || (item.ownerId && item.ownerId !== userId)) {
          setInterview(null);
          setError("Interview not found");
          return;
        }
        setInterview(item);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load interview",
        );
        setInterview(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ready, userId, id]);

  const removeInterview = useCallback(async () => {
    if (!interview) return;
    await deleteInterviewClient(interview);
    setInterview(null);
  }, [interview]);

  return { interview, loading, error, removeInterview };
}

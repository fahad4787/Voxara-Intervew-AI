"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { saveInterviewClient } from "@/lib/db/interviews.client";
import {
  DEFAULT_DURATION_MINUTES,
  DIFFICULTY_OPTIONS,
} from "@/lib/utils/constants";
import type { InterviewSession } from "@/types/interview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type CreateInterviewResponse = InterviewSession & { persisted?: boolean };

export function InterviewForm({
  onCancel,
  onSuccess,
}: {
  onCancel?: () => void;
  onSuccess?: (session: InterviewSession) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    candidateName: "",
    candidateEmail: "",
    difficulty: "junior" as "junior" | "mid" | "senior",
    durationMinutes: DEFAULT_DURATION_MINUTES,
    jobDescription: "",
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await apiFetch<CreateInterviewResponse>("/api/interviews", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const { persisted, ...session } = result;
      if (!persisted) {
        await saveInterviewClient(session);
      }

      onSuccess?.(session);
      router.push(`/interviews/${session.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create interview");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Role / interview title"
          name="title"
          placeholder="Frontend Intern"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <Input
          label="Candidate name"
          name="candidateName"
          placeholder="Alex Rivera"
          value={form.candidateName}
          onChange={(e) =>
            setForm((f) => ({ ...f, candidateName: e.target.value }))
          }
          required
        />
        <Input
          label="Candidate email (optional)"
          name="candidateEmail"
          type="email"
          placeholder="alex@email.com"
          value={form.candidateEmail}
          onChange={(e) =>
            setForm((f) => ({ ...f, candidateEmail: e.target.value }))
          }
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">
            Difficulty
          </span>
          <select
            className="h-11 rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-ring)]"
            value={form.difficulty}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                difficulty: e.target.value as typeof form.difficulty,
              }))
            }
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Duration (minutes)"
          name="durationMinutes"
          type="number"
          min={10}
          max={60}
          value={form.durationMinutes}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              durationMinutes: Number(e.target.value),
            }))
          }
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Job description"
            name="jobDescription"
            placeholder="Paste the full JD here. The AI will generate questions and scoring criteria from it."
            value={form.jobDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, jobDescription: e.target.value }))
            }
            required
            className="min-h-40"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onCancel?.()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Generate AI interview
        </Button>
      </div>
    </form>
  );
}

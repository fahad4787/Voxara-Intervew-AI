"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { saveInterviewClient } from "@/lib/db/interviews.client";
import {
  DEFAULT_DURATION_MINUTES,
  DIFFICULTY_OPTIONS,
  DURATION_OPTIONS,
} from "@/lib/utils/constants";
import type { InterviewSession } from "@/types/interview";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils/cn";

type CreateInterviewResponse = InterviewSession & { persisted?: boolean };

export function InterviewForm({
  onCancel,
  onSuccess,
  layout = "default",
}: {
  onCancel?: () => void;
  onSuccess?: (session: InterviewSession) => void;
  layout?: "default" | "modal";
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

  const fields = (
    <div className="space-y-5">
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
        <Select
          label="Difficulty"
          name="difficulty"
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
        </Select>
        <Select
          label="Duration"
          name="durationMinutes"
          value={form.durationMinutes}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              durationMinutes: Number(e.target.value),
            }))
          }
        >
          {DURATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <Textarea
            label="Job description"
            name="jobDescription"
            placeholder="Paste the full JD here. Questions and scoring criteria are generated from it."
            value={form.jobDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, jobDescription: e.target.value }))
            }
            required
            className="min-h-40"
          />
        </div>
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}
    </div>
  );

  const actions = (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={() => onCancel?.()}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button type="submit" loading={loading} brand>
        Create interview
      </Button>
    </div>
  );

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        layout === "modal" && "flex min-h-0 flex-1 flex-col",
        layout === "default" && "space-y-5",
      )}
    >
      {layout === "modal" ? (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {fields}
          </div>
          <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4 sm:px-6">
            {actions}
          </div>
        </>
      ) : (
        <>
          {fields}
          {actions}
        </>
      )}
    </form>
  );
}

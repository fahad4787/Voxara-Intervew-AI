"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function InviteLink({
  token,
  interviewId,
  candidateEmail,
  className,
  compact = false,
}: {
  token: string;
  interviewId?: string;
  candidateEmail?: string;
  className?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`/interview/${token}`);
  const [emailing, setEmailing] = useState(false);
  const [emailNote, setEmailNote] = useState<string | null>(null);

  useEffect(() => {
    setUrl(`${window.location.origin}/interview/${token}`);
  }, [token]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const emailInvite = async () => {
    if (!interviewId) return;
    setEmailing(true);
    setEmailNote(null);
    try {
      await apiFetch(`/api/interviews/${interviewId}/invite`, {
        method: "POST",
      });
      setEmailNote(
        candidateEmail
          ? `Invite sent to ${candidateEmail}`
          : "Invite email sent",
      );
    } catch (err) {
      setEmailNote(
        err instanceof Error ? err.message : "Could not send invite email",
      );
    } finally {
      setEmailing(false);
    }
  };

  if (compact) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        iconOnly
        onClick={() => void copy()}
        leadingIcon={copied ? Check : Copy}
        aria-label={copied ? "Invite copied" : "Copy invite link"}
        title={copied ? "Copied" : "Copy invite"}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="flex-1 truncate rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 font-[family-name:var(--font-data)] text-xs text-[var(--ink-muted)]">
          {url}
        </code>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void copy()}
          leadingIcon={copied ? Check : Copy}
        >
          {copied ? "Copied" : "Copy invite"}
        </Button>
        <Button
          href={`/interview/${token}`}
          variant="secondary"
          size="sm"
          target="_blank"
          rel="noreferrer"
        >
          Open room
        </Button>
        {interviewId && candidateEmail ? (
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={Mail}
            loading={emailing}
            onClick={() => void emailInvite()}
          >
            Email invite
          </Button>
        ) : null}
      </div>
      {emailNote ? (
        <p className="text-xs text-[var(--ink-muted)]">{emailNote}</p>
      ) : null}
    </div>
  );
}

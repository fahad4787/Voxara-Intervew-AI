"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function InviteLink({
  token,
  className,
  compact = false,
}: {
  token: string;
  className?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`/interview/${token}`);

  useEffect(() => {
    setUrl(`${window.location.origin}/interview/${token}`);
  }, [token]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
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
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center",
        className,
      )}
    >
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
    </div>
  );
}

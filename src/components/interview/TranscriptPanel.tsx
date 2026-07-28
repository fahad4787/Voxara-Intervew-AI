"use client";

import type { InterviewMessage } from "@/types/interview";
import { cn } from "@/lib/utils/cn";

export function TranscriptPanel({
  messages,
  className,
}: {
  messages: InterviewMessage[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 overflow-y-auto", className)}>
      {messages
        .filter((m) => m.role !== "system")
        .map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              message.role === "assistant"
                ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "ml-auto bg-[var(--surface-elevated)] text-[var(--ink)] border border-[var(--border)]",
            )}
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-70">
              {message.role === "assistant" ? "Ava · AI Interviewer" : "You"}
            </p>
            <p>{message.content}</p>
          </div>
        ))}
    </div>
  );
}

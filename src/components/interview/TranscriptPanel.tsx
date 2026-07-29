"use client";

import { useEffect, useRef } from "react";
import type { InterviewMessage } from "@/types/interview";
import { cn } from "@/lib/utils/cn";

export function TranscriptPanel({
  messages,
  className,
}: {
  messages: InterviewMessage[];
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const visible = messages.filter((m) => m.role !== "system");

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [visible.length, visible[visible.length - 1]?.content]);

  return (
    <div
      ref={scrollerRef}
      className={cn("flex min-h-0 flex-col gap-3 overflow-y-auto", className)}
    >
      {visible.map((message) => (
        <div
          key={message.id}
          className={cn(
            "max-w-[92%] shrink-0 rounded-2xl px-4 py-3 text-sm leading-relaxed",
            message.role === "assistant"
              ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
              : "ml-auto border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--ink)]",
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

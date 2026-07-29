import type { ReactNode } from "react";
import { INTERVIEW_COLS } from "@/components/interviews/interviewGrid";
import { cn } from "@/lib/utils/cn";

export function InterviewTable({
  children,
  className,
  flush = false,
}: {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <div
      className={cn(
        flush ? "border-0" : "border-y border-[var(--border)]",
        className,
      )}
    >
      <div
        className={cn(
          "hidden border-b border-[var(--border)] py-2.5 font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)] sm:grid sm:items-center sm:gap-4",
          INTERVIEW_COLS,
          flush ? "px-5 sm:px-6" : undefined,
        )}
      >
        <span>Role</span>
        <span>Status</span>
        <span>Score</span>
        <span>Created</span>
        <span className="text-right">Actions</span>
      </div>
      <div className={cn(flush && "px-5 sm:px-6")}>{children}</div>
    </div>
  );
}

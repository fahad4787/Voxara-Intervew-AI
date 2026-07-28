import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
        {label ? (
          <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "min-h-36 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-ring)]",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
            className,
          )}
          {...props}
        />
        {error ? (
          <span className="text-xs text-rose-600">{error}</span>
        ) : hint ? (
          <span className="text-xs text-[var(--ink-muted)]">{hint}</span>
        ) : null}
      </label>
    );
  },
);

Textarea.displayName = "Textarea";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
        {label ? (
          <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-ring)]",
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

Input.displayName = "Input";

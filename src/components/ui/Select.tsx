import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, id, children, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <label className="flex w-full flex-col gap-1.5" htmlFor={selectId}>
        {label ? (
          <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-white bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat px-3.5 pr-10 text-sm text-[var(--ink)] outline-none transition-colors focus:border-[var(--accent)]",
            error && "border-rose-400 focus:border-rose-500",
            className,
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238b94a3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          }}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <span className="text-xs text-rose-600">{error}</span>
        ) : hint ? (
          <span className="text-xs text-[var(--ink-muted)]">{hint}</span>
        ) : null}
      </label>
    );
  },
);

Select.displayName = "Select";

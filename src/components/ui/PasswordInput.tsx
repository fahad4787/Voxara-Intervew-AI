"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  getPasswordStrength,
  passwordStrengthMeta,
} from "@/lib/utils/password";

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  hint?: string;
  error?: string;
  showStrength?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      label,
      hint,
      error,
      id,
      showStrength = false,
      value,
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const inputId = id || props.name;
    const password = typeof value === "string" ? value : "";
    const strength = getPasswordStrength(password);
    const meta = strength === "empty" ? null : passwordStrengthMeta[strength];

    return (
      <div className="flex w-full flex-col gap-1.5">
        <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
          {label ? (
            <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
          ) : null}
          <div className="relative">
            <input
              ref={ref}
              id={inputId}
              type={visible ? "text" : "password"}
              value={value}
              className={cn(
                "h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 pr-11 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-ring)]",
                error &&
                  "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
                className,
              )}
              {...props}
            />
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--ink-muted)] transition hover:text-[var(--ink)]"
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </label>

        {showStrength && meta ? (
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 3 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full bg-[var(--surface-muted)]",
                    index < meta.bars && meta.barClass,
                  )}
                />
              ))}
            </div>
            <p className={cn("text-xs font-medium", meta.textClass)}>
              Password strength: {meta.label}
            </p>
          </div>
        ) : null}

        {error ? (
          <span className="text-xs text-rose-600">{error}</span>
        ) : hint ? (
          <span className="text-xs text-[var(--ink-muted)]">{hint}</span>
        ) : null}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

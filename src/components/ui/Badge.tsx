import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const tones = {
  neutral: "bg-[var(--surface-muted)] text-[var(--ink-muted)]",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  info: "bg-sky-50 text-sky-700",
  brand: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
} as const;

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

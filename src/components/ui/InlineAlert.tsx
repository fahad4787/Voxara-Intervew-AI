import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const tones = {
  error:
    "border-rose-200 bg-rose-50 text-rose-800",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-[var(--border)] bg-[var(--steel-soft)] text-[var(--steel)]",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
} as const;

export function InlineAlert({
  tone = "error",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: keyof typeof tones;
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border px-3.5 py-2.5 text-sm",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

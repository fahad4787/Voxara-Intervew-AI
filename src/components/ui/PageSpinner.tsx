import { cn } from "@/lib/utils/cn";

export function PageSpinner({
  label,
  className,
  fill = true,
}: {
  label?: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-[var(--ink-muted)]",
        fill &&
          "min-h-[min(28rem,calc(100dvh-var(--dashboard-header-h,4rem)-3rem))]",
        className,
      )}
    >
      <div className="page-loader" aria-hidden>
        <span className="page-loader-track" />
        <span className="page-loader-ring" />
      </div>
      {label ? (
        <p className="font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.16em]">
          {label}
        </p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}

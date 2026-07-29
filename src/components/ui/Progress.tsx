import { cn } from "@/lib/utils/cn";

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[var(--accent)]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function ScoreRing({
  score,
  size = 88,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-muted)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold text-[var(--ink)]">{score}</span>
        {label ? (
          <span className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)]">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]",
        className,
      )}
    />
  );
}

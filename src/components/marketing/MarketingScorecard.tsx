import { Badge } from "@/components/ui/Badge";
import { Progress, ScoreRing } from "@/components/ui/Progress";
import { BodyText } from "@/components/ui/Typography";
import { cn } from "@/lib/utils/cn";

const DEMO_SCORES = [
  { label: "Content", value: 78 },
  { label: "Clarity", value: 72 },
  { label: "Confidence", value: 68 },
  { label: "Relevance", value: 81 },
] as const;

export function MarketingScorecard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-soft)] sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <ScoreRing score={74} label="Overall" />
        <div className="min-w-0 flex-1">
          <Badge tone="success">Hire</Badge>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--ink)]">
            Good performance
          </p>
          <BodyText className="mt-2 text-sm">
            Strong on shipping tradeoffs. Follow-ups asked for metrics; answers
            stayed concrete with transcript evidence.
          </BodyText>
        </div>
      </div>

      <div className="mt-6 space-y-3 border-t border-[var(--border)] pt-5">
        {DEMO_SCORES.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-[var(--ink-muted)]">{row.label}</span>
              <span className="font-[family-name:var(--font-data)] font-medium text-[var(--ink)]">
                {row.value}
              </span>
            </div>
            <Progress value={row.value} />
          </div>
        ))}
      </div>
    </div>
  );
}

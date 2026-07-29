import { cn } from "@/lib/utils/cn";

/** 12 bars — lighter paint than a dense spectrum */
const WAVEFORM_BARS = [
  42, 68, 52, 86, 48, 74, 39, 81, 55, 70, 44, 78,
] as const;

/** Server component — CSS-only motion. */
export function HeroWaveform({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "waveform-stage waveform-stage--hero relative flex h-24 w-full items-end gap-1 sm:h-32",
        className,
      )}
      aria-hidden
    >
      {WAVEFORM_BARS.map((height, index) => (
        <span
          key={index}
          className={cn(
            "flex-1 rounded-full waveform-bar",
            index % 4 === 0 ? "bg-[var(--accent)]/75" : "bg-[var(--ink)]/18",
          )}
          style={{
            height: `${height}%`,
            animationDelay: `${(index % 5) * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function RecBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-[family-name:var(--font-data)] text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ink)]",
        className,
      )}
    >
      <span className="rec-dot inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
      Rec · live room
    </span>
  );
}

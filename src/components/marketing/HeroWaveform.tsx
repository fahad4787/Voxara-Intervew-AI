import { cn } from "@/lib/utils/cn";

const WAVEFORM_BARS = [
  42, 68, 52, 86, 48, 74, 39, 81, 55, 70, 44, 78,
] as const;

export function WaveformBars({
  variant = "hero",
  className,
  heights = WAVEFORM_BARS,
}: {
  variant?: "hero" | "live";
  className?: string;
  heights?: readonly number[];
}) {
  const accentEvery = variant === "hero" ? 4 : 5;
  const accentClass =
    variant === "hero" ? "bg-[var(--accent)]/75" : "bg-[var(--accent)]/90";
  const idleClass =
    variant === "hero" ? "bg-[var(--ink)]/18" : "bg-white/40";

  return (
    <div
      className={cn(
        "waveform-stage flex items-end gap-1",
        variant === "hero"
          ? "waveform-stage--hero relative h-24 w-full sm:h-32"
          : "waveform-stage--live h-14",
        className,
      )}
      aria-hidden
    >
      {heights.map((height, index) => (
        <span
          key={index}
          className={cn(
            "flex-1 rounded-full waveform-bar",
            index % accentEvery === 0 ? accentClass : idleClass,
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

export function HeroWaveform({ className }: { className?: string }) {
  return <WaveformBars variant="hero" className={className} />;
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

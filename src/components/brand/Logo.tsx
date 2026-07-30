import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/utils/constants";

/** Same pill silhouette as the hero / auth waveform. */
const LOGO_BARS = [
  { height: 42, tone: "ink" },
  { height: 72, tone: "accent" },
  { height: 52, tone: "ink" },
  { height: 88, tone: "accent" },
  { height: 46, tone: "ink" },
] as const;

export function LogoMark({
  className,
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <span className={cn("logo-mark", className)} aria-hidden>
      <span className="logo-mark-bars">
        {LOGO_BARS.map((bar, index) => (
          <span
            key={index}
            className={cn(
              "logo-mark-bar",
              bar.tone === "accent"
                ? "logo-mark-bar--accent"
                : "logo-mark-bar--ink",
              animate && "logo-mark-bar--live",
            )}
            style={{
              height: `${bar.height}%`,
              animationDelay: `${index * 100}ms`,
            }}
          />
        ))}
      </span>
    </span>
  );
}

export function Logo({
  href = "/",
  showWordmark = true,
  className,
}: {
  href?: string;
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3", className)}
    >
      <LogoMark />
      {showWordmark ? (
        <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--ink)]">
          {APP_NAME}
        </span>
      ) : null}
    </Link>
  );
}

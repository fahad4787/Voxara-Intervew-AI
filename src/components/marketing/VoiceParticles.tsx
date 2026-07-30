import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

/** Soft accent motes — CSS only, transform/opacity, ~12 nodes. */
const PARTICLES = [
  { left: "8%", size: 3, dur: 9.5, delay: 0, dx: 18, tone: "accent" },
  { left: "16%", size: 2, dur: 11, delay: 1.4, dx: -10, tone: "ink" },
  { left: "24%", size: 4, dur: 8.2, delay: 0.6, dx: 22, tone: "accent" },
  { left: "35%", size: 2, dur: 12, delay: 2.1, dx: -14, tone: "ink" },
  { left: "44%", size: 3, dur: 9, delay: 0.3, dx: 8, tone: "accent" },
  { left: "52%", size: 2, dur: 10.5, delay: 3.2, dx: -20, tone: "ink" },
  { left: "61%", size: 3, dur: 8.8, delay: 1.1, dx: 14, tone: "accent" },
  { left: "70%", size: 2, dur: 11.5, delay: 2.6, dx: -8, tone: "ink" },
  { left: "78%", size: 4, dur: 9.2, delay: 0.9, dx: 16, tone: "accent" },
  { left: "86%", size: 2, dur: 10.8, delay: 1.8, dx: -12, tone: "ink" },
  { left: "12%", size: 2, dur: 13, delay: 4.1, dx: 6, tone: "accent" },
  { left: "93%", size: 3, dur: 8.6, delay: 3.5, dx: -18, tone: "accent" },
] as const;

export function VoiceParticles({
  className,
  density = "full",
}: {
  className?: string;
  density?: "full" | "soft";
}) {
  const nodes = density === "soft" ? PARTICLES.slice(0, 7) : PARTICLES;

  return (
    <div className={cn("voice-particles", className)} aria-hidden>
      {nodes.map((p, i) => (
        <span
          key={i}
          className={cn(
            "voice-particle",
            p.tone === "accent"
              ? "voice-particle--accent"
              : "voice-particle--ink",
          )}
          style={
            {
              left: p.left,
              "--size": `${p.size}px`,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--dx": `${p.dx}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function SignalRings({ className }: { className?: string }) {
  return (
    <div className={cn("signal-rings", className)} aria-hidden>
      <span className="signal-ring signal-ring--a" />
      <span className="signal-ring signal-ring--b" />
    </div>
  );
}

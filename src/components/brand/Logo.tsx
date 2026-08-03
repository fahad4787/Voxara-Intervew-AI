"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/utils/constants";

const V_PATH = "M7.5 8C11.5 16.5 14.2 22.2 16 24.5C17.8 22.2 20.5 16.5 24.5 8";
const CYCLE_MS = 3600;

/** Live-interview voice bars — heights as fraction of mark size. */
const WAVE_PATTERN = [0.22, 0.48, 0.72, 0.4, 0.88, 0.55, 0.7, 0.36, 0.6] as const;

type VoiceBurst = {
  life: number;
  maxLife: number;
  bars: number[];
  phases: number[];
};

function spawnVoiceBurst(): VoiceBurst {
  return {
    life: 0,
    maxLife: 0.95,
    bars: WAVE_PATTERN.map((h) => h * (0.85 + Math.random() * 0.3)),
    phases: WAVE_PATTERN.map(() => Math.random() * Math.PI * 2),
  };
}

export function LogoMark({
  className,
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `logo-v-${uid}`;
  const wrapRef = useRef<HTMLSpanElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const echoRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<SVGCircleElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wrap = wrapRef.current;
    const stroke = strokeRef.current;
    const echo = echoRef.current;
    const bead = beadRef.current;
    const fx = fxRef.current;
    if (!wrap || !stroke || !echo || !bead || !fx) return;

    const ctx = fx.getContext("2d");
    if (!ctx) return;

    const length = stroke.getTotalLength();
    stroke.style.strokeDasharray = `${length}`;
    echo.style.strokeDasharray = `${length}`;

    let burst: VoiceBurst | null = null;
    let phase: "draw" | "hold" | "undraw" = "draw";
    let raf = 0;
    let start = performance.now();
    let last = start;

    const resizeFx = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = wrap.clientWidth || 42;
      fx.width = Math.round(size * dpr);
      fx.height = Math.round(size * dpr);
      fx.style.width = `${size}px`;
      fx.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeFx();
    const ro = new ResizeObserver(resizeFx);
    ro.observe(wrap);

    const tick = (now: number) => {
      const paused = document.documentElement.classList.contains("is-scrolling");
      const dt = Math.min((now - last) / 1000, 0.05);
      if (paused) {
        start += now - last;
        last = now;
        raf = requestAnimationFrame(tick);
        return;
      }
      last = now;

      const size = wrap.clientWidth || 42;
      const t = ((now - start) % CYCLE_MS) / CYCLE_MS;

      let dash = 0;
      let strokeOpacity = 1;
      if (t < 0.28) {
        phase = "draw";
        burst = null;
        const u = t / 0.28;
        dash = length * (1 - u);
        strokeOpacity = 0.55 + 0.45 * u;
      } else if (t < 0.58) {
        phase = "hold";
        dash = 0;
        strokeOpacity = 1;
      } else {
        if (phase !== "undraw") {
          burst = spawnVoiceBurst();
          phase = "undraw";
        }
        const u = (t - 0.58) / 0.42;
        dash = -length * Math.min(u * 1.35, 1);
        strokeOpacity = Math.max(0, 1 - u * 1.8);
      }
      stroke.style.strokeDashoffset = `${dash}`;
      stroke.style.opacity = `${strokeOpacity}`;

      let echoOpacity = 0;
      let echoScale = 1;
      if (t > 0.26 && t < 0.7) {
        const u = (t - 0.26) / 0.44;
        echoOpacity = Math.sin(u * Math.PI) * 0.45;
        echoScale = 1 + u * 0.35;
      }
      echo.style.opacity = `${echoOpacity}`;
      echo.style.transform = `scale(${echoScale})`;
      echo.style.transformOrigin = "16px 16px";

      const beadT = t < 0.06 ? 0 : t > 0.58 ? 1 : (t - 0.06) / 0.52;
      const pt = stroke.getPointAtLength(Math.min(Math.max(beadT, 0), 1) * length);
      bead.setAttribute("cx", `${pt.x}`);
      bead.setAttribute("cy", `${pt.y}`);
      bead.style.opacity = t > 0.08 && t < 0.58 ? "1" : "0";

      ctx.clearRect(0, 0, size, size);

      if (burst) {
        burst.life += dt;
        const lifeT = Math.min(burst.life / burst.maxLife, 1);
        if (lifeT >= 1) {
          burst = null;
        } else {
          const appear = lifeT < 0.18 ? lifeT / 0.18 : 1;
          const fade = lifeT > 0.65 ? 1 - (lifeT - 0.65) / 0.35 : 1;
          const alpha = appear * fade;
          const midY = size * 0.52;
          const barCount = burst.bars.length;
          const gap = size * 0.045;
          const barW = (size * 0.62 - gap * (barCount - 1)) / barCount;
          const startX = size * 0.19;

          // Soft stage glow behind the utterance
          const glow = ctx.createRadialGradient(
            size * 0.5,
            midY,
            0,
            size * 0.5,
            midY,
            size * 0.42,
          );
          glow.addColorStop(0, `rgba(45, 212, 191, ${0.22 * alpha})`);
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(size * 0.5, midY, size * 0.42, 0, Math.PI * 2);
          ctx.fill();

          // Live REC pip — interview room cue
          const recPulse = 0.65 + Math.sin(burst.life * 10) * 0.35;
          ctx.globalAlpha = alpha * recPulse;
          ctx.fillStyle = "#5eead4";
          ctx.beginPath();
          ctx.arc(size * 0.18, size * 0.2, size * 0.045, 0, Math.PI * 2);
          ctx.fill();

          // Voice waveform bars
          for (let i = 0; i < barCount; i++) {
            const wobble =
              0.72 +
              Math.sin(burst.life * 14 + burst.phases[i]) * 0.28;
            const h = burst.bars[i] * size * wobble * (0.75 + 0.25 * appear);
            const x = startX + i * (barW + gap);
            const y = midY - h / 2;
            const accent = i % 2 === 0;

            ctx.globalAlpha = alpha * (accent ? 1 : 0.7);
            ctx.fillStyle = accent ? "#5eead4" : "rgba(240, 243, 247, 0.85)";
            ctx.beginPath();
            const r = Math.min(barW / 2, 2);
            ctx.roundRect(x, y, barW, h, r);
            ctx.fill();
          }

          ctx.globalAlpha = 1;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [animate]);

  return (
    <span
      ref={wrapRef}
      className={cn("logo-mark", animate && "logo-mark--live", className)}
      aria-hidden
    >
      <canvas ref={fxRef} className="logo-mark-fx" />
      <svg
        className="logo-mark-svg"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="7.5"
            y1="8"
            x2="24.5"
            y2="8"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#dce3ec" />
            <stop offset="50%" stopColor="#f3f7fb" />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>
        </defs>

        <path
          ref={echoRef}
          className="logo-mark-echo"
          d={V_PATH}
          stroke="#5eead4"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          ref={strokeRef}
          className="logo-mark-stroke"
          d={V_PATH}
          stroke={`url(#${gradId})`}
          strokeWidth="3.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          ref={beadRef}
          className="logo-mark-bead"
          r="2.1"
          cx="7.5"
          cy="8"
          fill="#9ff5e4"
        />
      </svg>
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
      className={cn("logo-lockup inline-flex items-center gap-2.5", className)}
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

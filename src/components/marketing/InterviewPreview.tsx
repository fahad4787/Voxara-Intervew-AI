import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/utils/constants";

/** Fewer bars = cheaper paint; CSS motion via .waveform-bar */
const PREVIEW_BARS = [28, 52, 68, 40, 74, 48, 62, 36, 70, 44, 58, 66] as const;

/** Server component — CSS waveform (same motion as hero). */
export function InterviewPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--ink)] shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="relative flex aspect-[16/11] flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <div>
              <p className="text-sm font-medium text-white">{APP_NAME}</p>
              <p className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.16em] text-white/50">
                Live interview room
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-white">
            <span className="rec-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Ava speaking
          </span>
        </div>

        <div className="mt-auto space-y-3">
          <div
            className="waveform-stage waveform-stage--live flex h-14 items-end gap-1 rounded-xl bg-white/8 p-3"
            aria-hidden
          >
            {PREVIEW_BARS.map((height, index) => (
              <span
                key={index}
                className={cn(
                  "flex-1 rounded-full waveform-bar",
                  index % 5 === 0 ? "bg-[var(--accent)]/90" : "bg-white/40",
                )}
                style={{
                  height: `${height}%`,
                  animationDelay: `${(index % 5) * 90}ms`,
                }}
              />
            ))}
          </div>
          <div className="rounded-xl bg-[#0a0c10] p-4 text-white">
            <p className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.16em] text-white/50">
              Current question
            </p>
            <p className="mt-1.5 text-sm leading-relaxed sm:text-[15px]">
              Tell me about a time you shipped something with incomplete
              requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

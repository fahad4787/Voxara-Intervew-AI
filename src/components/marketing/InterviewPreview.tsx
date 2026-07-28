import { Badge } from "@/components/ui/Badge";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/utils/constants";

export function InterviewPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[#0b1220] shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-40 hero-grid" />
      <div className="relative flex aspect-[16/11] flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8 shadow-none" />
            <div>
              <p className="text-sm font-medium text-white">{APP_NAME}</p>
              <p className="text-xs text-white/55">Live interview room</p>
            </div>
          </div>
          <Badge tone="brand">Ava is speaking</Badge>
        </div>

        <div className="mt-auto space-y-3">
          <div className="h-16 overflow-hidden rounded-2xl bg-white/12 p-3">
            <div className="flex h-full items-end gap-1">
              {Array.from({ length: 28 }).map((_, index) => (
                <span
                  key={index}
                  className="flex-1 rounded-full bg-[var(--accent)]/80 waveform-bar"
                  style={{
                    height: `${28 + ((index * 17) % 55)}%`,
                    animationDelay: `${index * 40}ms`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-black/70 p-4 text-white">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">
              Current question
            </p>
            <p className="mt-1 text-sm leading-relaxed sm:text-base">
              Tell me about a time you shipped something with incomplete
              requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

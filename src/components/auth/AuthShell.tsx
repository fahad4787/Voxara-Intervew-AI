import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { RecBadge, WaveformBars } from "@/components/marketing/HeroWaveform";
import { BodyText, DisplayTitle, Eyebrow } from "@/components/ui/Typography";
import {
  APP_NAME,
  APP_TAGLINE,
  AUTH_HIGHLIGHTS,
} from "@/lib/utils/constants";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r border-[var(--border)] lg:flex">
        <div className="auth-panel absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 hero-grille opacity-40" />
        <span className="auth-orb auth-orb--a" aria-hidden />
        <span className="auth-orb auth-orb--b" aria-hidden />

        <div className="relative flex h-full w-full flex-col justify-between gap-12 p-10 xl:p-12">
          <div className="flex items-center justify-between gap-4">
            <Logo href="/" />
            <RecBadge />
          </div>

          <div className="max-w-md space-y-8">
            <div>
              <Eyebrow>{APP_TAGLINE}</Eyebrow>
              <p className="auth-mark mt-5 font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,3.75rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-[var(--ink)]">
                {APP_NAME}
              </p>
              <DisplayTitle as="h2" size="md" className="mt-5">
                Hire with conversation, not guesswork.
              </DisplayTitle>
              <BodyText className="mt-4">
                Paste a job description. Ava asks out loud, listens live, and
                leaves a scorecard your team can defend.
              </BodyText>
            </div>

            <WaveformBars
              variant="hero"
              className="h-16 max-w-sm sm:h-20"
              heights={[38, 62, 48, 78, 44, 70, 36, 74, 52, 66, 42, 72]}
            />
            <p className="font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
              Ava speaking · room ready
            </p>

            <ul className="space-y-3 border-t border-[var(--border)] pt-5">
              {AUTH_HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-[var(--ink-muted)]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-[var(--ink-faint)]">
            © {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      </aside>

      <main className="relative flex min-h-screen flex-col bg-[var(--surface-elevated)]">
        <div className="pointer-events-none absolute inset-0 auth-form-shell" />
        <div className="relative flex items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-8 lg:px-10">
          <div className="lg:hidden">
            <Logo href="/" />
          </div>
          <div className="hidden lg:block" />
          <Link
            href="/"
            className="text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
          >
            Back to home
          </Link>
        </div>

        <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 px-5 py-7 shadow-[var(--shadow-soft)] sm:px-7 sm:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

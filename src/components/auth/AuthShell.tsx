import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
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
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="relative flex h-full w-full flex-col justify-between gap-12 p-10 xl:p-12">
          <Logo href="/" />

          <div className="max-w-md animate-float-in space-y-8">
            <div>
              <Eyebrow>{APP_TAGLINE}</Eyebrow>
              <DisplayTitle as="h2" size="md" className="mt-4">
                Hire with conversation, not guesswork.
              </DisplayTitle>
              <BodyText className="mt-4">
                {APP_NAME} runs voice interviews from your job description and
                delivers scored feedback your team can trust.
              </BodyText>
            </div>

            <ul className="space-y-3">
              {AUTH_HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-[var(--border)]/80 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink-muted)]"
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

      <main className="relative flex min-h-screen flex-col bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-8 lg:px-10">
          <div className="lg:hidden">
            <Logo href="/" />
          </div>
          <div className="hidden lg:block" />
          <Link
            href="/"
            className="text-sm text-[var(--ink-muted)] transition hover:text-[var(--ink)]"
          >
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
          <div className="w-full max-w-md animate-float-in">{children}</div>
        </div>
      </main>
    </div>
  );
}

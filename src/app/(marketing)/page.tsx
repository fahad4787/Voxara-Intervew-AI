import { Section } from "@/components/layout/Container";
import { HeroWaveform, RecBadge } from "@/components/marketing/HeroWaveform";
import { InterviewPreview } from "@/components/marketing/InterviewPreview";
import { MarketingCtas } from "@/components/marketing/MarketingCtas";
import { BodyText, DisplayTitle } from "@/components/ui/Typography";
import { MARKETING_FEATURES, MARKETING_STEPS } from "@/lib/marketing/content";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/utils/constants";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="pointer-events-none absolute inset-0 hero-atmosphere" />
        <div className="pointer-events-none absolute inset-0 hero-grille" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16">
          <div className="max-w-3xl">
            <RecBadge className="mb-6 reveal-on-load" />
            <p className="reveal-on-load reveal-delay-1 font-[family-name:var(--font-display)] text-[clamp(3.25rem,12vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-[var(--ink)]">
              {APP_NAME}
            </p>
            <h1 className="reveal-on-load reveal-delay-2 mt-6 max-w-xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-3xl">
              Hire by the conversation.
            </h1>
            <BodyText className="reveal-on-load reveal-delay-3 mt-4 max-w-lg text-base sm:text-lg">
              {APP_DESCRIPTION}
            </BodyText>
            <MarketingCtas className="reveal-on-load reveal-delay-4 mt-8 flex flex-wrap items-center gap-3" />
          </div>

          <div className="reveal-on-load reveal-delay-3 mt-12 sm:mt-16">
            <HeroWaveform />
            <p className="mt-3 font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
              Ava speaking · candidate listening
            </p>
          </div>
        </div>
      </section>

      <Section className="!py-12 sm:!py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 xl:gap-12">
          <div className="reveal">
            <p className="font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Inside the room
            </p>
            <DisplayTitle as="h2" size="md" className="mt-2 max-w-md">
              A live booth, not a form.
            </DisplayTitle>
            <BodyText className="mt-3 max-w-md">
              Candidates join a link, turn on camera, and talk to Ava. You get
              the transcript and a scorecard when the call ends.
            </BodyText>
          </div>
          <InterviewPreview className="reveal reveal-delay-2 w-full" />
        </div>
      </Section>

      <Section tone="muted" divided>
        <div className="reveal">
          <p className="font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            What you run
          </p>
          <DisplayTitle as="h2" size="md" className="mt-3 max-w-xl">
            Built for the hiring call you wish you could clone.
          </DisplayTitle>
        </div>
        <ul className="mt-10 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {MARKETING_FEATURES.map((feature, index) => (
            <li
              key={feature.title}
              className={`reveal grid gap-3 py-6 sm:grid-cols-[2.5rem_1fr] sm:gap-5 reveal-delay-${(index % 4) + 1}`}
            >
              <feature.icon
                className="mt-0.5 h-5 w-5 text-[var(--accent)]"
                aria-hidden
              />
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">
                  {feature.title}
                </h3>
                <BodyText className="mt-1 text-sm">{feature.description}</BodyText>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="reveal">
          <p className="font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            From open to score
          </p>
          <DisplayTitle as="h2" size="md" className="mt-3 max-w-xl">
            Same flow every hire.
          </DisplayTitle>
          <BodyText className="mt-3 max-w-lg">
            Three stages of a real interview day — not a product checklist.
          </BodyText>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          {MARKETING_STEPS.map((step, index) => (
            <div
              key={step.stage}
              className={`reveal reveal-delay-${index + 1}`}
            >
              <p className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
                {step.stage}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--ink)]">
                {step.title}
              </h3>
              <BodyText className="mt-2 text-sm">{step.description}</BodyText>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <div className="reveal relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute inset-0 auth-panel" />
          <div className="relative max-w-xl">
            <RecBadge className="mb-5" />
            <DisplayTitle as="h2" size="md">
              Roll tape on the next interview.
            </DisplayTitle>
            <BodyText className="mt-3">
              Create a session from a job description and review the scorecard
              when Ava hangs up.
            </BodyText>
            <MarketingCtas className="mt-8 flex flex-wrap items-center gap-3" />
          </div>
        </div>
      </Section>
    </>
  );
}

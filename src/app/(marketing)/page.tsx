import { Section, SectionHeader } from "@/components/layout/Container";
import { HeroWaveform, RecBadge } from "@/components/marketing/HeroWaveform";
import { InterviewPreview } from "@/components/marketing/InterviewPreview";
import { MarketingCtas } from "@/components/marketing/MarketingCtas";
import { MarketingScorecard } from "@/components/marketing/MarketingScorecard";
import { Badge } from "@/components/ui/Badge";
import { BodyText, DisplayTitle } from "@/components/ui/Typography";
import { MARKETING_FEATURES, MARKETING_STEPS } from "@/lib/marketing/content";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/utils/constants";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="pointer-events-none absolute inset-0 hero-atmosphere" />
        <div className="pointer-events-none absolute inset-0 hero-grille" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
            <div>
              <RecBadge className="mb-4 reveal-on-load" />
              <p className="reveal-on-load reveal-delay-1 font-[family-name:var(--font-display)] text-[clamp(2.75rem,8vw,5.75rem)] font-extrabold leading-[0.9] tracking-[-0.045em] text-[var(--ink)]">
                {APP_NAME}
              </p>
              <h1 className="reveal-on-load reveal-delay-2 mt-4 max-w-xl font-[family-name:var(--font-display)] text-xl font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-2xl">
                Hire by the conversation.
              </h1>
              <BodyText className="reveal-on-load reveal-delay-3 mt-3 max-w-md text-sm sm:text-base">
                {APP_DESCRIPTION}
              </BodyText>
              <MarketingCtas className="reveal-on-load reveal-delay-4 mt-6 flex flex-wrap items-center gap-3" />
              <div className="reveal-on-load reveal-delay-3 mt-10">
                <HeroWaveform />
                <p className="mt-3 font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                  Ava speaking · candidate listening
                </p>
              </div>
            </div>

            <InterviewPreview className="reveal-on-load reveal-delay-2 w-full" />
          </div>
        </div>
      </section>

      <Section tone="muted" divided={false} className="border-t border-[var(--border)]">
        <SectionHeader
          eyebrow="What you run"
          title="Built for the hiring call you wish you could clone."
          className="reveal"
        />
        <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
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
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
          <div className="reveal">
            <SectionHeader
              eyebrow="The scorecard"
              title="Evidence you can defend in a hiring meeting."
              description="Same ScoreRing, badges, and progress bars you use in the dashboard — content first, polish second."
              className="mb-0"
            />
          </div>
          <MarketingScorecard className="reveal reveal-delay-2" />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeader
          eyebrow="From open to score"
          title="Same flow every hire."
          description="Three stages of a real interview day — not a product checklist."
          className="reveal"
        />
        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {MARKETING_STEPS.map((step, index) => (
            <div
              key={step.stage}
              className={`reveal reveal-delay-${index + 1}`}
            >
              <Badge tone="brand">{step.stage}</Badge>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--ink)]">
                {step.title}
              </h3>
              <BodyText className="mt-2 text-sm">{step.description}</BodyText>
            </div>
          ))}
        </div>
      </Section>

      <Section>
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

import { Section, SectionHeader } from "@/components/layout/Container";
import { InterviewPreview } from "@/components/marketing/InterviewPreview";
import { MarketingCtas } from "@/components/marketing/MarketingCtas";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  BodyText,
  DisplayTitle,
  Eyebrow,
  IconTile,
} from "@/components/ui/Typography";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
  MARKETING_FEATURES,
  MARKETING_STEPS,
} from "@/lib/utils/constants";

export default function HomePage() {
  return (
    <>
      <Section divided={false}>
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -mx-4 hero-grid opacity-50 sm:-mx-6" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="animate-float-in">
              <Eyebrow className="mb-4">{APP_TAGLINE}</Eyebrow>
              <DisplayTitle size="xl" className="max-w-xl">
                {APP_NAME}
              </DisplayTitle>
              <BodyText className="mt-5 max-w-xl text-base sm:text-lg">
                {APP_DESCRIPTION}
              </BodyText>
              <MarketingCtas className="mt-8 flex flex-wrap items-center gap-3" />
            </div>

            <div
              className="animate-float-in"
              style={{ animationDelay: "120ms" }}
            >
              <InterviewPreview />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeader
          eyebrow="Product"
          title="Everything you need to run fairer interviews"
          description="From job description to scored report — one consistent flow for recruiters and candidates."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MARKETING_FEATURES.map((feature, index) => (
            <Card
              key={feature.title}
              className="animate-float-in"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <CardContent className="pt-5">
                <IconTile className="mb-4">
                  <feature.icon className="h-5 w-5" />
                </IconTile>
                <h3 className="font-semibold text-[var(--ink)]">
                  {feature.title}
                </h3>
                <BodyText className="mt-2 text-sm">{feature.description}</BodyText>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="How it works"
          title="Three steps from JD to decision"
          description="Keep hiring consistent without losing the human signal in conversation."
          align="center"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {MARKETING_STEPS.map((step, index) => (
            <Card
              key={step.title}
              className="animate-float-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="space-y-4 pt-5">
                <div className="flex items-center gap-3">
                  <Badge tone="brand">{index + 1}</Badge>
                  <IconTile>
                    <step.icon className="h-5 w-5" />
                  </IconTile>
                </div>
                <h3 className="font-semibold text-[var(--ink)]">{step.title}</h3>
                <BodyText className="text-sm">{step.description}</BodyText>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <Card className="overflow-hidden">
          <CardContent className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute inset-0 auth-panel opacity-80" />
            <div className="relative mx-auto max-w-2xl text-center animate-float-in">
              <Eyebrow className="mb-3">Ready when you are</Eyebrow>
              <DisplayTitle as="h2" size="md">
                Start interviewing with {APP_NAME}
              </DisplayTitle>
              <BodyText className="mx-auto mt-3 max-w-lg">
                Create interviews from a job description and review scored
                candidate reports from one admin portal.
              </BodyText>
              <MarketingCtas className="mt-7 flex flex-wrap items-center justify-center gap-3" />
            </div>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}

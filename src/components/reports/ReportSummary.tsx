import type { InterviewReport } from "@/types/interview";
import { recommendationLabel, scoreLabel } from "@/lib/utils/format";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Progress, ScoreRing } from "@/components/ui/Progress";

const metricKeys = [
  ["content", "Content"],
  ["communication", "Communication"],
  ["confidence", "Confidence"],
  ["grammar", "Grammar"],
  ["clarity", "Clarity"],
  ["relevance", "Relevance"],
] as const;

export function ReportSummary({ report }: { report: InterviewReport }) {
  const incomplete =
    report.scores.overall <= 0 ||
    report.speechMetrics.totalWords === 0 ||
    (report.feedback.recommendation === "no_hire" &&
      report.feedback.evidenceQuotes.length === 0 &&
      report.feedback.strengths.length === 0);

  const recTone =
    report.feedback.recommendation === "strong_hire" ||
    report.feedback.recommendation === "hire"
      ? "success"
      : report.feedback.recommendation === "maybe"
        ? "warning"
        : "danger";

  const defaultOpen = [
    "overview",
    "scores",
    "feedback",
    ...(report.feedback.evidenceQuotes.length > 0 ? ["evidence"] : []),
  ];

  return (
    <Accordion type="multiple" defaultValue={defaultOpen}>
      <AccordionItem
        id="overview"
        title="Overall score"
        meta={
          incomplete
            ? "Incomplete"
            : `${scoreLabel(report.scores.overall)} · ${recommendationLabel(report.feedback.recommendation)}`
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <ScoreRing score={report.scores.overall} label="Overall" />
          <div className="min-w-0 flex-1">
            <Badge tone={recTone}>
              {incomplete
                ? "Incomplete"
                : recommendationLabel(report.feedback.recommendation)}
            </Badge>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)] sm:text-2xl">
              {incomplete
                ? "Not enough signal to score"
                : `${scoreLabel(report.scores.overall)} performance`}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
              {report.feedback.summary}
            </p>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem id="scores" title="Score breakdown" meta="Six metrics">
        <div className="space-y-3.5">
          {metricKeys.map(([key, label]) => (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-[var(--ink-muted)]">{label}</span>
                <span className="font-[family-name:var(--font-data)] text-base font-bold tabular-nums text-[var(--ink)]">
                  {report.scores[key]}
                </span>
              </div>
              <Progress value={report.scores[key]} />
            </div>
          ))}
        </div>
      </AccordionItem>

      <AccordionItem
        id="speech"
        title="Speech signals"
        meta={`${report.speechMetrics.totalWords} words`}
      >
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Words" value={String(report.speechMetrics.totalWords)} />
          <Metric
            label="Fillers"
            value={String(report.speechMetrics.fillerWordCount)}
          />
          <Metric
            label="Avg WPM"
            value={String(report.speechMetrics.averageWordsPerMinute)}
          />
          <Metric
            label="Hedging"
            value={String(report.speechMetrics.hedgingPhraseCount)}
          />
        </div>
      </AccordionItem>

      <AccordionItem id="feedback" title="Feedback" meta="Strengths & gaps">
        <div className="grid gap-3">
          <NotesList
            title="Strengths"
            items={report.feedback.strengths}
            tone="success"
          />
          <NotesList
            title="Improvements"
            items={report.feedback.improvements}
            tone="info"
          />
          <NotesList
            title="Grammar"
            items={report.feedback.grammarNotes}
            tone="neutral"
          />
          <NotesList
            title="Confidence & clarity"
            tone="warning"
            items={[
              ...report.feedback.confidenceNotes,
              ...report.feedback.clarityNotes,
            ]}
          />
        </div>
      </AccordionItem>

      {report.feedback.evidenceQuotes.length > 0 ? (
        <AccordionItem
          id="evidence"
          title="Evidence"
          meta={`${report.feedback.evidenceQuotes.length} quotes`}
        >
          <div className="space-y-2">
            {report.feedback.evidenceQuotes.map((quote) => (
              <blockquote
                key={quote}
                className="border-l-2 border-[var(--accent)] pl-4 text-sm italic text-[var(--ink-muted)]"
              >
                “{quote}”
              </blockquote>
            ))}
          </div>
        </AccordionItem>
      ) : null}
    </Accordion>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
      <p className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
        {label}
      </p>
      <p className="font-[family-name:var(--font-data)] text-2xl font-bold tabular-nums text-[var(--ink)]">
        {value}
      </p>
    </div>
  );
}

const noteTones = {
  success: {
    wrap: "border-emerald-200 bg-emerald-50",
    label: "text-emerald-700",
    dot: "bg-emerald-500",
    text: "text-emerald-900",
  },
  info: {
    wrap: "border-sky-200 bg-sky-50",
    label: "text-sky-700",
    dot: "bg-sky-500",
    text: "text-sky-900",
  },
  warning: {
    wrap: "border-amber-200 bg-amber-50",
    label: "text-amber-700",
    dot: "bg-amber-500",
    text: "text-amber-900",
  },
  neutral: {
    wrap: "border-[var(--border)] bg-[var(--surface-muted)]",
    label: "text-[var(--ink-faint)]",
    dot: "bg-[var(--ink-faint)]",
    text: "text-[var(--ink-muted)]",
  },
} as const;

function NotesList({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: keyof typeof noteTones;
}) {
  const t = noteTones[tone];
  return (
    <div className={`rounded-xl border p-4 ${t.wrap}`}>
      <h4
        className={`mb-2.5 font-[family-name:var(--font-data)] text-[10px] font-semibold uppercase tracking-[0.15em] ${t.label}`}
      >
        {title}
      </h4>
      {items.length === 0 ? (
        <p className={`text-sm opacity-60 ${t.text}`}>No notes</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span
                className={`mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full ${t.dot}`}
              />
              <span className={`text-sm leading-relaxed ${t.text}`}>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

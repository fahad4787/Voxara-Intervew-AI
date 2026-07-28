import type { InterviewReport } from "@/types/interview";
import {
  recommendationLabel,
  scoreLabel,
} from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
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
    report.feedback.recommendation === "no_hire" &&
      report.feedback.evidenceQuotes.length === 0 &&
      report.feedback.strengths.length === 0;

  const recTone =
    report.feedback.recommendation === "strong_hire" ||
    report.feedback.recommendation === "hire"
      ? "success"
      : report.feedback.recommendation === "maybe"
        ? "warning"
        : "danger";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <ScoreRing score={report.scores.overall} label="Overall" />
            <div>
              <Badge tone={recTone}>
                {incomplete
                  ? "Incomplete"
                  : recommendationLabel(report.feedback.recommendation)}
              </Badge>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                {incomplete
                  ? "Not enough signal to score"
                  : `${scoreLabel(report.scores.overall)} performance`}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-muted)]">
                {report.feedback.summary}
              </p>
              <p className="mt-3 max-w-xl text-xs leading-relaxed text-[var(--ink-faint)]">
                Scores prioritize substance and specificity over polished
                English. Speech metrics are measured from the transcript;
                confidence/clarity are model judgments with light filler
                adjustments. Speech-to-text errors for tools (Figma, Miro,
                Sketch, Jira) are interpreted charitably — vague or incomplete
                answers are not.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h4 className="font-medium text-[var(--ink)]">Score breakdown</h4>
          </CardHeader>
          <CardContent className="space-y-4">
            {metricKeys.map(([key, label]) => (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-[var(--ink-muted)]">{label}</span>
                  <span className="font-medium text-[var(--ink)]">
                    {report.scores[key]}
                  </span>
                </div>
                <Progress value={report.scores[key]} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h4 className="font-medium text-[var(--ink)]">Speech signals</h4>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Metric
              label="Total words"
              value={String(report.speechMetrics.totalWords)}
            />
            <Metric
              label="Filler words"
              value={String(report.speechMetrics.fillerWordCount)}
            />
            <Metric
              label="Avg WPM"
              value={String(report.speechMetrics.averageWordsPerMinute)}
            />
            <Metric
              label="Hedging phrases"
              value={String(report.speechMetrics.hedgingPhraseCount)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <NotesCard title="Strengths" items={report.feedback.strengths} />
        <NotesCard
          title="Improvements"
          items={report.feedback.improvements}
        />
        <NotesCard
          title="Grammar notes"
          items={report.feedback.grammarNotes}
        />
        <NotesCard
          title="Confidence & clarity"
          items={[
            ...report.feedback.confidenceNotes,
            ...report.feedback.clarityNotes,
          ]}
        />
      </div>

      {report.feedback.evidenceQuotes.length > 0 ? (
        <Card>
          <CardHeader>
            <h4 className="font-medium text-[var(--ink)]">Evidence quotes</h4>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.feedback.evidenceQuotes.map((quote) => (
              <blockquote
                key={quote}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm italic text-[var(--ink-muted)]"
              >
                “{quote}”
              </blockquote>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-3">
      <p className="text-xs text-[var(--ink-muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[var(--ink)]">{value}</p>
    </div>
  );
}

function NotesCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <h4 className="font-medium text-[var(--ink)]">{title}</h4>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-[var(--ink-muted)]">No notes</p>
        ) : (
          <ul className="space-y-2 text-sm text-[var(--ink-muted)]">
            {items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

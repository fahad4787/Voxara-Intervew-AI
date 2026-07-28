"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { BodyText, DisplayTitle, Eyebrow } from "@/components/ui/Typography";
import { VideoPreview } from "@/components/interview/VideoPreview";

export function ConsentGate({
  candidateName,
  stream,
  mediaError,
  onEnableMedia,
  onAccept,
  loading,
}: {
  candidateName: string;
  stream: MediaStream | null;
  mediaError: string | null;
  onEnableMedia: () => void;
  onAccept: () => void;
  loading?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-72 bg-[#0b1220] p-4 sm:p-6">
          <VideoPreview stream={stream} className="h-full min-h-64" />
          <div className="absolute left-8 top-8 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
            Camera check
          </div>
        </div>
        <CardContent className="flex flex-col justify-center gap-5 p-6 sm:p-8">
          <div>
            <Eyebrow>Before you begin</Eyebrow>
            <DisplayTitle as="h2" size="md" className="mt-2">
              Hi {candidateName}
            </DisplayTitle>
            <BodyText className="mt-3 text-sm">
              This interview is conducted by an AI interviewer with voice
              questions. Your camera and microphone will be used, and your
              answers will be transcribed for evaluation.
            </BodyText>
          </div>

          <ul className="space-y-2 text-sm text-[var(--ink-muted)]">
            <li>• Find a quiet place with stable internet</li>
            <li>• Speak clearly — follow-up questions adapt to your answers</li>
            <li>• You can finish early when ready</li>
          </ul>

          {mediaError ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {mediaError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onEnableMedia}>
              {stream ? "Camera ready" : "Enable camera & mic"}
            </Button>
            <Button onClick={onAccept} loading={loading} disabled={!stream}>
              I consent — start interview
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

import { ApiError } from "@/lib/api/response";
import {
  buildInterviewInviteEmail,
  type InviteEmailInput,
} from "@/lib/email/invite";

export type SendEmailResult =
  | { sent: true; id?: string }
  | { sent: false; skipped: true; reason: string }
  | { sent: false; error: string };

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendInterviewInvite(
  input: InviteEmailInput,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      sent: false,
      skipped: true,
      reason:
        "RESEND_API_KEY is not set. Add it to .env.local to email invite links.",
    };
  }

  const fromRaw =
    process.env.EMAIL_FROM?.trim() ||
    `${process.env.EMAIL_FROM_NAME?.trim() || "Voxara"} <onboarding@resend.dev>`;
  const from = fromRaw.replace(/^["']|["']$/g, "");

  const { subject, text, html } = buildInterviewInviteEmail(input);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject,
        text,
        html,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      name?: string;
    };

    if (!response.ok) {
      return {
        sent: false,
        error:
          payload.message ||
          payload.name ||
          `Email provider returned ${response.status}`,
      };
    }

    return { sent: true, id: payload.id };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendInterviewInviteOrThrow(input: InviteEmailInput) {
  const result = await sendInterviewInvite(input);
  if (result.sent) return result;
  if ("skipped" in result && result.skipped) {
    throw new ApiError(503, result.reason, "EMAIL_NOT_CONFIGURED");
  }
  throw new ApiError(
    502,
    "error" in result ? result.error : "Failed to send invite email",
    "EMAIL_SEND_FAILED",
  );
}

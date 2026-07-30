import { APP_NAME } from "@/lib/utils/constants";
import { absoluteUrl } from "@/lib/utils/format";

export type InviteEmailInput = {
  to: string;
  candidateName: string;
  title: string;
  token: string;
  durationMinutes: number;
};

export function buildInterviewInviteEmail(input: InviteEmailInput) {
  const roomUrl = absoluteUrl(`/interview/${input.token}`);
  const subject = `Your ${APP_NAME} interview: ${input.title}`;
  const year = new Date().getFullYear();
  const name = escapeHtml(input.candidateName);
  const title = escapeHtml(input.title);
  const minutes = input.durationMinutes;

  const text = [
    `Hi ${input.candidateName},`,
    ``,
    `You're invited to a voice interview for ${input.title}.`,
    `Expected length: about ${minutes} minutes.`,
    ``,
    `Open your interview room (no login required):`,
    roomUrl,
    ``,
    `Use Chrome or Edge with a working microphone and camera.`,
    `When you finish, you'll see a thank-you page with your session summary.`,
    ``,
    `— ${APP_NAME}`,
  ].join("\n");

  // Email-safe HTML: tables + inline styles only.
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#e8ecf1;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Your voice interview for ${title} is ready — open the room and speak with Ava.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e8ecf1;margin:0;padding:0;width:100%;">
    <tr>
      <td align="center" style="padding:36px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;border-collapse:separate;">
          <tr>
            <td style="background:#ffffff;border:1px solid #cfd6df;border-radius:20px;overflow:hidden;box-shadow:0 8px 28px rgba(18,22,31,0.07);">

              <!-- Hero -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background:linear-gradient(160deg,#0b1220 0%,#12161f 55%,#0f766e 160%);padding:28px 28px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td valign="middle" style="width:44px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#0b1220;border:1px solid rgba(240,243,247,0.12);border-radius:12px;width:40px;height:40px;">
                            <tr>
                              <td align="center" valign="bottom" style="padding:8px 7px 7px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width:4px;height:10px;background:rgba(240,243,247,0.55);border-radius:999px;"></td>
                                    <td style="width:3px;"></td>
                                    <td style="width:4px;height:18px;background:#2dd4bf;border-radius:999px;"></td>
                                    <td style="width:3px;"></td>
                                    <td style="width:4px;height:12px;background:rgba(240,243,247,0.55);border-radius:999px;"></td>
                                    <td style="width:3px;"></td>
                                    <td style="width:4px;height:22px;background:#2dd4bf;border-radius:999px;"></td>
                                    <td style="width:3px;"></td>
                                    <td style="width:4px;height:11px;background:rgba(240,243,247,0.55);border-radius:999px;"></td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td valign="middle" style="padding-left:12px;">
                          <div style="font-family:Syne,Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#f0f3f7;line-height:1;">
                            ${APP_NAME}
                          </div>
                          <div style="font-family:IBM Plex Mono,Consolas,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(240,243,247,0.55);padding-top:4px;">
                            Voice-first AI interviews
                          </div>
                        </td>
                        <td align="right" valign="middle">
                          <span style="display:inline-block;font-family:IBM Plex Mono,Consolas,monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#2dd4bf;background:rgba(45,212,191,0.12);border:1px solid rgba(45,212,191,0.28);border-radius:999px;padding:6px 10px;">
                            ● Live room
                          </span>
                        </td>
                      </tr>
                    </table>

                    <div style="font-family:Syne,Arial,Helvetica,sans-serif;font-size:28px;font-weight:800;letter-spacing:-0.03em;color:#ffffff;line-height:1.15;padding-top:28px;">
                      You’re invited to interview.
                    </div>
                    <div style="font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.55;color:rgba(240,243,247,0.72);padding-top:10px;max-width:420px;">
                      Speak with Ava for <strong style="color:#ffffff;">${title}</strong>. No account. No forms. Just your voice.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:28px;">
                    <div style="font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:16px;color:#12161f;line-height:1.5;">
                      Hi <strong>${name}</strong>,
                    </div>
                    <div style="font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:15px;color:#5a6472;line-height:1.6;padding-top:10px;">
                      Your hiring team set up a short voice session. Open the room when you’re ready — mic and camera stay in your browser.
                    </div>

                    <!-- Meta chips -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="padding-top:20px;padding-bottom:8px;">
                      <tr>
                        <td style="padding-right:8px;padding-bottom:8px;">
                          <span style="display:inline-block;font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:12px;font-weight:600;color:#0d5c56;background:#e7f5f3;border-radius:999px;padding:8px 12px;">
                            ${minutes} min session
                          </span>
                        </td>
                        <td style="padding-right:8px;padding-bottom:8px;">
                          <span style="display:inline-block;font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:12px;font-weight:600;color:#3a5f8a;background:#e4ebf3;border-radius:999px;padding:8px 12px;">
                            No login needed
                          </span>
                        </td>
                        <td style="padding-bottom:8px;">
                          <span style="display:inline-block;font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:12px;font-weight:600;color:#5a6472;background:#f0f2f6;border-radius:999px;padding:8px 12px;">
                            Score summary after
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="padding-top:12px;padding-bottom:8px;">
                      <tr>
                        <td>
                          <a href="${roomUrl}" style="display:inline-block;font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;background:#0f766e;border-radius:999px;padding:14px 22px;box-shadow:0 6px 16px rgba(15,118,110,0.28);">
                            Open interview room →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Link box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding-top:18px;">
                      <tr>
                        <td style="background:#f7f8fa;border:1px solid #cfd6df;border-radius:14px;padding:14px 16px;">
                          <div style="font-family:IBM Plex Mono,Consolas,monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#8b94a3;padding-bottom:8px;">
                            Direct room link
                          </div>
                          <a href="${roomUrl}" style="font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:12px;line-height:1.5;color:#3a5f8a;word-break:break-all;text-decoration:underline;">
                            ${roomUrl}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Tips -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding-top:22px;">
                      <tr>
                        <td style="border-top:1px solid #e8ecf1;padding-top:18px;">
                          <div style="font-family:Syne,Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#12161f;padding-bottom:10px;">
                            Before you start
                          </div>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:13px;color:#5a6472;line-height:1.55;padding:0 0 8px 0;">
                                <span style="color:#0f766e;font-weight:700;">1.</span>&nbsp; Use Chrome or Edge on a quiet connection
                              </td>
                            </tr>
                            <tr>
                              <td style="font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:13px;color:#5a6472;line-height:1.55;padding:0 0 8px 0;">
                                <span style="color:#0f766e;font-weight:700;">2.</span>&nbsp; Allow microphone and camera when asked
                              </td>
                            </tr>
                            <tr>
                              <td style="font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:13px;color:#5a6472;line-height:1.55;padding:0;">
                                <span style="color:#0f766e;font-weight:700;">3.</span>&nbsp; After Ava wraps, you’ll see your thank-you summary
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background:#f7f8fa;border-top:1px solid #e8ecf1;padding:18px 28px 22px;">
                    <div style="font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:12px;color:#8b94a3;line-height:1.5;">
                      Sent by ${APP_NAME} · Hire by the conversation.
                    </div>
                    <div style="font-family:IBM Plex Sans,Segoe UI,Arial,sans-serif;font-size:11px;color:#b8c0cc;padding-top:6px;">
                      © ${year} ${APP_NAME}. If you weren’t expecting this, you can ignore the email.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { subject, text, html, roomUrl };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

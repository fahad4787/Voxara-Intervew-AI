import { NextRequest } from "next/server";
import { fail, ok, parseJson } from "@/lib/api/response";
import {
  clearSessionCookie,
  createSessionCookie,
} from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson<{ idToken?: string }>(request);
    if (!body.idToken) {
      return fail(new Error("Missing idToken"));
    }

    if (!isAdminConfigured()) {
      return ok({ signedIn: true, sessionCookie: false });
    }

    await createSessionCookie(body.idToken);
    return ok({ signedIn: true, sessionCookie: true });
  } catch (error) {
    // Client auth can continue even if session cookie creation fails.
    console.warn("Session cookie skipped", error);
    return ok({ signedIn: true, sessionCookie: false });
  }
}

export async function DELETE() {
  try {
    if (isAdminConfigured()) {
      await clearSessionCookie();
    }
    return ok({ signedOut: true });
  } catch (error) {
    return ok({ signedOut: true });
  }
}

import { cookies } from "next/headers";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import {
  getBearerToken,
  verifyFirebaseIdToken,
  type VerifiedUser,
} from "@/lib/auth/verify-id-token";

export const SESSION_COOKIE_NAME = "__session";
const SESSION_DAYS = 14;

export async function createSessionCookie(idToken: string) {
  if (!isAdminConfigured()) return;

  const expiresIn = SESSION_DAYS * 24 * 60 * 60 * 1000;
  const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
    expiresIn,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<VerifiedUser | null> {
  if (!isAdminConfigured()) return null;

  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!session) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      name: decoded.name ?? decoded.email?.split("@")[0] ?? "Recruiter",
    };
  } catch {
    return null;
  }
}

export async function getRequestUser(
  request: Request,
): Promise<VerifiedUser | null> {
  const bearer = getBearerToken(request);
  if (bearer) {
    try {
      return await verifyFirebaseIdToken(bearer);
    } catch {
      return null;
    }
  }

  return getSessionUser();
}

export async function requireRequestUser(request: Request) {
  const user = await getRequestUser(request);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

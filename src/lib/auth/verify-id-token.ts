import { createRemoteJWKSet, jwtVerify } from "jose";

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  "interviewai-39afc";

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export type VerifiedUser = {
  uid: string;
  email: string;
  name: string;
};

export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<VerifiedUser> {
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const uid = typeof payload.sub === "string" ? payload.sub : "";
  if (!uid) {
    throw new Error("Invalid Firebase ID token");
  }

  const email = typeof payload.email === "string" ? payload.email : "";
  const name =
    typeof payload.name === "string"
      ? payload.name
      : email.split("@")[0] || "Admin";

  return { uid, email, name };
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

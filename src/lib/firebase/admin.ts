import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccountJson = {
  projectId?: string;
  project_id?: string;
  clientEmail?: string;
  client_email?: string;
  privateKey?: string;
  private_key?: string;
};

function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseServiceAccountJson(raw: string): ServiceAccountJson {
  const candidates = [raw];

  // Hostinger sometimes stores env values with wrapping quotes.
  const unquoted = stripWrappingQuotes(raw);
  if (unquoted !== raw) candidates.push(unquoted);

  // Support base64-encoded service account JSON (recommended on Hostinger).
  if (!unquoted.trimStart().startsWith("{")) {
    try {
      candidates.push(Buffer.from(unquoted, "base64").toString("utf8"));
    } catch {
      // ignore
    }
  }

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as ServiceAccountJson;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `FIREBASE_SERVICE_ACCOUNT_KEY is invalid JSON (${
      lastError instanceof Error ? lastError.message : "parse failed"
    }). Paste one-line JSON, or set FIREBASE_SERVICE_ACCOUNT_KEY_BASE64.`,
  );
}

function getServiceAccount(): ServiceAccountJson | null {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64?.trim();
  if (base64) {
    try {
      const decoded = Buffer.from(
        stripWrappingQuotes(base64),
        "base64",
      ).toString("utf8");
      return parseServiceAccountJson(decoded);
    } catch (error) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is invalid (${
          error instanceof Error ? error.message : "decode failed"
        }).`,
      );
    }
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) return null;
  return parseServiceAccountJson(raw);
}

export function isAdminConfigured() {
  try {
    return Boolean(getServiceAccount());
  } catch {
    // Present but unparseable — treat as configured so create surfaces the error.
    return Boolean(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim() ||
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64?.trim(),
    );
  }
}

function initAdminApp(): App {
  if (getApps().length) {
    return getApps()[0]!;
  }

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_KEY (or FIREBASE_SERVICE_ACCOUNT_KEY_BASE64).",
    );
  }

  const projectId =
    serviceAccount.projectId ||
    serviceAccount.project_id ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    "interviewai-39afc";

  const privateKey = (
    serviceAccount.privateKey ||
    serviceAccount.private_key ||
    ""
  ).replace(/\\n/g, "\n");

  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "Firebase service account private_key is missing or corrupted in env.",
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail: serviceAccount.clientEmail || serviceAccount.client_email,
      privateKey,
    }),
    projectId,
  });
}

export function getAdminApp() {
  return initAdminApp();
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

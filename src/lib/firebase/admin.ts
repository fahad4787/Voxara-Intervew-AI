import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as {
      projectId?: string;
      project_id?: string;
      clientEmail?: string;
      client_email?: string;
      privateKey?: string;
      private_key?: string;
    };
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON (stringified service account).",
    );
  }
}

export function isAdminConfigured() {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim());
}

function initAdminApp(): App {
  if (getApps().length) {
    return getApps()[0]!;
  }

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_KEY. Add your Firebase service account JSON to .env.local.",
    );
  }

  const projectId =
    serviceAccount.projectId ||
    serviceAccount.project_id ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    "interviewai-39afc";

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail: serviceAccount.clientEmail || serviceAccount.client_email,
      privateKey: (
        serviceAccount.privateKey ||
        serviceAccount.private_key ||
        ""
      ).replace(/\\n/g, "\n"),
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

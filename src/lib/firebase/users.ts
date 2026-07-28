import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { AuthUser } from "@/lib/auth/types";

export async function isClientSetupComplete() {
  try {
    const snap = await getDoc(doc(getClientDb(), "meta", "setup"));
    return snap.exists() && snap.data()?.complete === true;
  } catch {
    return false;
  }
}

export async function ensureUserProfile(input: {
  uid: string;
  name: string;
  email: string;
}): Promise<AuthUser> {
  const db = getClientDb();
  const ref = doc(db, "users", input.uid);
  const existing = await getDoc(ref);
  const createdAt =
    existing.exists() && typeof existing.data().createdAt === "string"
      ? (existing.data().createdAt as string)
      : new Date().toISOString();

  const profile = {
    name: input.name,
    email: input.email,
    role: "superadmin",
    createdAt,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(
    ref,
    {
      ...profile,
      updatedAtServer: serverTimestamp(),
    },
    { merge: true },
  );

  return {
    id: input.uid,
    name: profile.name,
    email: profile.email,
    createdAt,
  };
}

export async function markClientSetupComplete(ownerId: string) {
  const ref = doc(getClientDb(), "meta", "setup");
  const existing = await getDoc(ref);
  if (existing.exists() && existing.data()?.complete === true) {
    return;
  }

  await setDoc(ref, {
    complete: true,
    ownerId,
    completedAt: new Date().toISOString(),
  });
}

export async function getUserProfile(uid: string): Promise<AuthUser | null> {
  const snap = await getDoc(doc(getClientDb(), "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: uid,
    name: String(data.name || "Admin"),
    email: String(data.email || ""),
    company: data.company ? String(data.company) : undefined,
    createdAt: String(data.createdAt || new Date().toISOString()),
  };
}

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import {
  normalizeUserRole,
  type AuthUser,
  type UserRole,
} from "@/lib/auth/types";

function mapProfile(
  uid: string,
  data: Record<string, unknown>,
): AuthUser {
  return {
    id: uid,
    name: String(data.name || "Admin"),
    email: String(data.email || ""),
    role: normalizeUserRole(data.role),
    company: data.company ? String(data.company) : undefined,
    createdAt: String(data.createdAt || new Date().toISOString()),
  };
}

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
  /** Only used when creating a brand-new profile. */
  role?: UserRole;
}): Promise<AuthUser> {
  const db = getClientDb();
  const ref = doc(db, "users", input.uid);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    const data = existing.data() as Record<string, unknown>;
    const createdAt =
      typeof data.createdAt === "string"
        ? data.createdAt
        : new Date().toISOString();
    const role = normalizeUserRole(data.role);
    const name = String(data.name || input.name);
    const email = String(data.email || input.email);

    await setDoc(
      ref,
      {
        name,
        email,
        role,
        createdAt,
        updatedAt: new Date().toISOString(),
        updatedAtServer: serverTimestamp(),
      },
      { merge: true },
    );

    return mapProfile(input.uid, {
      name,
      email,
      role,
      company: data.company,
      createdAt,
    });
  }

  const setupDone = await isClientSetupComplete();
  const role: UserRole =
    input.role ?? (setupDone ? "admin" : "superadmin");
  const createdAt = new Date().toISOString();

  await setDoc(ref, {
    name: input.name,
    email: input.email,
    role,
    createdAt,
    updatedAt: createdAt,
    updatedAtServer: serverTimestamp(),
  });

  return {
    id: input.uid,
    name: input.name,
    email: input.email,
    role,
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
  return mapProfile(uid, snap.data() as Record<string, unknown>);
}

export async function updateUserProfileFields(input: {
  uid: string;
  name?: string;
  company?: string;
}): Promise<AuthUser> {
  const ref = doc(getClientDb(), "users", input.uid);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    throw new Error("Profile not found");
  }

  const data = existing.data() as Record<string, unknown>;
  const name =
    input.name !== undefined
      ? input.name.trim()
      : String(data.name || "Admin");
  const company =
    input.company !== undefined
      ? input.company.trim() || undefined
      : data.company
        ? String(data.company)
        : undefined;

  if (!name || name.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }

  const patch: Record<string, unknown> = {
    name,
    updatedAt: new Date().toISOString(),
    updatedAtServer: serverTimestamp(),
  };

  if (input.company !== undefined) {
    if (company) {
      patch.company = company;
    } else {
      patch.company = null;
    }
  }

  await setDoc(ref, patch, { merge: true });

  return mapProfile(input.uid, {
    ...data,
    name,
    company,
  });
}

/** Roster for the Users screen — works without Admin SDK. */
export async function listPortalUsers(): Promise<AuthUser[]> {
  const snap = await getDocs(collection(getClientDb(), "users"));
  const users = snap.docs.map((item) =>
    mapProfile(item.id, item.data() as Record<string, unknown>),
  );
  return users.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

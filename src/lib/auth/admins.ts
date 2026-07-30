import { ApiError } from "@/lib/api/response";
import {
  normalizeUserRole,
  type AuthUser,
  type UserRole,
} from "@/lib/auth/types";
import type { VerifiedUser } from "@/lib/auth/verify-id-token";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";

export type AdminUserRecord = AuthUser;

function mapAdminDoc(
  id: string,
  data: Record<string, unknown>,
): AdminUserRecord {
  return {
    id,
    name: String(data.name || "Admin"),
    email: String(data.email || ""),
    role: normalizeUserRole(data.role),
    company: data.company ? String(data.company) : undefined,
    createdAt: String(data.createdAt || new Date().toISOString()),
  };
}

export async function getAdminProfile(
  uid: string,
): Promise<AdminUserRecord | null> {
  if (!isAdminConfigured()) return null;
  const snap = await getAdminDb().collection("users").doc(uid).get();
  if (!snap.exists) return null;
  return mapAdminDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function requirePortalAdmin(user: VerifiedUser) {
  if (!isAdminConfigured()) {
    throw new ApiError(
      503,
      "Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT_KEY to .env.local to add or remove admins.",
      "ADMIN_NOT_CONFIGURED",
    );
  }

  const profile = await getAdminProfile(user.uid);
  if (!profile) {
    const setup = await getAdminDb().collection("meta").doc("setup").get();
    const ownerId =
      setup.exists && typeof setup.data()?.ownerId === "string"
        ? (setup.data()!.ownerId as string)
        : null;

    if (ownerId && ownerId !== user.uid) {
      throw new ApiError(403, "Admin profile not found", "FORBIDDEN");
    }

    const createdAt = new Date().toISOString();
    const seeded = {
      name: user.name || "Admin",
      email: (user.email || "").toLowerCase(),
      role: "superadmin" as const,
      createdAt,
      updatedAt: createdAt,
    };
    await getAdminDb().collection("users").doc(user.uid).set(seeded, {
      merge: true,
    });
    return { id: user.uid, ...seeded };
  }
  return profile;
}

export async function requireSuperAdmin(user: VerifiedUser) {
  const profile = await requirePortalAdmin(user);
  if (profile.role !== "superadmin") {
    throw new ApiError(
      403,
      "Only the superadmin can manage users",
      "FORBIDDEN",
    );
  }
  return profile;
}

export async function listAdminUsers(): Promise<AdminUserRecord[]> {
  if (!isAdminConfigured()) return [];
  const snap = await getAdminDb().collection("users").orderBy("createdAt", "asc").get();
  return snap.docs.map((doc) =>
    mapAdminDoc(doc.id, doc.data() as Record<string, unknown>),
  );
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}): Promise<AdminUserRecord> {
  if (!isAdminConfigured()) {
    throw new ApiError(
      503,
      "Firebase Admin is not configured",
      "ADMIN_NOT_CONFIGURED",
    );
  }

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const role: UserRole = input.role ?? "admin";

  if (role === "superadmin") {
    throw new ApiError(
      400,
      "Cannot create another superadmin",
      "INVALID_ROLE",
    );
  }

  let uid: string;
  try {
    const user = await getAdminAuth().createUser({
      email,
      password: input.password,
      displayName: name,
      emailVerified: false,
    });
    uid = user.uid;
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : "";
    if (code === "auth/email-already-exists") {
      throw new ApiError(
        409,
        "An account with this email already exists",
        "EMAIL_EXISTS",
      );
    }
    if (code === "auth/invalid-password") {
      throw new ApiError(
        400,
        "Password must be at least 6 characters",
        "WEAK_PASSWORD",
      );
    }
    throw error;
  }

  const createdAt = new Date().toISOString();
  const profile = {
    name,
    email,
    role,
    createdAt,
    updatedAt: createdAt,
  };

  try {
    await getAdminDb().collection("users").doc(uid).set(profile);
  } catch (error) {
    try {
      await getAdminAuth().deleteUser(uid);
    } catch {
      // Best-effort rollback
    }
    throw error;
  }

  return { id: uid, ...profile };
}

export async function deleteAdminUser(input: {
  targetId: string;
  actorId: string;
}) {
  if (!isAdminConfigured()) {
    throw new ApiError(
      503,
      "Firebase Admin is not configured",
      "ADMIN_NOT_CONFIGURED",
    );
  }

  if (input.targetId === input.actorId) {
    throw new ApiError(400, "You cannot remove your own account", "SELF_DELETE");
  }

  const target = await getAdminProfile(input.targetId);
  if (!target) {
    throw new ApiError(404, "User not found", "NOT_FOUND");
  }

  if (target.role === "superadmin") {
    throw new ApiError(400, "Cannot remove the superadmin", "PROTECTED");
  }

  await getAdminAuth().deleteUser(input.targetId);
  await getAdminDb().collection("users").doc(input.targetId).delete();

  return { id: input.targetId };
}

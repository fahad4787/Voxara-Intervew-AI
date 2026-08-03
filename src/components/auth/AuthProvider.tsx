"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
import {
  ensureUserProfile,
  getUserProfile,
  isClientSetupComplete,
  markClientSetupComplete,
  updateUserProfileFields,
} from "@/lib/firebase/users";
import {
  clearClientAuthCookie,
  setClientAuthCookie,
} from "@/lib/auth/client-auth-cookie";
import { markSetupCompleteLocal } from "@/hooks/useSetupStatus";
import type { AuthUser } from "@/lib/auth/types";

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  signIn: (input: { email: string; password: string }) => Promise<AuthUser>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  updateProfileDetails: (input: {
    name: string;
    company?: string;
  }) => Promise<AuthUser>;
  changePassword: (input: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapAuthError(error: unknown) {
  if (!(error instanceof Error)) return "Authentication failed";
  const code = "code" in error ? String((error as { code?: string }).code) : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/requires-recent-login":
      return "For security, enter your current password and try again.";
    default:
      return error.message || "Authentication failed";
  }
}

async function syncServerSession(idToken: string) {
  try {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    // Optional — Admin session cookie is not required for client auth.
  }
}

async function clearServerSession() {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch {
    // ignore
  }
}

async function finishAuthSession(input: {
  uid: string;
  name: string;
  email: string;
  idToken: string;
}) {
  const profile = await ensureUserProfile({
    uid: input.uid,
    name: input.name,
    email: input.email,
  });
  await markClientSetupComplete(input.uid);
  markSetupCompleteLocal();
  setClientAuthCookie();
  await syncServerSession(input.idToken);
  return profile;
}

function sameUser(a: AuthUser | null, b: AuthUser | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.email === b.email &&
    a.name === b.name &&
    a.role === b.role
  );
}

function fallbackUser(firebaseUser: {
  uid: string;
  displayName: string | null;
  email: string | null;
}): AuthUser {
  return {
    id: firebaseUser.uid,
    name:
      firebaseUser.displayName ||
      firebaseUser.email?.split("@")[0] ||
      "Admin",
    email: firebaseUser.email || "",
    role: "admin",
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const applyUser = useCallback((next: AuthUser | null) => {
    setUser((prev) => (sameUser(prev, next) ? prev : next));
  }, []);

  useEffect(() => {
    const auth = getClientAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          applyUser(null);
          clearClientAuthCookie();
          return;
        }

        const profile = await getUserProfile(firebaseUser.uid);
        applyUser(profile || fallbackUser(firebaseUser));
        setClientAuthCookie();
      } catch (error) {
        console.error("Failed to load auth profile", error);
        if (firebaseUser) {
          applyUser(fallbackUser(firebaseUser));
          setClientAuthCookie();
        } else {
          applyUser(null);
          clearClientAuthCookie();
        }
      } finally {
        setReady(true);
      }
    });

    return () => unsubscribe();
  }, [applyUser]);

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        const credential = await signInWithEmailAndPassword(
          getClientAuth(),
          email.trim(),
          password,
        );
        const idToken = await credential.user.getIdToken();
        const profile = await finishAuthSession({
          uid: credential.user.uid,
          name:
            credential.user.displayName ||
            email.split("@")[0] ||
            "Admin",
          email: email.trim().toLowerCase(),
          idToken,
        });
        applyUser(profile);
        setReady(true);
        return profile;
      } catch (error) {
        throw new Error(mapAuthError(error));
      }
    },
    [applyUser],
  );

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => {
      try {
        if (await isClientSetupComplete()) {
          throw new Error("Superadmin already exists. Sign in instead.");
        }

        const credential = await createUserWithEmailAndPassword(
          getClientAuth(),
          email.trim(),
          password,
        );
        await updateProfile(credential.user, { displayName: name.trim() });
        const idToken = await credential.user.getIdToken();
        const profile = await finishAuthSession({
          uid: credential.user.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          idToken,
        });
        applyUser(profile);
        setReady(true);
        return profile;
      } catch (error) {
        throw new Error(mapAuthError(error));
      }
    },
    [applyUser],
  );

  const signOut = useCallback(async () => {
    await firebaseSignOut(getClientAuth());
    clearClientAuthCookie();
    await clearServerSession();
    applyUser(null);
  }, [applyUser]);

  const updateProfileDetails = useCallback(
    async ({ name, company }: { name: string; company?: string }) => {
      const authUser = getClientAuth().currentUser;
      if (!authUser) throw new Error("Sign in required");

      try {
        const trimmed = name.trim();
        await updateProfile(authUser, { displayName: trimmed });
        const profile = await updateUserProfileFields({
          uid: authUser.uid,
          name: trimmed,
          company,
        });
        applyUser(profile);
        return profile;
      } catch (error) {
        throw new Error(mapAuthError(error));
      }
    },
    [applyUser],
  );

  const changePassword = useCallback(
    async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const authUser = getClientAuth().currentUser;
      if (!authUser?.email) throw new Error("Sign in required");

      try {
        const credential = EmailAuthProvider.credential(
          authUser.email,
          currentPassword,
        );
        await reauthenticateWithCredential(authUser, credential);
        await updatePassword(authUser, newPassword);
      } catch (error) {
        const code =
          error && typeof error === "object" && "code" in error
            ? String((error as { code: string }).code)
            : "";
        if (
          code === "auth/wrong-password" ||
          code === "auth/invalid-credential"
        ) {
          throw new Error("Current password is incorrect.");
        }
        throw new Error(mapAuthError(error));
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      ready,
      signIn,
      signUp,
      signOut,
      updateProfileDetails,
      changePassword,
    }),
    [
      user,
      ready,
      signIn,
      signUp,
      signOut,
      updateProfileDetails,
      changePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

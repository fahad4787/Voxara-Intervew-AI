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
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
import {
  ensureUserProfile,
  getUserProfile,
  isClientSetupComplete,
  markClientSetupComplete,
} from "@/lib/firebase/users";
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
  await syncServerSession(input.idToken);
  return profile;
}

function sameUser(a: AuthUser | null, b: AuthUser | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.id === b.id && a.email === b.email && a.name === b.name;
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
          return;
        }

        const profile = await getUserProfile(firebaseUser.uid);
        applyUser(profile || fallbackUser(firebaseUser));
      } catch (error) {
        console.error("Failed to load auth profile", error);
        if (firebaseUser) {
          applyUser(fallbackUser(firebaseUser));
        } else {
          applyUser(null);
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
    await clearServerSession();
    applyUser(null);
  }, [applyUser]);

  const value = useMemo(
    () => ({ user, ready, signIn, signUp, signOut }),
    [user, ready, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

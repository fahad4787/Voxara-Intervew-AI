"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Spinner } from "@/components/ui/Progress";
import { BodyText, DisplayTitle } from "@/components/ui/Typography";
import { useSetupStatus } from "@/hooks/useSetupStatus";
import { getPasswordStrength } from "@/lib/utils/password";
import { APP_NAME } from "@/lib/utils/constants";

export function SignupForm() {
  const router = useRouter();
  const { signUp, user, ready } = useAuth();
  const setup = useSetupStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  useEffect(() => {
    if (setup.ready && setup.setupComplete && !user) {
      router.replace("/login");
    }
  }, [setup.ready, setup.setupComplete, user, router]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (getPasswordStrength(form.password) === "weak") {
      setError("Choose a stronger password before continuing.");
      return;
    }

    setLoading(true);
    try {
      await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
      setLoading(false);
    }
  };

  if (!ready || user || (setup.ready && setup.setupComplete)) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <DisplayTitle size="md">Create superadmin</DisplayTitle>
        <BodyText className="mt-2 text-sm">
          One-time setup for {APP_NAME}. This creates the only admin account for
          this portal.
        </BodyText>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Jordan Lee"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <Input
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          value={form.password}
          onChange={(e) =>
            setForm((f) => ({ ...f, password: e.target.value }))
          }
          showStrength
          required
          minLength={8}
        />
        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm((f) => ({ ...f, confirmPassword: e.target.value }))
          }
          error={
            form.confirmPassword && form.confirmPassword !== form.password
              ? "Passwords do not match"
              : undefined
          }
          required
          minLength={8}
        />

        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" loading={loading}>
          Create superadmin
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--ink-muted)]">
        Already set up?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--accent-strong)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

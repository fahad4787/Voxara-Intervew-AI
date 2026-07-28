"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { BodyText, DisplayTitle } from "@/components/ui/Typography";
import { useSetupStatus } from "@/hooks/useSetupStatus";

export function LoginForm() {
  const router = useRouter();
  const { signIn, user, ready } = useAuth();
  const setup = useSetupStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <DisplayTitle size="md">Welcome back</DisplayTitle>
        <BodyText className="mt-2 text-sm">
          Sign in to the admin portal to manage interviews and reports.
        </BodyText>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) =>
            setForm((f) => ({ ...f, password: e.target.value }))
          }
          required
        />

        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      {setup.needsSetup ? (
        <p className="text-center text-sm text-[var(--ink-muted)]">
          First time here?{" "}
          <Link
            href="/signup"
            className="font-medium text-[var(--accent-strong)] hover:underline"
          >
            Create superadmin
          </Link>
        </p>
      ) : null}
    </div>
  );
}

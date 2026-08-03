"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Input } from "@/components/ui/Input";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { BodyText, DisplayTitle, Eyebrow } from "@/components/ui/Typography";
import { useSetupStatus } from "@/hooks/useSetupStatus";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => safeNextPath(searchParams.get("next")),
    [searchParams],
  );
  const { signIn, user, ready } = useAuth();
  const setup = useSetupStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (ready && user) router.replace(nextPath);
  }, [ready, user, router, nextPath]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(form);
      router.replace(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
      setLoading(false);
    }
  };

  if (!ready || user) {
    return <PageSpinner fill={false} className="min-h-40 py-10" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Admin portal</Eyebrow>
        <DisplayTitle size="md" className="mt-3">
          Welcome back
        </DisplayTitle>
        <BodyText className="mt-2 text-sm">
          Sign in to manage interviews, invite links, and scorecards.
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

        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <Button type="submit" className="w-full" loading={loading} brand>
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

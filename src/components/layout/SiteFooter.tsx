"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
import { useSetupStatus } from "@/hooks/useSetupStatus";
import { APP_NAME, APP_TAGLINE } from "@/lib/utils/constants";

export function SiteFooter() {
  const { needsSetup, ready } = useSetupStatus();

  return (
    <footer className="mt-auto border-t border-[var(--border)]/80">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-sm text-[var(--ink-muted)]">{APP_TAGLINE}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--ink-muted)]">
          <Link href="/login" className="hover:text-[var(--ink)]">
            Sign in
          </Link>
          {!ready || needsSetup ? (
            <Link href="/signup" className="hover:text-[var(--ink)]">
              Get started
            </Link>
          ) : null}
          <p className="text-[var(--ink-faint)]">
            © {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      </Container>
    </footer>
  );
}

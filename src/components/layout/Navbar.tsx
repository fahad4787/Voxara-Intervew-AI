"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useSetupStatus } from "@/hooks/useSetupStatus";

export function Navbar() {
  const { needsSetup, ready } = useSetupStatus();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-[var(--bg)]">
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="flex items-center gap-2">
          {!ready || needsSetup ? (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm text-[var(--ink-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
              >
                Sign in
              </Link>
              <Link href="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </nav>
      </Container>
    </header>
  );
}

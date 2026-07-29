"use client";

import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

/** Marketing nav — auth only, no Firestore setup poll. */
export function Navbar() {
  const { user, ready } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)] [transform:translateZ(0)]">
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="flex items-center gap-2">
          {ready && user ? (
            <Button href="/dashboard" size="sm">
              Dashboard
            </Button>
          ) : (
            <Button href="/login" size="sm">
              Sign in
            </Button>
          )}
        </nav>
      </Container>
    </header>
  );
}

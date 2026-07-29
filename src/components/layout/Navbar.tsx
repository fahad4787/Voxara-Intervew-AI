"use client";

import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

export function Navbar() {
  const { user, ready } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)] [transform:translateZ(0)]">
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="flex items-center gap-2">
          {ready && user ? (
            <Button href="/dashboard" size="sm" brand>
              Dashboard
            </Button>
          ) : (
            <Button href="/login" size="sm" brand>
              Sign in
            </Button>
          )}
        </nav>
      </Container>
    </header>
  );
}

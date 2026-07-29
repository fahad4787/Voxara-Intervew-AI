"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function MarketingCtas({
  size = "lg",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { user, ready } = useAuth();

  if (ready && user) {
    return (
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        <Button href="/dashboard" size={size} brand>
          Go to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button href="/login" size={size} brand>
        Sign in to admin
      </Button>
    </div>
  );
}

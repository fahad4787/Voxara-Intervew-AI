"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSetupStatus } from "@/hooks/useSetupStatus";

export function MarketingCtas({
  size = "lg",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { needsSetup, ready } = useSetupStatus();

  if (!ready || needsSetup) {
    return (
      <div className={className}>
        <Link href="/signup">
          <Button size={size}>
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/login">
          <Button size={size} variant="secondary">
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <Link href="/login">
        <Button size={size}>
          Sign in to admin
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

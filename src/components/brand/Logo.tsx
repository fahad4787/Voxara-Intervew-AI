import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/utils/constants";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--ink)]",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 32 32"
        className="h-5 w-5 text-white"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 18v-4M12 22V10M16 20V12M20 23V9M24 18v-4"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="26" cy="8" r="2.2" fill="var(--accent)" />
      </svg>
    </span>
  );
}

export function Logo({
  href = "/",
  showWordmark = true,
  className,
}: {
  href?: string;
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <LogoMark />
      {showWordmark ? (
        <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-[var(--ink)]">
          {APP_NAME}
        </span>
      ) : null}
    </Link>
  );
}

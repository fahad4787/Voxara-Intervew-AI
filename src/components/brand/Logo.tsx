import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/utils/constants";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--accent)] shadow-[0_8px_20px_rgba(15,118,110,0.35)]",
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
          d="M6 22V10l5 8 5-12 5 12 5-8v12"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 24h12"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.55"
        />
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
        <span className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--ink)]">
          {APP_NAME}
        </span>
      ) : null}
    </Link>
  );
}

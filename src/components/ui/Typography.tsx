import { HTMLAttributes, ReactNode, createElement } from "react";
import { cn } from "@/lib/utils/cn";

export function Eyebrow({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]",
        className,
      )}
      {...props}
    />
  );
}

type HeadingTag = "h1" | "h2" | "h3";

const displaySizes = {
  xl: "text-4xl sm:text-6xl leading-[0.95] tracking-[-0.03em]",
  lg: "text-3xl sm:text-4xl tracking-tight",
  md: "text-2xl sm:text-3xl tracking-tight",
} as const;

export function DisplayTitle({
  as = "h1",
  size = "lg",
  className,
  children,
  ...props
}: {
  as?: HeadingTag;
  size?: keyof typeof displaySizes;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLHeadingElement>) {
  return createElement(
    as,
    {
      className: cn(
        "font-[family-name:var(--font-display)] tracking-tight text-[var(--ink)]",
        displaySizes[size],
        className,
      ),
      ...props,
    },
    children,
  );
}

export function BodyText({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base",
        className,
      )}
      {...props}
    />
  );
}

export function IconTile({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { BodyText, DisplayTitle, Eyebrow } from "@/components/ui/Typography";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <Eyebrow className="mb-2">{eyebrow}</Eyebrow> : null}
        <DisplayTitle>{title}</DisplayTitle>
        {description ? (
          <BodyText className="mt-2 max-w-2xl">{description}</BodyText>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <DisplayTitle as="h2" size="md">
        {title}
      </DisplayTitle>
      {description ? (
        <BodyText className="mt-3">{description}</BodyText>
      ) : null}
    </div>
  );
}

export function Section({
  children,
  className,
  containerClassName,
  tone = "default",
  divided = true,
}: {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  tone?: "default" | "muted";
  divided?: boolean;
}) {
  return (
    <section
      className={cn(
        "section-y",
        divided && "border-t border-[var(--border)]",
        tone === "muted" && "bg-[var(--surface)]/55",
        className,
      )}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { IconTile } from "@/components/ui/Typography";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <IconTile className="mb-4 h-12 w-12 rounded-2xl">{icon}</IconTile>
      ) : null}
      <h3 className="text-lg font-semibold text-[var(--ink)]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-[var(--ink-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

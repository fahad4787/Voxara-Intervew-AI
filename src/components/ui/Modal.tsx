"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BodyText, DisplayTitle } from "@/components/ui/Typography";
import { cn } from "@/lib/utils/cn";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--ink)]/40"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-[var(--border)] bg-[var(--surface-elevated)] sm:max-h-[88vh] sm:max-w-2xl sm:rounded-3xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <DisplayTitle id="modal-title" as="h2" size="md" className="text-2xl sm:text-3xl">
              {title}
            </DisplayTitle>
            {description ? (
              <BodyText className="mt-1 text-sm">{description}</BodyText>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            leadingIcon={X}
            onClick={onClose}
            aria-label="Close"
          />
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

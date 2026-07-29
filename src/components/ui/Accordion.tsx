"use client";

import { ChevronDown } from "lucide-react";
import {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

type AccordionContextValue = {
  openIds: Set<string>;
  toggle: (id: string) => void;
  type: "single" | "multiple";
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error("AccordionItem must be used within Accordion");
  }
  return ctx;
}

export function Accordion({
  children,
  type = "multiple",
  defaultValue = [],
  className,
}: {
  children: ReactNode;
  type?: "single" | "multiple";
  defaultValue?: string[];
  className?: string;
}) {
  const [openIds, setOpenIds] = useState(() => new Set(defaultValue));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(type === "single" ? [] : prev);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <AccordionContext.Provider value={{ openIds, toggle, type }}>
        {children}
      </AccordionContext.Provider>
    </div>
  );
}

export function AccordionItem({
  id,
  title,
  children,
  meta,
}: {
  id: string;
  title: string;
  children: ReactNode;
  meta?: ReactNode;
}) {
  const { openIds, toggle } = useAccordion();
  const open = openIds.has(id);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => toggle(id)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--surface-wash)] sm:px-6"
        >
          <span className="min-w-0">
            <span className="block font-medium text-[var(--ink)]">{title}</span>
            {meta ? (
              <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">
                {meta}
              </span>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[var(--ink-muted)] transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className={cn(!open && "hidden")}
      >
        <div className="border-t border-[var(--border)] px-5 py-4 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}

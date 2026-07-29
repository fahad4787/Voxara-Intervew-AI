"use client";

import { cn } from "@/lib/utils/cn";

export function AudioVisualizer({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  const bars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className={cn("flex h-8 items-end gap-1", className)}>
      {bars.map((bar) => (
        <span
          key={bar}
          className={cn(
            "w-1.5 rounded-full bg-[var(--accent)]",
            active ? "opacity-100" : "h-2 opacity-40",
          )}
          style={{
            height: active ? `${10 + bar * 4 + (bar % 2) * 6}px` : undefined,
          }}
        />
      ))}
    </div>
  );
}

import type { InterviewStatus } from "@/types/interview";

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand";

export const statusTone: Record<InterviewStatus, BadgeTone> = {
  draft: "neutral",
  ready: "info",
  in_progress: "warning",
  completed: "success",
  cancelled: "danger",
};

export function statusLabel(status: InterviewStatus) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "ready", label: "Ready" },
  { value: "in_progress", label: "Live" },
  { value: "completed", label: "Done" },
] as const;

export type StatusFilterValue = (typeof STATUS_FILTERS)[number]["value"];

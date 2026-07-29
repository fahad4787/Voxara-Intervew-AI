import { z } from "zod";
import { MIN_JOB_DESCRIPTION_LENGTH } from "@/lib/utils/constants";

export const createInterviewSchema = z.object({
  title: z.string().trim().min(3).max(120),
  jobDescription: z
    .string()
    .trim()
    .min(
      MIN_JOB_DESCRIPTION_LENGTH,
      `Job description must be at least ${MIN_JOB_DESCRIPTION_LENGTH} characters`,
    )
    .max(8000),
  candidateName: z.string().trim().min(2).max(80),
  candidateEmail: z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? undefined : value,
    z.string().trim().email().optional(),
  ),
  difficulty: z.enum(["junior", "mid", "senior"]),
  durationMinutes: z.coerce.number().int().min(5).max(60),
});

export const turnSchema = z.object({
  token: z.string().min(8),
  transcript: z.string().trim().min(1).max(5000),
  durationMs: z.number().int().min(0).max(600000).optional(),
  session: z.any().optional(),
});

export const completeSchema = z.object({
  token: z.string().min(8),
  session: z.any().optional(),
});

export const consentSchema = z.object({
  consentAccepted: z.literal(true),
});

export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "empty";

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

export const passwordStrengthMeta: Record<
  Exclude<PasswordStrength, "empty">,
  { label: string; barClass: string; textClass: string; bars: number }
> = {
  weak: {
    label: "Weak",
    barClass: "bg-rose-500",
    textClass: "text-rose-600",
    bars: 1,
  },
  medium: {
    label: "Medium",
    barClass: "bg-amber-500",
    textClass: "text-amber-700",
    bars: 2,
  },
  strong: {
    label: "Strong",
    barClass: "bg-emerald-500",
    textClass: "text-emerald-700",
    bars: 3,
  },
};

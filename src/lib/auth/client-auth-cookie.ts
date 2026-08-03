import {
  CLIENT_AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SEC,
} from "@/lib/auth/cookies";

export function setClientAuthCookie() {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${CLIENT_AUTH_COOKIE_NAME}=1; Path=/; Max-Age=${SESSION_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function clearClientAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${CLIENT_AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

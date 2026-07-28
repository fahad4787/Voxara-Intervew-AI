import { getClientAuth } from "@/lib/firebase/client";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

async function getAuthHeaders(
  init?: RequestInit,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (init?.headers) {
    const existing = new Headers(init.headers);
    existing.forEach((value, key) => {
      headers[key] = value;
    });
  }

  try {
    const user = getClientAuth().currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      headers.Authorization = `Bearer ${idToken}`;
    }
  } catch {
    // Client auth unavailable — request continues without Bearer token.
  }

  return headers;
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: await getAuthHeaders(init),
  });

  const payload = (await response.json()) as ApiResult<T>;

  if (!response.ok || !payload.success) {
    const message =
      !payload.success && payload.error?.message
        ? payload.error.message
        : "Request failed";
    throw new Error(message);
  }

  return payload.data;
}

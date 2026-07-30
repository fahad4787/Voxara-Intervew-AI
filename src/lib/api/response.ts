import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message, code: error.code },
      },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  console.error(error);

  const message =
    error instanceof Error && error.message
      ? error.message
      : "Internal server error";

  // Surface setup / provider errors so Hostinger runtime issues are visible in UI.
  const lower = message.toLowerCase();
  const setupRelated =
    lower.includes("firebase") ||
    lower.includes("openai") ||
    lower.includes("api key") ||
    lower.includes("service account") ||
    lower.includes("resend") ||
    lower.includes("missing") ||
    lower.includes("invalid json") ||
    lower.includes("private_key");

  return NextResponse.json(
    {
      success: false,
      error: {
        message: setupRelated ? message : "Internal server error",
        code: "INTERNAL",
      },
    },
    { status: 500 },
  );
}

export async function parseJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, "Invalid JSON body", "INVALID_JSON");
  }
}

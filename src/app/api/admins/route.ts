import { NextRequest } from "next/server";
import { ApiError, fail, ok, parseJson } from "@/lib/api/response";
import { createAdminSchema } from "@/lib/api/validators";
import {
  createAdminUser,
  listAdminUsers,
  requirePortalAdmin,
  requireSuperAdmin,
} from "@/lib/auth/admins";
import { requireRequestUser } from "@/lib/auth/session";
import { isAdminConfigured } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    await requirePortalAdmin(user);

    if (!isAdminConfigured()) {
      return ok([]);
    }

    const admins = await listAdminUsers();
    return ok(admins);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(new ApiError(401, "Sign in required", "UNAUTHORIZED"));
    }
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    await requireSuperAdmin(user);

    const body = await parseJson(request);
    const input = createAdminSchema.parse(body);
    const admin = await createAdminUser({
      name: input.name,
      email: input.email,
      password: input.password,
      role: "admin",
    });

    return ok(admin, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(new ApiError(401, "Sign in required", "UNAUTHORIZED"));
    }
    return fail(error);
  }
}

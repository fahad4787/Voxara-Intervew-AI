import { NextRequest } from "next/server";
import { ApiError, fail, ok } from "@/lib/api/response";
import { deleteAdminUser, requireSuperAdmin } from "@/lib/auth/admins";
import { requireRequestUser } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireRequestUser(request);
    await requireSuperAdmin(user);
    const { id } = await params;

    const result = await deleteAdminUser({
      targetId: id,
      actorId: user.uid,
    });

    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail(new ApiError(401, "Sign in required", "UNAUTHORIZED"));
    }
    return fail(error);
  }
}

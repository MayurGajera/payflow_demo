import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "./auth";

/**
 * requireAuth(allowedRoles?)
 * Returns { user } or a NextResponse error.
 * Usage inside a route handler:
 *   const { user, error } = await requireAuth(['OPS']);
 *   if (error) return error;
 */
export async function requireAuth(allowedRoles = []) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 },
      ),
    };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
    return {
      user: null,
      error: NextResponse.json(
        {
          success: false,
          message: `Forbidden — requires role: ${allowedRoles.join(" or ")}`,
        },
        { status: 403 },
      ),
    };
  }

  return { user: decoded, error: null };
}

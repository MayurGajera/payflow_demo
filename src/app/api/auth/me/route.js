import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ user: null });
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { email: decoded.email, role: decoded.role },
  });
}

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", { maxAge: 0, path: "/" });
  return NextResponse.json({ success: true });
}

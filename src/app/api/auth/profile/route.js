import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { user, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Both current and new passwords are required",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 6 characters",
        },
        { status: 400 },
      );
    }

    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const isValid = await dbUser.comparePassword(currentPassword);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect current password" },
        { status: 401 },
      );
    }

    dbUser.passwordHash = await bcrypt.hash(newPassword, 10);
    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import Vendor from "@/models/Vendor";

// GET /api/vendors - list all vendors (any authenticated user)
export async function GET(req) {
  const { user, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const filter = { is_active: true };
  const totalCount = await Vendor.countDocuments(filter);
  const vendors = await Vendor.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return NextResponse.json({
    success: true,
    vendors,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  });
}

// POST /api/vendors - create vendor (OPS only)
export async function POST(req) {
  const { user, error } = await requireAuth(["OPS"]);
  if (error) return error;

  await connectDB();
  const body = await req.json();
  const { name, upi_id, bank_account, ifsc } = body;

  if (!name || !name.trim()) {
    return NextResponse.json(
      { success: false, message: "Vendor name is required" },
      { status: 400 },
    );
  }

  const vendor = await Vendor.create({
    name: name.trim(),
    upi_id,
    bank_account,
    ifsc,
  });
  return NextResponse.json({ success: true, vendor }, { status: 201 });
}

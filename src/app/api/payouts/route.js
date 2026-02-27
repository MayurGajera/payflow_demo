import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import Payout from "@/models/Payout";
import PayoutAudit from "@/models/PayoutAudit";

// GET /api/payouts?status=&vendor_id=
export async function GET(req) {
  const { user, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const vendor_id = searchParams.get("vendor_id");

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;
  if (vendor_id) filter.vendor_id = vendor_id;

  const totalCount = await Payout.countDocuments(filter);
  const payouts = await Payout.find(filter)
    .populate("vendor_id", "name upi_id")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return NextResponse.json({
    success: true,
    payouts,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  });
}

// POST /api/payouts - create payout (OPS only)
export async function POST(req) {
  const { user, error } = await requireAuth(["OPS"]);
  if (error) return error;

  await connectDB();
  const body = await req.json();
  const { vendor_id, amount, mode, note } = body;

  if (!vendor_id)
    return NextResponse.json(
      { success: false, message: "vendor_id is required" },
      { status: 400 },
    );
  if (!amount || Number(amount) <= 0)
    return NextResponse.json(
      { success: false, message: "Amount must be greater than 0" },
      { status: 400 },
    );
  if (!mode || !["UPI", "IMPS", "NEFT"].includes(mode))
    return NextResponse.json(
      { success: false, message: "mode must be UPI, IMPS, or NEFT" },
      { status: 400 },
    );

  const payout = await Payout.create({
    vendor_id,
    amount: Number(amount),
    mode,
    note: note || "",
    status: "Draft",
    created_by: { _id: user._id, email: user.email, role: user.role },
  });

  await PayoutAudit.create({
    payout_id: payout._id,
    action: "CREATED",
    performed_by: { _id: user._id, email: user.email, role: user.role },
  });

  return NextResponse.json({ success: true, payout }, { status: 201 });
}

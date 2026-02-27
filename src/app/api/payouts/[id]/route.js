import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import Payout from "@/models/Payout";
import PayoutAudit from "@/models/PayoutAudit";

// GET /api/payouts/:id
export async function GET(req, { params }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { id } = await params;

  const payout = await Payout.findById(id).populate(
    "vendor_id",
    "name upi_id bank_account ifsc",
  );
  if (!payout)
    return NextResponse.json(
      { success: false, message: "Payout not found" },
      { status: 404 },
    );

  const audits = await PayoutAudit.find({ payout_id: id }).sort({
    timestamp: 1,
  });

  return NextResponse.json({ success: true, payout, audits });
}

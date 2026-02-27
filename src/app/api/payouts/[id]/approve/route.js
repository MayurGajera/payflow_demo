import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import Payout from "@/models/Payout";
import PayoutAudit from "@/models/PayoutAudit";

// POST /api/payouts/:id/approve - FINANCE only, Submitted → Approved
export async function POST(req, { params }) {
  const { user, error } = await requireAuth(["FINANCE"]);
  if (error) return error;

  await connectDB();
  const { id } = await params;

  const payout = await Payout.findById(id);
  if (!payout)
    return NextResponse.json(
      { success: false, message: "Payout not found" },
      { status: 404 },
    );
  if (payout.status !== "Submitted") {
    return NextResponse.json(
      {
        success: false,
        message: `Cannot approve — current status is "${payout.status}". Only Submitted payouts can be approved.`,
      },
      { status: 422 },
    );
  }

  payout.status = "Approved";
  await payout.save();

  await PayoutAudit.create({
    payout_id: payout._id,
    action: "APPROVED",
    performed_by: { _id: user._id, email: user.email, role: user.role },
  });

  return NextResponse.json({ success: true, payout });
}

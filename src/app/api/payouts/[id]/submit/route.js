import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import Payout from "@/models/Payout";
import PayoutAudit from "@/models/PayoutAudit";

// POST /api/payouts/:id/submit - OPS only, Draft → Submitted
export async function POST(req, { params }) {
  const { user, error } = await requireAuth(["OPS"]);
  if (error) return error;

  await connectDB();
  const { id } = await params;

  const payout = await Payout.findById(id);
  if (!payout)
    return NextResponse.json(
      { success: false, message: "Payout not found" },
      { status: 404 },
    );
  if (payout.status !== "Draft") {
    return NextResponse.json(
      {
        success: false,
        message: `Cannot submit — current status is "${payout.status}". Only Draft payouts can be submitted.`,
      },
      { status: 422 },
    );
  }

  payout.status = "Submitted";
  await payout.save();

  await PayoutAudit.create({
    payout_id: payout._id,
    action: "SUBMITTED",
    performed_by: { _id: user._id, email: user.email, role: user.role },
  });

  return NextResponse.json({ success: true, payout });
}

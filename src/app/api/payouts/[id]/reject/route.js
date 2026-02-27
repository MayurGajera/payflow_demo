import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import Payout from "@/models/Payout";
import PayoutAudit from "@/models/PayoutAudit";

// POST /api/payouts/:id/reject - FINANCE only, Submitted → Rejected (reason mandatory)
export async function POST(req, { params }) {
  const { user, error } = await requireAuth(["FINANCE"]);
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { decision_reason } = body;

  if (!decision_reason || !decision_reason.trim()) {
    return NextResponse.json(
      {
        success: false,
        message: "decision_reason is mandatory when rejecting a payout",
      },
      { status: 400 },
    );
  }

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
        message: `Cannot reject — current status is "${payout.status}". Only Submitted payouts can be rejected.`,
      },
      { status: 422 },
    );
  }

  payout.status = "Rejected";
  payout.decision_reason = decision_reason.trim();
  await payout.save();

  await PayoutAudit.create({
    payout_id: payout._id,
    action: "REJECTED",
    performed_by: { _id: user._id, email: user.email, role: user.role },
  });

  return NextResponse.json({ success: true, payout });
}

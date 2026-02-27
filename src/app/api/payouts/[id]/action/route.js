import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import Payout from "@/models/Payout";
import PayoutAudit from "@/models/PayoutAudit";

// POST /api/payouts/:id/action - Handles submit, approve, reject
export async function POST(req, { params }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { action, decision_reason } = body;

  const validActions = ["submit", "approve", "reject"];
  if (!validActions.includes(action)) {
    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
  }

  const roleRequired = action === "submit" ? ["OPS"] : ["FINANCE"];
  const { user, error } = await requireAuth(roleRequired);
  if (error) return error;

  if (action === "reject" && (!decision_reason || !decision_reason.trim())) {
    return NextResponse.json(
      {
        success: false,
        message: "decision_reason is mandatory when rejecting a payout",
      },
      { status: 400 },
    );
  }

  const payout = await Payout.findById(id);
  if (!payout) {
    return NextResponse.json(
      { success: false, message: "Payout not found" },
      { status: 404 },
    );
  }

  const allowedStatuses = {
    submit: "Draft",
    approve: "Submitted",
    reject: "Submitted",
  };

  if (payout.status !== allowedStatuses[action]) {
    return NextResponse.json(
      {
        success: false,
        message: `Cannot ${action} — current status is "${payout.status}".`,
      },
      { status: 422 },
    );
  }

  const statusMap = {
    submit: "Submitted",
    approve: "Approved",
    reject: "Rejected",
  };
  const actionCapitalized =
    action === "submit"
      ? "SUBMITTED"
      : action === "approve"
        ? "APPROVED"
        : "REJECTED";

  payout.status = statusMap[action];
  if (action === "reject") payout.decision_reason = decision_reason.trim();
  await payout.save();

  await PayoutAudit.create({
    payout_id: payout._id,
    action: actionCapitalized,
    performed_by: { _id: user._id, email: user.email, role: user.role },
  });

  return NextResponse.json({ success: true, payout });
}

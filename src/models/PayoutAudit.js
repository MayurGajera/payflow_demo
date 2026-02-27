import mongoose from "mongoose";

const PayoutAuditSchema = new mongoose.Schema({
  payout_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payout",
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: ["CREATED", "SUBMITTED", "APPROVED", "REJECTED"],
    required: true,
  },
  performed_by: {
    _id: mongoose.Schema.Types.ObjectId,
    email: String,
    role: String,
  },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.PayoutAudit ||
  mongoose.model("PayoutAudit", PayoutAuditSchema);

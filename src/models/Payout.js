import mongoose from "mongoose";

const PayoutSchema = new mongoose.Schema(
  {
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    mode: { type: String, enum: ["UPI", "IMPS", "NEFT"], required: true },
    note: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Rejected"],
      default: "Draft",
    },
    decision_reason: { type: String, trim: true, default: "" },
    created_by: {
      _id: mongoose.Schema.Types.ObjectId,
      email: String,
      role: String,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Payout || mongoose.model("Payout", PayoutSchema);

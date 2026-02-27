import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    upi_id: { type: String, trim: true, default: "" },
    bank_account: { type: String, trim: true, default: "" },
    ifsc: { type: String, trim: true, default: "" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);

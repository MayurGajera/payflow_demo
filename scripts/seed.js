/**
 * Seed script — run with: node scripts/seed.js
 * Requires MONGODB_URI in .env.local
 */
const path = require("path");
const fs = require("fs");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in .env.local");
  process.exit(1);
}

// Inline schemas (no ESM)
const UserSchema = new mongoose.Schema(
  { email: String, passwordHash: String, role: String },
  { timestamps: true },
);
const VendorSchema = new mongoose.Schema(
  {
    name: String,
    upi_id: String,
    bank_account: String,
    ifsc: String,
    is_active: Boolean,
  },
  { timestamps: true },
);
const PayoutSchema = new mongoose.Schema(
  {
    vendor_id: mongoose.Schema.Types.ObjectId,
    amount: Number,
    mode: String,
    note: String,
    status: { type: String, default: "Draft" },
    decision_reason: String,
    created_by: Object,
  },
  { timestamps: true },
);
const PayoutAuditSchema = new mongoose.Schema({
  payout_id: mongoose.Schema.Types.ObjectId,
  action: String,
  performed_by: Object,
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
const Payout = mongoose.models.Payout || mongoose.model("Payout", PayoutSchema);
const PayoutAudit =
  mongoose.models.PayoutAudit ||
  mongoose.model("PayoutAudit", PayoutAuditSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅  Connected to MongoDB");

  // Clear existing data
  await User.deleteMany({});
  await Vendor.deleteMany({});
  await Payout.deleteMany({});
  await PayoutAudit.deleteMany({});
  console.log("🗑️   Cleared existing data");

  // Seed Users
  const [opsUser, finUser] = await User.insertMany([
    {
      email: "ops@demo.com",
      passwordHash: await bcrypt.hash("ops123", 10),
      role: "OPS",
    },
    {
      email: "finance@demo.com",
      passwordHash: await bcrypt.hash("fin123", 10),
      role: "FINANCE",
    },
  ]);
  console.log("👤  Users seeded");

  // Seed Vendors
  const vendors = await Vendor.insertMany([
    {
      name: "Acme Corp",
      upi_id: "acme@upi",
      bank_account: "1234567890",
      ifsc: "HDFC0001234",
      is_active: true,
    },
    {
      name: "Swift Logistics",
      upi_id: "swift@upi",
      bank_account: "9876543210",
      ifsc: "ICIC0005678",
      is_active: true,
    },
    {
      name: "Bright Media",
      upi_id: "",
      bank_account: "1122334455",
      ifsc: "SBIN0009999",
      is_active: true,
    },
  ]);
  console.log("🏪  Vendors seeded");

  // Seed Payouts
  const opsInfo = {
    _id: opsUser._id,
    email: opsUser.email,
    role: opsUser.role,
  };
  const finInfo = {
    _id: finUser._id,
    email: finUser.email,
    role: finUser.role,
  };

  const p1 = await Payout.create({
    vendor_id: vendors[0]._id,
    amount: 5000,
    mode: "NEFT",
    note: "Monthly retainer",
    status: "Draft",
    created_by: opsInfo,
  });
  const p2 = await Payout.create({
    vendor_id: vendors[1]._id,
    amount: 12500,
    mode: "IMPS",
    note: "Logistics Q1",
    status: "Submitted",
    created_by: opsInfo,
  });
  const p3 = await Payout.create({
    vendor_id: vendors[2]._id,
    amount: 8000,
    mode: "UPI",
    note: "Ad campaign",
    status: "Approved",
    created_by: opsInfo,
  });
  const p4 = await Payout.create({
    vendor_id: vendors[0]._id,
    amount: 3200,
    mode: "NEFT",
    note: "Consulting",
    status: "Rejected",
    decision_reason: "Budget exceeded for this quarter",
    created_by: opsInfo,
  });
  console.log("💸  Payouts seeded");

  // Seed Audit Trails
  await PayoutAudit.insertMany([
    { payout_id: p1._id, action: "CREATED", performed_by: opsInfo },
    { payout_id: p2._id, action: "CREATED", performed_by: opsInfo },
    {
      payout_id: p2._id,
      action: "SUBMITTED",
      performed_by: opsInfo,
      timestamp: new Date(Date.now() - 3600000),
    },
    { payout_id: p3._id, action: "CREATED", performed_by: opsInfo },
    {
      payout_id: p3._id,
      action: "SUBMITTED",
      performed_by: opsInfo,
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      payout_id: p3._id,
      action: "APPROVED",
      performed_by: finInfo,
      timestamp: new Date(Date.now() - 3600000),
    },
    { payout_id: p4._id, action: "CREATED", performed_by: opsInfo },
    {
      payout_id: p4._id,
      action: "SUBMITTED",
      performed_by: opsInfo,
      timestamp: new Date(Date.now() - 14400000),
    },
    {
      payout_id: p4._id,
      action: "REJECTED",
      performed_by: finInfo,
      timestamp: new Date(Date.now() - 10800000),
    },
  ]);
  console.log("📋  Audit trail seeded");

  console.log("\n✅  Seed complete!");
  console.log("   ops@demo.com     / ops123   (OPS)");
  console.log("   finance@demo.com / fin123   (FINANCE)");
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

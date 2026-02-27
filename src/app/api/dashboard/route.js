import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";
import Payout from "@/models/Payout";
import Vendor from "@/models/Vendor";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  try {
    const totalVendors = await Vendor.countDocuments({ is_active: true });

    // Aggregate payouts
    const payoutStats = await Payout.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Format stats into a map for easy frontend consumption
    const statsMap = payoutStats.reduce((acc, curr) => {
      acc[curr._id] = { count: curr.count, amount: curr.totalAmount };
      return acc;
    }, {});

    // Ensure all statuses have at least 0 values if not present
    const statuses = ["Draft", "Submitted", "Approved", "Rejected"];
    statuses.forEach((status) => {
      if (!statsMap[status]) {
        statsMap[status] = { count: 0, amount: 0 };
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalVendors,
        payouts: statsMap,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard metrics" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

// SAMPLE DATA — replace with real aggregated analytics from your database/platform APIs.
const sampleAnalytics = {
  ordersToday: 3,
  ordersThisWeek: 21,
  topBrandThisWeek: "RAV Design",
  platforms: { Shopee: 2, Lazada: 1 },
};

export async function GET() {
  return NextResponse.json({
    _note: "Sample data. Replace with real aggregated analytics in app/api/analytics/route.js",
    data: sampleAnalytics,
  });
}

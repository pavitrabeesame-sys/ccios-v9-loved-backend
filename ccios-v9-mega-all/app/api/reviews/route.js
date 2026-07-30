import { NextResponse } from "next/server";

// SAMPLE DATA — replace with a real review query from Shopee/Lazada APIs.
const sampleReviews = [
  { id: "REV-01", product: "Bifold Wallet MB-001", customer: "A. Rahman", rating: 5, text: "Solid build, banyak compartment berguna", reply: null },
  { id: "REV-02", product: "Leather Sling Bag", customer: "M. Lee", rating: 4, text: "Delivery lambat 2 hari, product okay saja", reply: null },
];

export async function GET() {
  return NextResponse.json({
    _note: "Sample data. Replace with a real review query in app/api/reviews/route.js",
    data: sampleReviews,
  });
}

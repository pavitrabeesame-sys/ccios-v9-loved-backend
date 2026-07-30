import { NextResponse } from "next/server";
import { shopeeGet, isConfigured as shopeeConfigured, tokenStore as shopeeTokens } from "../../../lib/shopee";
import { lazadaGet, isConfigured as lazadaConfigured, tokenStore as lazadaTokens } from "../../../lib/lazada";

const sampleOrders = [
  { id: "ORD-1001", brand: "RAV Design", product: "Bifold Wallet MB-001", customer: "A. Rahman", status: "processing", total: 89.9, platform: "Shopee" },
  { id: "ORD-1002", brand: "Nicole Collection", product: "Card Holder Minimalist Beige", customer: "S. Tan", status: "shipped", total: 45.0, platform: "Lazada" },
  { id: "ORD-1003", brand: "Hush Puppies", product: "Leather Sling Bag", customer: "M. Lee", status: "cancelled", total: 120.5, platform: "Shopee" },
];

export async function GET() {
  const orders = [];
  const errors = [];

  if (shopeeConfigured()) {
    const shopIds = Object.keys(shopeeTokens.all());
    if (shopIds.length === 0) {
      errors.push("Shopee credentials are set but no shop is authorized yet — visit /api/auth/shopee first.");
    }
    for (const shopId of shopIds) {
      try {
        const j = await shopeeGet(shopId, "/api/v2/order/get_order_list", {
          time_range_field: "create_time",
          time_from: Math.floor(Date.now() / 1000) - 7 * 86400,
          time_to: Math.floor(Date.now() / 1000),
          page_size: 50,
        });
        (j?.response?.order_list || []).forEach((o) =>
          orders.push({ id: o.order_sn, status: o.order_status, platform: "Shopee", shop_id: shopId })
        );
      } catch (e) {
        errors.push(`Shopee shop ${shopId}: ${e.message}`);
      }
    }
  }

  if (lazadaConfigured()) {
    if (!lazadaTokens.has()) {
      errors.push("Lazada credentials are set but not authorized yet — visit /api/auth/lazada first.");
    } else {
      try {
        const j = await lazadaGet("/orders/get", {
          created_after: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
          limit: 50,
        });
        (j?.data?.orders || []).forEach((o) =>
          orders.push({ id: o.order_id, status: o.statuses?.[0], total: o.price, platform: "Lazada" })
        );
      } catch (e) {
        errors.push(`Lazada: ${e.message}`);
      }
    }
  }

  const liveAttempted = shopeeConfigured() || lazadaConfigured();

  if (!liveAttempted) {
    return NextResponse.json({
      _note: "No Shopee/Lazada credentials configured yet — showing sample data. See README-shopee-lazada.md to connect real accounts.",
      data: sampleOrders,
    });
  }

  return NextResponse.json({
    _note: errors.length ? `Live data attempted. Issues: ${errors.join(" | ")}` : "Live data from Shopee/Lazada.",
    data: orders,
  });
}

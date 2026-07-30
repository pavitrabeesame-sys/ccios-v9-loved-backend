import { NextResponse } from "next/server";
import { shopeeGet, isConfigured as shopeeConfigured, tokenStore as shopeeTokens } from "../../../lib/shopee";
import { lazadaGet, isConfigured as lazadaConfigured, tokenStore as lazadaTokens } from "../../../lib/lazada";

const sampleProducts = [
  { sku: "RAV-MB-001", name: "Bifold Wallet MB-001", brand: "RAV Design", price: 89.9, stock: 42 },
  { sku: "NIC-CH-BEIGE", name: "Card Holder Minimalist Beige", brand: "Nicole Collection", price: 45.0, stock: 0 },
  { sku: "HP-SLING-01", name: "Leather Sling Bag", brand: "Hush Puppies", price: 120.5, stock: 15 },
];

export async function GET() {
  const products = [];
  const errors = [];

  if (shopeeConfigured()) {
    const shopIds = Object.keys(shopeeTokens.all());
    if (shopIds.length === 0) {
      errors.push("Shopee credentials are set but no shop is authorized yet — visit /api/auth/shopee first.");
    }
    for (const shopId of shopIds) {
      try {
        const j = await shopeeGet(shopId, "/api/v2/product/get_item_list", {
          offset: 0,
          page_size: 50,
          item_status: "NORMAL",
        });
        (j?.response?.item || []).forEach((i) =>
          products.push({ sku: i.item_id, name: i.item_name, stock: undefined, platform: "Shopee", shop_id: shopId })
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
        const j = await lazadaGet("/products/get", { limit: 50, offset: 0 });
        (j?.data?.products || []).forEach((p) =>
          products.push({ sku: p.item_id, name: p.attributes?.name, price: p.skus?.[0]?.price, stock: p.skus?.[0]?.quantity, platform: "Lazada" })
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
      data: sampleProducts,
    });
  }

  return NextResponse.json({
    _note: errors.length ? `Live data attempted. Issues: ${errors.join(" | ")}` : "Live data from Shopee/Lazada.",
    data: products,
  });
}

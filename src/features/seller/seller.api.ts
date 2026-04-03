import { api } from "../../lib/api";
import { sellerVariantListSchema, type SellerVariant } from "./seller.types";

export async function sellerSearchVariants(q: string): Promise<SellerVariant[]> {
  const res = await api.get("/api/seller/products/search", { params: { q } });
  return sellerVariantListSchema.parse(res.data);
}

export async function sellerListVariants(): Promise<SellerVariant[]> {
  const res = await api.get("/api/seller/products");
  return sellerVariantListSchema.parse(res.data);
}

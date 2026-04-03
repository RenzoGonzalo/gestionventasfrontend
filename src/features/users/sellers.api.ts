import { api } from "../../lib/api";
import { createSellerRequestSchema, sellerUserSchema, type CreateSellerRequest, type SellerUser } from "./sellers.types";

export async function createSeller(input: CreateSellerRequest): Promise<SellerUser> {
  const payload = createSellerRequestSchema.parse(input);
  const res = await api.post("/api/store-admin/sellers", payload);
  return sellerUserSchema.parse(res.data);
}

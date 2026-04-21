import { z } from "zod";

export const sellerVariantSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  productNombre: z.string(),
  precioVenta: z.string(),
  stockActual: z.string()
});
export type SellerVariant = z.infer<typeof sellerVariantSchema>;

export const sellerVariantListSchema = z.array(sellerVariantSchema);

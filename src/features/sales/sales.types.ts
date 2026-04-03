import { z } from "zod";

export const saleItemSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  quantity: z.string(),
  unitPrice: z.string(),
  subtotal: z.string()
});

export const saleSchema = z.object({
  id: z.string(),
  receiptNumber: z.string(),
  status: z.string(),
  total: z.string(),
  createdAt: z.string().or(z.date()),
  items: z.array(saleItemSchema)
});

export type Sale = z.infer<typeof saleSchema>;

export const createSaleRequestSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.string(),
        unitPrice: z.string().optional()
      })
    )
    .min(1)
});

export type CreateSaleRequest = z.infer<typeof createSaleRequestSchema>;

export const saleSummarySchema = z.object({
  id: z.string(),
  receiptNumber: z.string(),
  status: z.string(),
  total: z.string(),
  sellerId: z.string(),
  createdAt: z.string().or(z.date()),
  itemCount: z.number()
});

export const saleSummaryListSchema = z.array(saleSummarySchema);
export type SaleSummary = z.infer<typeof saleSummarySchema>;

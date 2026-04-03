import { z } from "zod";

export const dashboardSchema = z.object({
  today: z.object({
    total: z.string(),
    count: z.number()
  }),
  month: z.object({
    total: z.string(),
    count: z.number()
  }),
  lowStockCount: z.number()
});

export type Dashboard = z.infer<typeof dashboardSchema>;

export const dailySalesRowSchema = z.object({
  date: z.string(),
  total: z.string(),
  count: z.number()
});
export type DailySalesRow = z.infer<typeof dailySalesRowSchema>;

export const dailySalesResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  rows: z.array(dailySalesRowSchema)
});
export type DailySalesResponse = z.infer<typeof dailySalesResponseSchema>;

export const topProductRowSchema = z.object({
  variantId: z.string(),
  variantNombre: z.string(),
  sku: z.string(),
  productId: z.string(),
  productNombre: z.string(),
  quantity: z.string(),
  subtotal: z.string(),
  lines: z.number()
});
export type TopProductRow = z.infer<typeof topProductRowSchema>;

export const topProductsResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  limit: z.number(),
  rows: z.array(topProductRowSchema)
});
export type TopProductsResponse = z.infer<typeof topProductsResponseSchema>;

export const lowStockRowSchema = z.object({
  variantId: z.string(),
  variantNombre: z.string(),
  sku: z.string(),
  productId: z.string(),
  productNombre: z.string(),
  stockActual: z.string(),
  stockMinimo: z.string()
});
export type LowStockRow = z.infer<typeof lowStockRowSchema>;

export const lowStockResponseSchema = z.object({
  limit: z.number(),
  rows: z.array(lowStockRowSchema)
});
export type LowStockResponse = z.infer<typeof lowStockResponseSchema>;

export const sellerPerformanceRowSchema = z.object({
  sellerId: z.string(),
  sellerNombre: z.string(),
  sellerEmail: z.string(),
  salesCount: z.number(),
  total: z.string()
});
export type SellerPerformanceRow = z.infer<typeof sellerPerformanceRowSchema>;

export const sellersPerformanceResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  limit: z.number(),
  rows: z.array(sellerPerformanceRowSchema)
});
export type SellersPerformanceResponse = z.infer<typeof sellersPerformanceResponseSchema>;

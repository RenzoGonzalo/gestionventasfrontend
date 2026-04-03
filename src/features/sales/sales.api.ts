import { api } from "../../lib/api";
import {
  createSaleRequestSchema,
  saleSchema,
  saleSummaryListSchema,
  type CreateSaleRequest,
  type Sale,
  type SaleSummary
} from "./sales.types";

export async function createSale(input: CreateSaleRequest): Promise<Sale> {
  const payload = createSaleRequestSchema.parse(input);
  const res = await api.post("/api/sales", payload);
  return saleSchema.parse(res.data);
}

export async function listSales(params?: { from?: string; to?: string }): Promise<SaleSummary[]> {
  const res = await api.get("/api/sales", { params });
  return saleSummaryListSchema.parse(res.data);
}

export async function listMySales(params?: { from?: string; to?: string }): Promise<SaleSummary[]> {
  const res = await api.get("/api/sales/my", { params });
  return saleSummaryListSchema.parse(res.data);
}

export async function cancelSale(input: { id: string; reason?: string }): Promise<Sale> {
  const res = await api.post(`/api/sales/${input.id}/cancel`, { reason: input.reason ?? null });
  return saleSchema.parse(res.data);
}

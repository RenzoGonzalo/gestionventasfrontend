import { api } from "../../lib/api";
import {
  dashboardSchema,
  dailySalesResponseSchema,
  lowStockResponseSchema,
  sellersPerformanceResponseSchema,
  topProductsResponseSchema,
  type Dashboard,
  type DailySalesResponse,
  type LowStockResponse,
  type SellersPerformanceResponse,
  type TopProductsResponse
} from "./reports.types";

export async function getDashboard(): Promise<Dashboard> {
  const res = await api.get("/api/reports/dashboard");
  return dashboardSchema.parse(res.data);
}

export async function getDailySales(params?: { from?: string; to?: string }): Promise<DailySalesResponse> {
  const res = await api.get("/api/reports/sales/daily", { params });
  return dailySalesResponseSchema.parse(res.data);
}

export async function getTopProducts(params?: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<TopProductsResponse> {
  const res = await api.get("/api/reports/products/top", { params });
  return topProductsResponseSchema.parse(res.data);
}

export async function getLowStock(params?: { limit?: number }): Promise<LowStockResponse> {
  const res = await api.get("/api/reports/products/low-stock", { params });
  return lowStockResponseSchema.parse(res.data);
}

export async function getSellersPerformance(params?: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<SellersPerformanceResponse> {
  const res = await api.get("/api/reports/sellers/performance", { params });
  return sellersPerformanceResponseSchema.parse(res.data);
}

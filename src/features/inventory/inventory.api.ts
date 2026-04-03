import { api } from "../../lib/api";
import {
  categoryListSchema,
  categorySchema,
  createCategoryRequestSchema,
  productListSchema,
  productSchema,
  productWithVariantsSchema,
  updateCategoryRequestSchema,
  updateProductRequestSchema,
  createProductRequestSchema,
  createVariantRequestSchema,
  variantSchema,
  adjustStockRequestSchema,
  adjustStockResponseSchema,
  type Category,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  type Product,
  type ProductWithVariants,
  type CreateProductRequest,
  type UpdateProductRequest,
  type CreateVariantRequest,
  type Variant,
  type AdjustStockRequest,
  type AdjustStockResponse
} from "./inventory.types";

export async function listCategories(): Promise<Category[]> {
  const res = await api.get("/api/categories");
  return categoryListSchema.parse(res.data);
}

export async function getCategory(id: string): Promise<Category> {
  const res = await api.get(`/api/categories/${id}`);
  return categorySchema.parse(res.data);
}

export async function createCategory(input: CreateCategoryRequest): Promise<Category> {
  const payload = createCategoryRequestSchema.parse(input);
  const res = await api.post("/api/categories", payload);
  return categorySchema.parse(res.data);
}

export async function updateCategory(id: string, input: UpdateCategoryRequest): Promise<Category> {
  const payload = updateCategoryRequestSchema.parse(input);
  const res = await api.put(`/api/categories/${id}`, payload);
  return categorySchema.parse(res.data);
}

export async function deleteCategory(id: string): Promise<{ ok: true } | unknown> {
  const res = await api.delete(`/api/categories/${id}`);
  return res.data;
}

export async function listProducts(params?: { categoryId?: string }): Promise<Product[]> {
  const res = await api.get("/api/products", { params });
  return productListSchema.parse(res.data);
}

export async function getProduct(id: string): Promise<ProductWithVariants> {
  const res = await api.get(`/api/products/${id}`);
  return productWithVariantsSchema.parse(res.data);
}

export async function createProduct(input: CreateProductRequest): Promise<ProductWithVariants> {
  const payload = createProductRequestSchema.parse(input);
  const res = await api.post("/api/products", payload);
  return productWithVariantsSchema.parse(res.data);
}

export async function updateProduct(id: string, input: UpdateProductRequest): Promise<Product> {
  const payload = updateProductRequestSchema.parse(input);
  const res = await api.put(`/api/products/${id}`, payload);
  return productSchema.parse(res.data);
}

export async function deleteProduct(id: string): Promise<{ ok: true } | unknown> {
  const res = await api.delete(`/api/products/${id}`);
  return res.data;
}

export async function addVariantToProduct(productId: string, input: CreateVariantRequest): Promise<Variant> {
  const payload = createVariantRequestSchema.parse(input);
  const res = await api.post(`/api/products/${productId}/variants`, payload);
  return variantSchema.parse(res.data);
}

export async function updateVariant(id: string, input: Partial<CreateVariantRequest>): Promise<Variant> {
  const res = await api.put(`/api/variants/${id}`, input);
  return variantSchema.parse(res.data);
}

export async function deleteVariant(id: string): Promise<{ ok: true } | unknown> {
  const res = await api.delete(`/api/variants/${id}`);
  return res.data;
}

export async function adjustVariantStock(id: string, input: AdjustStockRequest): Promise<AdjustStockResponse> {
  const payload = adjustStockRequestSchema.parse(input);
  const res = await api.post(`/api/variants/${id}/stock/adjust`, payload);
  return adjustStockResponseSchema.parse(res.data);
}

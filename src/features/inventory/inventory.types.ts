import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  activo: z.boolean()
});
export const categoryListSchema = z.array(categorySchema);
export type Category = z.infer<typeof categorySchema>;

export const createCategoryRequestSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional()
});
export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>;

export const productSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  imagen: z.string().nullable().optional(),
  activo: z.boolean(),
  atributos: z.any(),
  unitType: z.string()
});
export const productListSchema = z.array(productSchema);
export type Product = z.infer<typeof productSchema>;

export const variantSchema = z.object({
  id: z.string(),
  productId: z.string().optional(),
  nombre: z.string(),
  sku: z.string(),
  codigoBarras: z.string().nullable().optional(),
  atributos: z.any(),
  unitType: z.string(),
  precioCompra: z.string(),
  precioVenta: z.string(),
  stockActual: z.string(),
  stockMinimo: z.string(),
  ubicacion: z.string().nullable().optional(),
  activo: z.boolean()
});
export type Variant = z.infer<typeof variantSchema>;

export const productWithVariantsSchema = productSchema.extend({
  variantes: z.array(variantSchema)
});
export type ProductWithVariants = z.infer<typeof productWithVariantsSchema>;

export const createVariantRequestSchema = z.object({
  nombre: z.string().min(1),
  sku: z.string().min(1),
  codigoBarras: z.string().optional(),
  atributos: z.any().optional().default({}),
  unitType: z.string().optional(),
  precioCompra: z.string().min(1),
  precioVenta: z.string().min(1),
  stockActual: z.string().optional(),
  stockMinimo: z.string().optional(),
  ubicacion: z.string().optional(),
  activo: z.boolean().optional()
});
export type CreateVariantRequest = z.infer<typeof createVariantRequestSchema>;

export const createProductRequestSchema = z.object({
  categoryId: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  imagen: z.string().optional(),
  activo: z.boolean().optional(),
  atributos: z.any().optional().default([]),
  unitType: z.string().optional(),
  variantes: z.array(createVariantRequestSchema).optional().default([])
});
export type CreateProductRequest = z.infer<typeof createProductRequestSchema>;

export const updateProductRequestSchema = z.object({
  categoryId: z.string().optional(),
  nombre: z.string().optional(),
  descripcion: z.string().nullable().optional(),
  imagen: z.string().nullable().optional(),
  activo: z.boolean().optional(),
  atributos: z.any().optional(),
  unitType: z.string().optional()
});
export type UpdateProductRequest = z.infer<typeof updateProductRequestSchema>;

export const updateCategoryRequestSchema = z.object({
  nombre: z.string().optional(),
  descripcion: z.string().nullable().optional(),
  activo: z.boolean().optional()
});
export type UpdateCategoryRequest = z.infer<typeof updateCategoryRequestSchema>;

export const adjustStockRequestSchema = z.object({
  cantidad: z.string().min(1),
  motivo: z.string().optional()
});
export type AdjustStockRequest = z.infer<typeof adjustStockRequestSchema>;

export const adjustStockResponseSchema = z.object({
  movementId: z.string(),
  variant: z.object({
    id: z.string(),
    productId: z.string(),
    nombre: z.string(),
    sku: z.string(),
    precioVenta: z.string(),
    stockActual: z.string(),
    stockMinimo: z.string()
  })
});
export type AdjustStockResponse = z.infer<typeof adjustStockResponseSchema>;

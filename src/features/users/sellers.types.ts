import { z } from "zod";

export const createSellerRequestSchema = z.object({
  nombre: z.string().min(1),
  code: z.string().regex(/^\d+$/).refine((v) => v.length === 4 || v.length === 6, {
    message: "El código debe ser de 4 o 6 dígitos"
  })
});

export const sellerUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nombre: z.string(),
  companyId: z.string().nullable(),
  code: z.string().nullable().optional(),
  rol: z.literal("SELLER"),
  roles: z.array(z.string())
});

export type CreateSellerRequest = z.infer<typeof createSellerRequestSchema>;
export type SellerUser = z.infer<typeof sellerUserSchema>;

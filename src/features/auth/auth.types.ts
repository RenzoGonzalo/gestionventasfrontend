import { z } from "zod";

export const roleSchema = z.enum(["SUPER_ADMIN", "STORE_ADMIN", "SELLER"]);
export type Role = z.infer<typeof roleSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nombre: z.string().optional().default(""),
  companyId: z.string().nullable().optional(),
  companySlug: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  rol: roleSchema.optional(),
  roles: z.array(roleSchema).default([])
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const loginResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const loginRequestSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1)
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const sellerCodeLoginRequestSchema = z.object({
  nombre: z.string().min(1),
  code: z.string().regex(/^\d+$/).refine((v) => v.length === 4 || v.length === 6, {
    message: "El código debe ser de 4 o 6 dígitos"
  })
});
export type SellerCodeLoginRequest = z.infer<typeof sellerCodeLoginRequestSchema>;

export type AuthSession = {
  token: string;
  user: AuthUser;
};

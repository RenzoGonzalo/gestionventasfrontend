import { z } from "zod";

export const superCompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  ruc: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional()
});

export const superCompanyListSchema = z.array(superCompanySchema);
export type SuperCompany = z.infer<typeof superCompanySchema>;

export const provisionCompanyRequestSchema = z.object({
  company: z.object({
    name: z.string().min(1),
    ruc: z.string().nullable().optional(),
    address: z.string().nullable().optional()
  }),
  admin: z.object({
    email: z.string().email(),
    password: z.string().min(6).optional(),
    nombre: z.string().min(1)
  })
});

export type ProvisionCompanyRequest = z.infer<typeof provisionCompanyRequestSchema>;

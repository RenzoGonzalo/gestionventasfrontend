import { api } from "../../lib/api";
import {
  provisionCompanyRequestSchema,
  superCompanyListSchema,
  type ProvisionCompanyRequest,
  type SuperCompany
} from "./companies.types";

export async function superListCompanies(): Promise<SuperCompany[]> {
  const res = await api.get("/api/super/companies");
  return superCompanyListSchema.parse(res.data);
}

export async function superProvisionCompany(input: ProvisionCompanyRequest) {
  const payload = provisionCompanyRequestSchema.parse(input);
  const res = await api.post("/api/super/companies", payload);
  return res.data as any;
}

export async function superUpdateCompany(input: { id: string; name?: string; ruc?: string | null; address?: string | null }) {
  const res = await api.put(`/api/super/companies/${input.id}`, {
    name: input.name,
    ruc: input.ruc,
    address: input.address
  });
  return res.data as { id: string; name: string; slug: string; ruc: string | null; address: string | null };
}

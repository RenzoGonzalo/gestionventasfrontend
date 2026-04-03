import { api } from "../../lib/api";
import type { Company } from "./company.types";

export async function getMyCompany(): Promise<Company> {
  const res = await api.get<Company>("/companies/me");
  return res.data;
}

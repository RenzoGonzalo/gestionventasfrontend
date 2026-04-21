import { readJson, writeJson } from "../../lib/storage";

const LAST_CREATED_SELLER_KEY = "last-created-seller-by-company";

type SellerNamesByCompany = Record<string, string>;

export function saveLastCreatedSellerName(companySlug: string, nombre: string) {
  const current = readJson<SellerNamesByCompany>(LAST_CREATED_SELLER_KEY) ?? {};
  current[companySlug] = nombre;
  writeJson(LAST_CREATED_SELLER_KEY, current);
}

export function getLastCreatedSellerName(companySlug: string) {
  const current = readJson<SellerNamesByCompany>(LAST_CREATED_SELLER_KEY) ?? {};
  return current[companySlug] ?? null;
}

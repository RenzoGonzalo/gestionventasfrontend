import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/auth.context";
import { useMyCompanyQuery } from "./useMyCompanyQuery";

export function CompanyIndexRedirect() {
  const { primaryRole } = useAuth();
  const myCompanyQuery = useMyCompanyQuery();

  if (myCompanyQuery.isLoading) {
    return <div className="p-4 text-slate-600">Cargando...</div>;
  }

  if (myCompanyQuery.isError || !myCompanyQuery.data) {
    return <div className="p-4 text-red-700">No se pudo cargar tu empresa.</div>;
  }

  const slug = myCompanyQuery.data.slug;

  if (primaryRole === "SELLER") {
    return <Navigate to={`/companies/${slug}/seller/sales`} replace />;
  }

  if (primaryRole === "STORE_ADMIN") {
    return <Navigate to={`/companies/${slug}/admin/sales`} replace />;
  }

  return <Navigate to={`/companies/${slug}`} replace />;
}

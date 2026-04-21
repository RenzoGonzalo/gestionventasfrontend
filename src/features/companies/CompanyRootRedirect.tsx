import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/auth.context";

export function CompanyRootRedirect() {
  const { primaryRole, session } = useAuth();
  const { companySlug } = useParams();
  const slug = companySlug ?? session?.user?.companySlug;

  if (!slug) return <Navigate to="/login" replace />;

  if (primaryRole === "SELLER") {
    return <Navigate to={`/companies/${slug}/seller/sales/new`} replace />;
  }

  if (primaryRole === "STORE_ADMIN") {
    return <Navigate to={`/companies/${slug}/admin/dashboard`} replace />;
  }

  return <Navigate to="/login" replace />;
}

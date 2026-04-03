import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/auth.context";

export function PostLoginRedirect() {
  const { primaryRole, session } = useAuth();

  if (primaryRole === "SUPER_ADMIN") {
    return <Navigate to="/admin/companies" replace />;
  }

  const slug = session?.user?.companySlug;

  if (!slug) {
    return <Navigate to="/login" replace />;
  }

  if (primaryRole === "SELLER") {
    return <Navigate to={`/companies/${slug}/seller/sales/new`} replace />;
  }

  return <Navigate to={`/companies/${slug}/admin/sales`} replace />;
}

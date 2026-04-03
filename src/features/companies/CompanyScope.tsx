import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useMyCompanyQuery } from "./useMyCompanyQuery";

export function CompanyScope() {
  const { companySlug } = useParams();
  const location = useLocation();
  const myCompanyQuery = useMyCompanyQuery();

  if (myCompanyQuery.isLoading) {
    return <div className="p-4 text-slate-600">Cargando...</div>;
  }

  if (myCompanyQuery.isError || !myCompanyQuery.data) {
    return <Navigate to="/" replace />;
  }

  const mySlug = myCompanyQuery.data.slug;

  if (companySlug && companySlug !== mySlug) {
    const fromPrefix = `/companies/${companySlug}`;
    const toPrefix = `/companies/${mySlug}`;
    const nextPathname = location.pathname.startsWith(fromPrefix)
      ? `${toPrefix}${location.pathname.slice(fromPrefix.length)}`
      : `${toPrefix}`;
    const next = `${nextPathname}${location.search}`;
    return <Navigate to={next} replace />;
  }

  return <Outlet />;
}

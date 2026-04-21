import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/auth.context";
import { useMyCompanyQuery } from "../features/companies/useMyCompanyQuery";
import { Button } from "./ui/button";

function navClass(isActive: boolean) {
  return isActive ? "w-full justify-start shadow-sm" : "w-full justify-start";
}

function SidebarLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} end>
      {({ isActive }) => (
        <Button size="md" variant={isActive ? "primary" : "secondary"} className={navClass(isActive)}>
          {label}
        </Button>
      )}
    </NavLink>
  );
}

export function CompanyLayout() {
  const { session, logout, primaryRole } = useAuth();
  const navigate = useNavigate();
  const { companySlug } = useParams();
  const myCompanyQuery = useMyCompanyQuery();

  const companyName = session?.user?.companyName ?? myCompanyQuery.data?.name ?? "";
  const slug = companySlug ?? session?.user?.companySlug ?? "";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-lg font-extrabold text-slate-900">
              FERRETERIA: {companyName || "-"}
            </div>
            <div className="truncate text-sm text-slate-600">
              {session?.user?.nombre ? `Usuario: ${session.user.nombre}` : ""}
            </div>
          </div>
          <Button
            size="md"
            variant="secondary"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Salir
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[240px_1fr]">
        <aside className="grid gap-2">
          {primaryRole === "SELLER" ? (
            <>
              <SidebarLink to={`/companies/${slug}/seller/sales/new`} label="Nueva venta" />
              <SidebarLink to={`/companies/${slug}/seller/products`} label="Productos" />
              <SidebarLink to={`/companies/${slug}/seller/sales`} label="Mis ventas" />
            </>
          ) : (
            <>
              <SidebarLink to={`/companies/${slug}/admin/dashboard`} label="Resumen General" />
              <SidebarLink to={`/companies/${slug}/admin/sales`} label="Ventas" />
              <SidebarLink to={`/companies/${slug}/admin/inventory`} label="Inventario" />
              <SidebarLink to={`/companies/${slug}/admin/reports`} label="Reportes" />
              <SidebarLink to={`/companies/${slug}/admin/users/sellers`} label="Vendedores" />
            </>
          )}
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

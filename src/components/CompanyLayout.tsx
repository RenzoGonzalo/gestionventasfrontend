import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../features/auth/auth.context";
import { useMyCompanyQuery } from "../features/companies/useMyCompanyQuery";
import { Button } from "./ui/button";

function navClass(isActive: boolean) {
  return isActive
    ? "w-full justify-start gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
    : "w-full justify-start gap-2 bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50";
}

function SidebarLink({
  to,
  icon,
  label,
  tone = "nav",
  end = false
}: {
  to: string;
  icon: string;
  label: string;
  tone?: "nav" | "primary";
  end?: boolean;
}) {
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <Button
          size="md"
          variant={tone === "primary" ? "primary" : "secondary"}
          className={tone === "primary" ? "w-full justify-start gap-2 shadow-sm" : navClass(isActive)}
        >
          <span aria-hidden className="text-base">
            {icon}
          </span>
          <span className="truncate">{label}</span>
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
              Tienda: {companyName || "—"}
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
              <SidebarLink to={`/companies/${slug}/seller/sales/new`} icon="💰" label="Vender" tone="primary" />
              <SidebarLink to={`/companies/${slug}/seller/products`} icon="📦" label="Productos" />
              <SidebarLink to={`/companies/${slug}/seller/sales`} icon="🧾" label="Mis ventas" />
            </>
          ) : (
            <>
              <SidebarLink to={`/companies/${slug}/admin/dashboard`} icon="🏠" label="Resumen" end />
              <SidebarLink to={`/companies/${slug}/admin/sales`} icon="🧾" label="Ventas" />
              <SidebarLink to={`/companies/${slug}/admin/inventory`} icon="📦" label="Inventario" />
              <SidebarLink to={`/companies/${slug}/admin/reports`} icon="📊" label="Reportes" />
              <SidebarLink to={`/companies/${slug}/admin/users/sellers`} icon="👥" label="Vendedores" />
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

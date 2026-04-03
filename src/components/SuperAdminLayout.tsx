import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../features/auth/auth.context";

function navClass(isActive: boolean) {
  return isActive
    ? "w-full justify-start shadow-sm"
    : "w-full justify-start";
}

export function SuperAdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="text-lg font-extrabold text-slate-900">Admin • Plataforma</div>
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
          <NavLink to="/admin/companies">
            {({ isActive }) => (
              <Button size="md" variant={isActive ? "primary" : "secondary"} className={navClass(isActive)}>
                🏢 Empresas
              </Button>
            )}
          </NavLink>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

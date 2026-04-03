import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../features/auth/auth.context";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const { companySlug } = useParams();

  const homeHref = companySlug ? `/companies/${companySlug}` : "/";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <Link to={homeHref} className="block text-lg font-extrabold text-slate-900">
              Gestión de Ventas
            </Link>
            <div className="truncate text-sm text-slate-600">
              {title}
              {session?.user?.nombre ? ` • ${session.user.nombre}` : ""}
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

      <main className="mx-auto max-w-3xl px-4 py-4">{children}</main>
    </div>
  );
}

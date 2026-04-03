import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { superListCompanies } from "../../features/super/companies.api";

export function AdminCompaniesPage() {
  const q = useQuery({
    queryKey: ["super", "companies"],
    queryFn: superListCompanies
  });

  const rows = q.data ?? [];

  return (
    <div className="grid gap-3">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Empresas</CardTitle>
            <CardDescription className="mt-1">Gestiona las empresas de la plataforma.</CardDescription>
          </div>
          <Link to="new">
            <Button size="md">Nueva empresa</Button>
          </Link>
        </div>

        {q.isLoading ? <div className="mt-3 text-slate-600">Cargando...</div> : null}
        {q.isError ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">No se pudo cargar.</div> : null}

        {rows.length ? (
          <div className="mt-3 grid gap-2">
            {rows.map((c) => (
              <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-extrabold">{c.name}</div>
                    <div className="text-sm text-slate-600">Slug: {c.slug}</div>
                    <div className="text-sm text-slate-600">RUC: {c.ruc ?? "—"}</div>
                  </div>
                  <Link to={`${c.id}/edit`}>
                    <Button size="md" variant="secondary">Editar</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : !q.isLoading ? (
          <div className="mt-3 text-slate-600">No hay empresas.</div>
        ) : null}
      </Card>
    </div>
  );
}

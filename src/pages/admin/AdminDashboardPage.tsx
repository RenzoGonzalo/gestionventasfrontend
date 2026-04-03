import { useQuery } from "@tanstack/react-query";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { getDashboard } from "../../features/reports/reports.api";

function money(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toFixed(2);
}

export function AdminDashboardPage() {
  const q = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: getDashboard
  });

  const data = q.data ?? null;

  return (
    <div className="grid gap-3">
      <Card>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription className="mt-1">Resumen rápido.</CardDescription>

        {q.isLoading ? <div className="mt-3 text-slate-600">Cargando...</div> : null}
        {q.isError ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">No se pudo cargar.</div> : null}

        {data ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-700">Ventas hoy</div>
              <div className="mt-1 text-2xl font-extrabold">S/ {money(data.today.total)}</div>
              <div className="text-sm text-slate-600">{data.today.count} venta(s)</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-700">Ventas mes</div>
              <div className="mt-1 text-2xl font-extrabold">S/ {money(data.month.total)}</div>
              <div className="text-sm text-slate-600">{data.month.count} venta(s)</div>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

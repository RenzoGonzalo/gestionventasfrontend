import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../../features/reports/reports.api";

function money(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toFixed(2);
}

function MetricCard({
  title,
  value,
  helper,
  accent
}: {
  title: string;
  value: string;
  helper: string;
  accent: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
          <div className="mt-2 text-sm text-slate-600">{helper}</div>
        </div>
        <div className={`h-12 w-12 rounded-2xl ${accent}`} />
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const q = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: getDashboard
  });

  const data = q.data ?? null;

  return (
    <div className="grid gap-5">
      {q.isLoading ? <div className="text-slate-600">Cargando...</div> : null}
      {q.isError ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">No se pudo cargar.</div> : null}

      {data ? (
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Ventas de hoy"
            value={`S/ ${money(data.today.total)}`}
            helper={`${data.today.count} venta(s) registradas`}
            accent="bg-emerald-100"
          />
          <MetricCard
            title="Ventas del mes"
            value={`S/ ${money(data.month.total)}`}
            helper={`${data.month.count} venta(s) registradas`}
            accent="bg-blue-100"
          />
          <MetricCard
            title="Alertas de stock"
            value={String(data.lowStockCount)}
            helper="Productos que necesitan atención"
            accent="bg-orange-100"
          />
        </div>
      ) : null}
    </div>
  );
}

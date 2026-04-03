import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  getDashboard,
  getDailySales,
  getLowStock,
  getTopProducts
} from "../../features/reports/reports.api";

function money(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toFixed(2);
}

function asNumber(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function AdminReportsPage() {
  const [dailyFrom, setDailyFrom] = useState("");
  const [dailyTo, setDailyTo] = useState("");
  const [dailyApplied, setDailyApplied] = useState<{ from?: string; to?: string }>({});

  const [topFrom, setTopFrom] = useState("");
  const [topTo, setTopTo] = useState("");
  const [topLimit, setTopLimit] = useState("10");
  const [topApplied, setTopApplied] = useState<{ from?: string; to?: string; limit?: number }>({ limit: 10 });

  const [lowLimit, setLowLimit] = useState("50");
  const [lowApplied, setLowApplied] = useState<{ limit?: number }>({ limit: 50 });

  const q = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard
  });

  const dailyQuery = useQuery({
    queryKey: ["reports", "daily-sales", dailyApplied],
    queryFn: () => getDailySales(dailyApplied)
  });

  const topQuery = useQuery({
    queryKey: ["reports", "top-products", topApplied],
    queryFn: () => getTopProducts(topApplied)
  });

  const lowQuery = useQuery({
    queryKey: ["reports", "low-stock", lowApplied],
    queryFn: () => getLowStock(lowApplied)
  });

  const dailyRows = useMemo(() => dailyQuery.data?.rows ?? [], [dailyQuery.data]);
  const topRows = useMemo(() => topQuery.data?.rows ?? [], [topQuery.data]);
  const lowRows = useMemo(() => lowQuery.data?.rows ?? [], [lowQuery.data]);

  return (
    <div className="grid gap-3">
      <Card>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription className="mt-1">Resumen rápido de hoy y del mes.</CardDescription>

          {q.isLoading ? <div className="mt-3 text-slate-600">Cargando...</div> : null}
          {q.isError ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">No se pudo cargar.</div> : null}

          {q.data ? (
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-700">Hoy</div>
                <div className="mt-1 text-3xl font-extrabold">S/ {money(q.data.today.total)}</div>
                <div className="mt-1 text-slate-600">Ventas: {q.data.today.count}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-700">Este mes</div>
                <div className="mt-1 text-3xl font-extrabold">S/ {money(q.data.month.total)}</div>
                <div className="mt-1 text-slate-600">Ventas: {q.data.month.count}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-700">Productos con bajo stock</div>
                <div className="mt-1 text-3xl font-extrabold">{q.data.lowStockCount}</div>
              </div>
            </div>
          ) : null}
      </Card>

      <Card>
          <CardTitle>Ventas por día</CardTitle>
          <CardDescription className="mt-1">Si no pones fechas, trae los últimos 7 días.</CardDescription>

          <div className="mt-4 grid gap-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Desde</label>
                <Input type="date" value={dailyFrom} onChange={(e) => setDailyFrom(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Hasta</label>
                <Input type="date" value={dailyTo} onChange={(e) => setDailyTo(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="md"
                onClick={() => setDailyApplied({ from: dailyFrom || undefined, to: dailyTo || undefined })}
              >
                Ver
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  setDailyFrom("");
                  setDailyTo("");
                  setDailyApplied({});
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {dailyQuery.isLoading ? <div className="mt-3 text-slate-600">Cargando...</div> : null}
          {dailyQuery.isError ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">No se pudo cargar.</div> : null}

          {dailyRows.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="text-sm text-slate-600">
                    <th className="border-b border-slate-200 pb-2">Día</th>
                    <th className="border-b border-slate-200 pb-2">Ventas</th>
                    <th className="border-b border-slate-200 pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyRows.map((r) => (
                    <tr key={r.date}>
                      <td className="py-2 pr-2 font-semibold">{r.date}</td>
                      <td className="py-2 pr-2">{r.count}</td>
                      <td className="py-2 text-right font-bold">S/ {money(r.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !dailyQuery.isLoading ? (
            <div className="mt-3 text-slate-600">Sin datos para mostrar.</div>
          ) : null}
      </Card>

      <Card>
          <CardTitle>Productos mas vendidos</CardTitle>
          <CardDescription className="mt-1">Productos más vendidos (por variante). Si no pones fechas, usa los últimos 30 días.</CardDescription>

          <div className="mt-4 grid gap-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Desde</label>
                <Input type="date" value={topFrom} onChange={(e) => setTopFrom(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Hasta</label>
                <Input type="date" value={topTo} onChange={(e) => setTopTo(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Límite</label>
              <Input inputMode="numeric" value={topLimit} onChange={(e) => setTopLimit(e.target.value)} placeholder="10" />
            </div>
            <div className="flex gap-2">
              <Button
                size="md"
                onClick={() =>
                  setTopApplied({
                    from: topFrom || undefined,
                    to: topTo || undefined,
                    limit: asNumber(topLimit, 10)
                  })
                }
              >
                Ver
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  setTopFrom("");
                  setTopTo("");
                  setTopLimit("10");
                  setTopApplied({ limit: 10 });
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {topQuery.isLoading ? <div className="mt-3 text-slate-600">Cargando...</div> : null}
          {topQuery.isError ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">No se pudo cargar.</div> : null}

          {topRows.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="text-sm text-slate-600">
                    <th className="border-b border-slate-200 pb-2">Producto</th>
                    <th className="border-b border-slate-200 pb-2">Variante</th>
                    <th className="border-b border-slate-200 pb-2">SKU</th>
                    <th className="border-b border-slate-200 pb-2 text-right">Cant.</th>
                    <th className="border-b border-slate-200 pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {topRows.map((r) => (
                    <tr key={r.variantId}>
                      <td className="py-2 pr-2 font-semibold">{r.productNombre}</td>
                      <td className="py-2 pr-2">{r.variantNombre}</td>
                      <td className="py-2 pr-2 text-sm text-slate-600">{r.sku}</td>
                      <td className="py-2 text-right">{r.quantity}</td>
                      <td className="py-2 text-right font-bold">S/ {money(r.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !topQuery.isLoading ? (
            <div className="mt-3 text-slate-600">Sin datos para mostrar.</div>
          ) : null}
      </Card>

      <Card>
          <CardTitle>Bajo stock</CardTitle>
          <CardDescription className="mt-1">Lista de variantes con stock actual por debajo del mínimo.</CardDescription>

          <div className="mt-4 grid gap-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Límite</label>
              <Input inputMode="numeric" value={lowLimit} onChange={(e) => setLowLimit(e.target.value)} placeholder="50" />
            </div>
            <div className="flex gap-2">
              <Button size="md" onClick={() => setLowApplied({ limit: asNumber(lowLimit, 50) })}>
                Ver
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={() => {
                  setLowLimit("50");
                  setLowApplied({ limit: 50 });
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {lowQuery.isLoading ? <div className="mt-3 text-slate-600">Cargando...</div> : null}
          {lowQuery.isError ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">No se pudo cargar.</div> : null}

          {lowRows.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="text-sm text-slate-600">
                    <th className="border-b border-slate-200 pb-2">Producto</th>
                    <th className="border-b border-slate-200 pb-2">Variante</th>
                    <th className="border-b border-slate-200 pb-2">SKU</th>
                    <th className="border-b border-slate-200 pb-2 text-right">Actual</th>
                    <th className="border-b border-slate-200 pb-2 text-right">Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {lowRows.map((r) => (
                    <tr key={r.variantId}>
                      <td className="py-2 pr-2 font-semibold">{r.productNombre}</td>
                      <td className="py-2 pr-2">{r.variantNombre}</td>
                      <td className="py-2 pr-2 text-sm text-slate-600">{r.sku}</td>
                      <td className="py-2 text-right font-bold">{r.stockActual}</td>
                      <td className="py-2 text-right">{r.stockMinimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !lowQuery.isLoading ? (
            <div className="mt-3 text-slate-600">Sin datos para mostrar.</div>
          ) : null}
      </Card>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { getDashboard, getDailySales, getLowStock, getTopProducts } from "../../features/reports/reports.api";

function money(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toFixed(2);
}

function asNumber(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayRange() {
  const today = toInputDate(new Date());
  return { from: today, to: today };
}

function yesterdayRange() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const yesterday = toInputDate(date);
  return { from: yesterday, to: yesterday };
}

function monthRange() {
  const now = new Date();
  const from = toInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const to = toInputDate(now);
  return { from, to };
}

function SummaryCard({
  label,
  value,
  helper,
  accent
}: {
  label: string;
  value: string;
  helper: string;
  accent: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
          <div className="mt-2 text-sm text-slate-600">{helper}</div>
        </div>
        <div className={`h-12 w-12 rounded-2xl ${accent}`} />
      </div>
    </div>
  );
}

function QuickRangeButtons({
  onToday,
  onYesterday,
  onMonth
}: {
  onToday: () => void;
  onYesterday: () => void;
  onMonth: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="md" variant="secondary" onClick={onToday}>
        Hoy
      </Button>
      <Button size="md" variant="secondary" onClick={onYesterday}>
        Ayer
      </Button>
      <Button size="md" variant="secondary" onClick={onMonth}>
        Este mes
      </Button>
    </div>
  );
}

function TableHead({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`border-b border-slate-200 px-4 py-4 text-sm font-semibold text-slate-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({ children, align = "left", strong = false }: { children: React.ReactNode; align?: "left" | "right"; strong?: boolean }) {
  return (
    <td
      className={`px-4 py-4 text-base ${align === "right" ? "text-right" : "text-left"} ${
        strong ? "font-semibold text-slate-900" : "text-slate-700"
      }`}
    >
      {children}
    </td>
  );
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

  const totalProductsSold = useMemo(
    () => topRows.reduce((acc, row) => acc + asNumber(row.quantity, 0), 0),
    [topRows]
  );

  const applyDailyRange = (range: { from: string; to: string }) => {
    setDailyFrom(range.from);
    setDailyTo(range.to);
    setDailyApplied(range);
  };

  const applyTopRange = (range: { from: string; to: string }) => {
    setTopFrom(range.from);
    setTopTo(range.to);
    setTopApplied({
      from: range.from,
      to: range.to,
      limit: asNumber(topLimit, 10)
    });
  };

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Ventas totales"
          value={q.data ? `S/ ${money(q.data.month.total)}` : "S/ 0.00"}
          helper={q.data ? `${q.data.month.count} ventas este mes` : "Cargando resumen"}
          accent="bg-emerald-100"
        />
        <SummaryCard
          label="Productos vendidos"
          value={String(totalProductsSold || 0)}
          helper="Unidades vendidas en el reporte actual"
          accent="bg-blue-100"
        />
        <SummaryCard
          label="Alertas de stock"
          value={q.data ? String(q.data.lowStockCount) : "0"}
          helper="Productos que necesitan atencion"
          accent="bg-orange-100"
        />
      </section>

      {q.isError ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">No se pudo cargar el resumen.</div> : null}

      <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
        <CardTitle className="text-2xl text-slate-900">Ventas por dia</CardTitle>
        <CardDescription className="mt-2 text-base">
          Mira cuanto vendiste por fecha. Si no eliges una fecha, se usan los ultimos 7 dias.
        </CardDescription>

        <div className="mt-5 grid gap-4">
          <QuickRangeButtons
            onToday={() => applyDailyRange(todayRange())}
            onYesterday={() => applyDailyRange(yesterdayRange())}
            onMonth={() => applyDailyRange(monthRange())}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-base font-semibold text-slate-700">Desde</label>
              <Input type="date" value={dailyFrom} onChange={(e) => setDailyFrom(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-base font-semibold text-slate-700">Hasta</label>
              <Input type="date" value={dailyTo} onChange={(e) => setDailyTo(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => setDailyApplied({ from: dailyFrom || undefined, to: dailyTo || undefined })}
            >
              Buscar
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                setDailyFrom("");
                setDailyTo("");
                setDailyApplied({});
              }}
            >
              Restablecer
            </Button>
          </div>
        </div>

        {dailyQuery.isLoading ? <div className="mt-4 text-slate-600">Cargando...</div> : null}
        {dailyQuery.isError ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-red-700">No se pudo cargar.</div> : null}

        {dailyRows.length ? (
          <div className="mt-5 overflow-x-auto rounded-3xl bg-slate-50/70 ring-1 ring-slate-200">
            <table className="w-full border-collapse">
              <thead className="bg-white/80">
                <tr>
                  <TableHead>Dia</TableHead>
                  <TableHead>Ventas</TableHead>
                  <TableHead align="right">Total</TableHead>
                </tr>
              </thead>
              <tbody>
                {dailyRows.map((row, index) => (
                  <tr key={row.date} className={index % 2 === 0 ? "bg-white/70" : "bg-slate-50/80"}>
                    <TableCell strong>{row.date}</TableCell>
                    <TableCell>{row.count}</TableCell>
                    <TableCell align="right" strong>
                      S/ {money(row.total)}
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !dailyQuery.isLoading ? (
          <div className="mt-4 text-slate-600">Sin datos para mostrar.</div>
        ) : null}
      </Card>

      <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
        <CardTitle className="text-2xl text-slate-900">Productos mas vendidos</CardTitle>
        <CardDescription className="mt-2 text-base">
          Aqui ves los productos que mas se estan moviendo. Si no eliges fechas, se usan los ultimos 30 dias.
        </CardDescription>

        <div className="mt-5 grid gap-4">
          <QuickRangeButtons
            onToday={() => applyTopRange(todayRange())}
            onYesterday={() => applyTopRange(yesterdayRange())}
            onMonth={() => applyTopRange(monthRange())}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-base font-semibold text-slate-700">Desde</label>
              <Input type="date" value={topFrom} onChange={(e) => setTopFrom(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-base font-semibold text-slate-700">Hasta</label>
              <Input type="date" value={topTo} onChange={(e) => setTopTo(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Mostrar cantidad</label>
            <Input inputMode="numeric" value={topLimit} onChange={(e) => setTopLimit(e.target.value)} placeholder="10" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() =>
                setTopApplied({
                  from: topFrom || undefined,
                  to: topTo || undefined,
                  limit: asNumber(topLimit, 10)
                })
              }
            >
              Buscar
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                setTopFrom("");
                setTopTo("");
                setTopLimit("10");
                setTopApplied({ limit: 10 });
              }}
            >
              Restablecer
            </Button>
          </div>
        </div>

        {topQuery.isLoading ? <div className="mt-4 text-slate-600">Cargando...</div> : null}
        {topQuery.isError ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-red-700">No se pudo cargar.</div> : null}

        {topRows.length ? (
          <div className="mt-5 overflow-x-auto rounded-3xl bg-slate-50/70 ring-1 ring-slate-200">
            <table className="w-full border-collapse">
              <thead className="bg-white/80">
                <tr>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo/Medida</TableHead>
                  <TableHead>Codigo</TableHead>
                  <TableHead align="right">Cantidad</TableHead>
                  <TableHead align="right">Total vendido</TableHead>
                </tr>
              </thead>
              <tbody>
                {topRows.map((row, index) => (
                  <tr key={row.variantId} className={index % 2 === 0 ? "bg-white/70" : "bg-slate-50/80"}>
                    <TableCell strong>{row.productNombre}</TableCell>
                    <TableCell>{row.variantNombre}</TableCell>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell align="right">{row.quantity}</TableCell>
                    <TableCell align="right" strong>
                      S/ {money(row.subtotal)}
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !topQuery.isLoading ? (
          <div className="mt-4 text-slate-600">Sin datos para mostrar.</div>
        ) : null}
      </Card>

      <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
        <CardTitle className="text-2xl text-slate-900">Stock bajo</CardTitle>
        <CardDescription className="mt-2 text-base">
          Revisa rapido que productos necesitan reposicion.
        </CardDescription>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Mostrar cantidad</label>
            <Input inputMode="numeric" value={lowLimit} onChange={(e) => setLowLimit(e.target.value)} placeholder="50" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setLowApplied({ limit: asNumber(lowLimit, 50) })}>
              Buscar
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                setLowLimit("50");
                setLowApplied({ limit: 50 });
              }}
            >
              Restablecer
            </Button>
          </div>
        </div>

        {lowQuery.isLoading ? <div className="mt-4 text-slate-600">Cargando...</div> : null}
        {lowQuery.isError ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-red-700">No se pudo cargar.</div> : null}

        {lowRows.length ? (
          <div className="mt-5 overflow-x-auto rounded-3xl bg-slate-50/70 ring-1 ring-slate-200">
            <table className="w-full border-collapse">
              <thead className="bg-white/80">
                <tr>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo/Medida</TableHead>
                  <TableHead>Codigo</TableHead>
                  <TableHead align="right">Stock actual</TableHead>
                  <TableHead align="right">Stock minimo</TableHead>
                </tr>
              </thead>
              <tbody>
                {lowRows.map((row, index) => {
                  const current = asNumber(row.stockActual, 0);
                  const minimum = asNumber(row.stockMinimo, 0);
                  const isCritical = current <= minimum;

                  return (
                    <tr key={row.variantId} className={index % 2 === 0 ? "bg-white/70" : "bg-slate-50/80"}>
                      <TableCell strong>{row.productNombre}</TableCell>
                      <TableCell>{row.variantNombre}</TableCell>
                      <TableCell>{row.sku}</TableCell>
                      <TableCell align="right" strong>
                        <span className={isCritical ? "text-red-600" : "text-slate-900"}>{row.stockActual}</span>
                      </TableCell>
                      <TableCell align="right">{row.stockMinimo}</TableCell>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : !lowQuery.isLoading ? (
          <div className="mt-4 text-slate-600">Sin datos para mostrar.</div>
        ) : null}
      </Card>
    </div>
  );
}

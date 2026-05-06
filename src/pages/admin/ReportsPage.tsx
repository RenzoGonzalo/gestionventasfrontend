import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { getDailySales, getLowStock, getTopProducts } from "../../features/reports/reports.api";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayDDMMYYYY() {
  const d = new Date();
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function ddmmyyyyToISO(input: string) {
  const v = String(input ?? "").trim();
  if (!v) return null;

  // Accept ISO too (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (!Number.isFinite(dd) || !Number.isFinite(mm) || !Number.isFinite(yyyy)) return null;
  if (yyyy < 2000 || yyyy > 2100) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
}

function isoToDDMMYYYY(isoDate: string) {
  const [y, m, d] = String(isoDate).split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

function monthLabelEs(year: number, monthIndex: number) {
  const d = new Date(Date.UTC(year, monthIndex, 1));
  try {
    const label = new Intl.DateTimeFormat("es", { month: "long", year: "numeric", timeZone: "UTC" }).format(d);
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return `${year}-${pad2(monthIndex + 1)}`;
  }
}

function money(value: number) {
  return new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function cardBase() {
  return "mb-6 rounded-xl bg-white p-6 shadow-sm";
}

export function ReportsPage() {
  // Estado (requerido)
  const [dayDate, setDayDate] = useState<string>(() => todayDDMMYYYY());
  const current = useMemo(() => new Date(), []);
  const monthNames = useMemo(
    () => [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre"
    ],
    []
  );
  const yearOptions = useMemo(() => ["2024", "2025", "2026", "2027"], []);

  const defaultYear = yearOptions.includes(String(current.getFullYear()))
    ? String(current.getFullYear())
    : "2026";
  const defaultMonth = monthNames[current.getMonth()] ?? "Mayo";

  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState<string>(defaultYear);

  const [dayAppliedISO, setDayAppliedISO] = useState<string>(() => todayISO());
  const [dayError, setDayError] = useState<string>("");

  const [monthApplied, setMonthApplied] = useState<{ from: string; to: string }>(() => {
    const year = Number(defaultYear);
    const monthIndex = Math.max(0, monthNames.indexOf(defaultMonth));
    const from = `${year}-${pad2(monthIndex + 1)}-01`;
    const to = `${year}-${pad2(monthIndex + 1)}-${pad2(new Date(year, monthIndex + 1, 0).getDate())}`;
    return { from, to };
  });

  const dailyQuery = useQuery({
    queryKey: ["reports", "sales", "daily", { from: dayAppliedISO, to: dayAppliedISO }],
    queryFn: () => getDailySales({ from: dayAppliedISO, to: dayAppliedISO })
  });

  const monthQuery = useQuery({
    queryKey: ["reports", "sales", "month", "top-products", monthApplied],
    queryFn: () => getTopProducts(monthApplied)
  });

  const lowQuery = useQuery({
    queryKey: ["reports", "products", "low-stock", { limit: 200 }],
    queryFn: () => getLowStock({ limit: 200 })
  });

  const dailyRows = useMemo(() => {
    return (dailyQuery.data?.rows ?? []).map((r) => ({
      date: isoToDDMMYYYY(String(r.date)),
      salesCount: Number(r.count) || 0,
      total: Number(r.total) || 0
    }));
  }, [dailyQuery.data]);

  const monthlyRows = useMemo(() => {
    const rows = monthQuery.data?.rows ?? [];
    const byProduct = new Map<string, { quantity: number; total: number }>();

    for (const row of rows) {
      const product = String(row.productNombre);
      const curr = byProduct.get(product) ?? { quantity: 0, total: 0 };
      curr.quantity += Number(row.quantity) || 0;
      curr.total += Number(row.subtotal) || 0;
      byProduct.set(product, curr);
    }

    return Array.from(byProduct.entries())
      .map(([product, v]) => ({ product, quantity: v.quantity, total: v.total }))
      .sort((a, b) => b.total - a.total);
  }, [monthQuery.data]);

  const monthAppliedLabel = useMemo(() => {
    const [y, m] = String(monthApplied.from).split("-");
    const year = Number(y);
    const monthIndex = Number(m) - 1;
    if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) return "";
    return monthLabelEs(year, monthIndex);
  }, [monthApplied]);

  const bestProduct = useMemo(() => {
    const rows = monthQuery.data?.rows ?? [];
    if (!rows.length) return null;

    // Tomamos el mejor por total (subtotal) y, si empata, por cantidad.
    let best = rows[0];
    for (const r of rows) {
      const bestTotal = Number(best.subtotal) || 0;
      const currTotal = Number(r.subtotal) || 0;
      if (currTotal > bestTotal) {
        best = r;
        continue;
      }
      if (currTotal === bestTotal) {
        const bestQty = Number(best.quantity) || 0;
        const currQty = Number(r.quantity) || 0;
        if (currQty > bestQty) best = r;
      }
    }

    const product = [best.productNombre, best.variantNombre].filter(Boolean).join(" - ");
    const quantity = Number(best.quantity) || 0;
    const total = Number(best.subtotal) || 0;
    return { product: product || "—", quantity, total };
  }, [monthQuery.data]);

  const lowAlerts = useMemo(() => {
    const rows = lowQuery.data?.rows ?? [];
    return rows
      .map((r) => {
        const product = [r.productNombre, r.variantNombre].filter(Boolean).join(" - ");
        const stockActual = Number(r.stockActual) || 0;
        const stockMinimo = Number(r.stockMinimo) || 0;
        return { id: r.variantId, product, stockActual, stockMinimo };
      })
      .filter((r) => r.stockActual <= r.stockMinimo)
      .sort((a, b) => a.stockActual - b.stockActual);
  }, [lowQuery.data]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-4">
      {/* TARJETA 1 */}
      <div className={cardBase()}>
        <div className="text-2xl font-bold text-slate-900">📅 Ventas por día</div>

        <div className="mt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                value={dayDate}
                onChange={(e) => {
                  setDayDate(e.target.value);
                  setDayError("");
                }}
                placeholder="dd/mm/aaaa"
                inputMode="numeric"
              />
            </div>
            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                setDayError("");
                setDayDate(todayDDMMYYYY());
                setDayAppliedISO(todayISO());
              }}
              className="sm:h-14"
            >
              Hoy
            </Button>
          </div>

          {dayError ? <div className="mt-2 text-base font-semibold text-red-700">{dayError}</div> : null}

          <div className="mt-3 flex justify-end">
            <Button
              size="md"
              onClick={() => {
                const iso = ddmmyyyyToISO(dayDate);
                if (!iso) {
                  setDayError("Escribe la fecha como dd/mm/aaaa");
                  return;
                }
                setDayError("");
                setDayAppliedISO(iso);
              }}
            >
              Buscar
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="text-left text-base font-semibold text-slate-600">
                <th className="border-b border-slate-200 pb-2">Fecha</th>
                <th className="border-b border-slate-200 pb-2">Cantidad de ventas</th>
                <th className="border-b border-slate-200 pb-2 text-right">Total (S/)</th>
              </tr>
            </thead>
            <tbody>
              {dailyQuery.isLoading ? (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : dailyQuery.isError ? (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-red-700">
                    No se pudo cargar.
                  </td>
                </tr>
              ) : dailyRows.length ? (
                dailyRows.map((r) => (
                  <tr key={r.date} className="text-lg text-slate-800">
                    <td className="py-3 font-semibold text-slate-900">{r.date}</td>
                    <td className="py-3">{r.salesCount}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">S/ {money(r.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-slate-600">
                    Sin datos para esa fecha.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TARJETA 2 */}
      <div className={cardBase()}>
        <div className="text-2xl font-bold text-slate-900">📆 Ventas por mes</div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Mes</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/30"
            >
              {monthNames.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Año</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/30"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            size="md"
            onClick={() => {
              const monthIndex = monthNames.indexOf(selectedMonth);
              const year = Number(selectedYear) || new Date().getFullYear();
              const mIdx = monthIndex >= 0 ? monthIndex : new Date().getMonth();
              const from = `${year}-${pad2(mIdx + 1)}-01`;
              const to = `${year}-${pad2(mIdx + 1)}-${pad2(new Date(year, mIdx + 1, 0).getDate())}`;
              setMonthApplied({ from, to });
            }}
          >
            Buscar
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-base font-semibold text-slate-600">
                <th className="border-b border-slate-200 pb-2">Producto</th>
                <th className="border-b border-slate-200 pb-2 text-right">Cantidad vendida</th>
                <th className="border-b border-slate-200 pb-2 text-right">Total (S/)</th>
              </tr>
            </thead>
            <tbody>
              {monthQuery.isLoading ? (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : monthQuery.isError ? (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-red-700">
                    No se pudo cargar.
                  </td>
                </tr>
              ) : monthlyRows.length ? (
                monthlyRows.map((r) => (
                  <tr key={r.product} className="text-lg text-slate-800">
                    <td className="py-3 font-semibold text-slate-900">{r.product}</td>
                    <td className="py-3 text-right">{r.quantity}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">S/ {money(r.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-slate-600">
                    Sin datos para ese mes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TARJETA 3: PRODUCTO MÁS VENDIDO */}
      <div className={cardBase()}>
        <div className="text-2xl font-bold text-slate-900">🏆 Producto más vendido</div>
        <div className="mt-2 text-lg text-slate-600">
          {monthAppliedLabel ? `Mes: ${monthAppliedLabel}` : "Usa el filtro de mes para ver el resultado"}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-base font-semibold text-slate-600">
                <th className="border-b border-slate-200 pb-2">Producto</th>
                <th className="border-b border-slate-200 pb-2 text-right">Cantidad</th>
                <th className="border-b border-slate-200 pb-2 text-right">Total (S/)</th>
              </tr>
            </thead>
            <tbody>
              {monthQuery.isLoading ? (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : monthQuery.isError ? (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-red-700">
                    No se pudo cargar.
                  </td>
                </tr>
              ) : bestProduct ? (
                <tr className="text-lg text-slate-800">
                  <td className="py-3 font-semibold text-slate-900">{bestProduct.product}</td>
                  <td className="py-3 text-right">{bestProduct.quantity}</td>
                  <td className="py-3 text-right font-semibold text-slate-900">S/ {money(bestProduct.total)}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-slate-600">
                    Sin datos para ese mes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TARJETA 4 */}
      <div className={cardBase()}>
        <div className="text-2xl font-bold text-slate-900">⚠️ Stock bajo / Alertas</div>
        <div className="mt-2 text-lg text-slate-600">Productos que necesitan reposición</div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-base font-semibold text-slate-600">
                <th className="border-b border-slate-200 pb-2">Producto</th>
                <th className="border-b border-slate-200 pb-2 text-right">Stock actual</th>
                <th className="border-b border-slate-200 pb-2 text-right">Stock mínimo</th>
              </tr>
            </thead>
            <tbody>
              {lowQuery.isLoading ? (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : lowQuery.isError ? (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-red-700">
                    No se pudo cargar.
                  </td>
                </tr>
              ) : lowAlerts.length ? (
                lowAlerts.map((r) => (
                  <tr key={r.id} className="text-lg text-slate-800">
                    <td className="py-3 font-semibold text-slate-900">{r.product}</td>
                    <td className="py-3 text-right font-semibold text-red-700">{r.stockActual}</td>
                    <td className="py-3 text-right">{r.stockMinimo}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 text-lg text-slate-600">
                    Sin alertas por ahora.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <Link to="../inventory" relative="path">
            <Button size="md" variant="secondary">
              Ver inventario
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

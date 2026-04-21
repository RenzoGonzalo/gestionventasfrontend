import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { listMySales } from "../../features/sales/sales.api";

function money(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toFixed(2);
}

function saleTitle(sale: {
  items: Array<{ productNombre: string; variantNombre: string }>;
  itemCount: number;
}) {
  const first = sale.items[0];
  if (!first) return "Venta registrada";

  const main = [first.productNombre, first.variantNombre].filter(Boolean).join(" - ");
  if (sale.itemCount <= 1) return main;
  return `${main} + ${sale.itemCount - 1} mas`;
}

export function SellerSalesPage() {
  const q = useQuery({
    queryKey: ["seller-sales"],
    queryFn: () => listMySales()
  });

  const rows = useMemo(() => q.data ?? [], [q.data]);

  return (
    <div className="grid gap-3">
      <Card>
        <CardTitle>Mis ventas</CardTitle>
        <CardDescription className="mt-1">Tus ventas recientes.</CardDescription>

        {q.isLoading ? <div className="mt-3 text-slate-600">Cargando...</div> : null}
        {q.isError ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">No se pudo cargar.</div> : null}

        {rows.length ? (
          <div className="mt-3 grid gap-2">
            {rows.map((s) => (
              <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-bold">{saleTitle(s)}</div>
                    <div className="text-sm text-slate-600">
                      {new Date(s.createdAt as any).toLocaleString()} • Items: {s.itemCount}
                    </div>
                    <div className="mt-1 text-sm">
                      Estado: <span className="font-semibold">{s.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold">S/ {money(s.total)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !q.isLoading ? (
          <div className="mt-3 text-slate-600">Aún no tienes ventas.</div>
        ) : null}
      </Card>
    </div>
  );
}

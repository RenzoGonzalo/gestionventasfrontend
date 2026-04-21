import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { cancelSale, listSales } from "../../features/sales/sales.api";

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

function SummaryBox({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm font-semibold text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-600">{helper}</div>
    </div>
  );
}

export function AdminSalesPage() {
  const qc = useQueryClient();
  const [reason, setReason] = useState("");
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const salesQuery = useQuery({
    queryKey: ["admin-sales"],
    queryFn: () => listSales()
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSale,
    onSuccess: async () => {
      setSelectedSaleId(null);
      setReason("");
      await qc.invalidateQueries({ queryKey: ["admin-sales"] });
    }
  });

  const rows = useMemo(() => salesQuery.data ?? [], [salesQuery.data]);
  const completedCount = useMemo(() => rows.filter((sale) => sale.status !== "ANULADA").length, [rows]);
  const cancelledCount = useMemo(() => rows.filter((sale) => sale.status === "ANULADA").length, [rows]);
  const totalAmount = useMemo(
    () => rows.reduce((acc, sale) => acc + Number(sale.total || 0), 0).toFixed(2),
    [rows]
  );

  return (
    <div className="grid gap-5">
      <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
        <CardTitle className="text-2xl text-slate-900">Ventas recientes</CardTitle>
        <CardDescription className="mt-2 text-base">
          Revisa las ventas registradas y anula solo las que fueron un error.
        </CardDescription>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryBox title="Total mostrado" value={`S/ ${money(totalAmount)}`} helper="Suma de las ventas en esta lista" />
        <SummaryBox title="Ventas activas" value={String(completedCount)} helper="Ventas que siguen vigentes" />
        <SummaryBox title="Ventas anuladas" value={String(cancelledCount)} helper="Ventas que ya fueron revertidas" />
      </section>

      {salesQuery.isLoading ? <div className="text-slate-600">Cargando...</div> : null}
      {salesQuery.isError ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">No se pudo cargar.</div> : null}

      {rows.length ? (
        <div className="grid gap-4">
          {rows.map((sale) => {
            const isCancelled = sale.status === "ANULADA";

            return (
              <Card key={sale.id} className="rounded-3xl border-slate-100 p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="text-2xl font-extrabold text-slate-900">{saleTitle(sale)}</div>
                    <div className="mt-2 text-base text-slate-600">
                      {new Date(sale.createdAt as any).toLocaleString()}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                        {sale.itemCount} producto(s)
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 font-semibold ${
                          isCancelled ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isCancelled ? "Anulada" : "Activa"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <div className="text-3xl font-extrabold text-slate-900">S/ {money(sale.total)}</div>
                    {!isCancelled ? (
                      <Button size="lg" variant="danger" onClick={() => setSelectedSaleId(sale.id)}>
                        Anular venta
                      </Button>
                    ) : null}
                  </div>
                </div>

                {selectedSaleId === sale.id ? (
                  <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-base font-semibold text-slate-800">Motivo de la anulacion</div>
                    <div className="mt-2">
                      <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej: error de cobro" />
                    </div>
                    {cancelMutation.isError ? (
                      <div className="mt-3 text-sm text-red-700">
                        {(cancelMutation.error as any)?.response?.data?.message ?? "No se pudo anular"}
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Button
                        variant="danger"
                        size="lg"
                        disabled={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate({ id: sale.id, reason })}
                      >
                        {cancelMutation.isPending ? "Anulando..." : "Confirmar anulacion"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => {
                          setSelectedSaleId(null);
                          setReason("");
                        }}
                      >
                        Volver
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : !salesQuery.isLoading ? (
        <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
          <div className="text-lg font-bold text-slate-900">Aun no hay ventas registradas</div>
          <div className="mt-2 text-slate-600">Cuando registres ventas, apareceran aqui de forma clara y ordenada.</div>
        </Card>
      ) : null}
    </div>
  );
}

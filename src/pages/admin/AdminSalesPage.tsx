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

  return (
    <div className="grid gap-3">
      <Card>
          <CardTitle>Ventas recientes</CardTitle>
          <CardDescription className="mt-1">Puedes anular una venta si fue un error.</CardDescription>

          {salesQuery.isLoading ? <div className="mt-3 text-slate-600">Cargando...</div> : null}
          {salesQuery.isError ? (
            <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">No se pudo cargar.</div>
          ) : null}

          {rows.length ? (
            <div className="mt-3 grid gap-2">
              {rows.map((s) => (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-lg font-bold">{s.receiptNumber}</div>
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

                  {s.status !== "ANULADA" ? (
                    <div className="mt-3">
                      <Button
                        variant="danger"
                        size="md"
                        onClick={() => setSelectedSaleId(s.id)}
                      >
                        Anular
                      </Button>
                    </div>
                  ) : null}

                  {selectedSaleId === s.id ? (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                      <div className="text-sm font-semibold text-slate-700">Motivo (opcional)</div>
                      <div className="mt-2">
                        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej: error de cobro" />
                      </div>
                      {cancelMutation.isError ? (
                        <div className="mt-2 text-sm text-red-700">
                          {(cancelMutation.error as any)?.response?.data?.message ?? "No se pudo anular"}
                        </div>
                      ) : null}
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="danger"
                          size="md"
                          disabled={cancelMutation.isPending}
                          onClick={() => cancelMutation.mutate({ id: s.id, reason })}
                        >
                          {cancelMutation.isPending ? "Anulando..." : "Confirmar anulación"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => {
                            setSelectedSaleId(null);
                            setReason("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : !salesQuery.isLoading ? (
            <div className="mt-3 text-slate-600">Aún no hay ventas.</div>
          ) : null}
      </Card>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { useToast } from "../../components/ui/toast";
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
  return `${main} + ${sale.itemCount - 1} más`;
}

export function AdminSalesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<"active" | "cancelled">("active");

  const salesQuery = useQuery({
    queryKey: ["admin-sales"],
    queryFn: () => listSales()
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSale,
    onSuccess: async () => {
      toast.success("Venta cancelada");
      setSelectedSaleId(null);
      await qc.invalidateQueries({ queryKey: ["admin-sales"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "No se pudo cancelar la venta";
      toast.error(msg);
    }
  });

  const rows = useMemo(() => salesQuery.data ?? [], [salesQuery.data]);
  const activeRows = useMemo(() => rows.filter((sale) => sale.status !== "ANULADA"), [rows]);
  const cancelledRows = useMemo(() => rows.filter((sale) => sale.status === "ANULADA"), [rows]);
  const activeTotal = useMemo(
    () => activeRows.reduce((acc, sale) => acc + Number(sale.total || 0), 0).toFixed(2),
    [activeRows]
  );
  const cancelledTotal = useMemo(
    () => cancelledRows.reduce((acc, sale) => acc + Number(sale.total || 0), 0).toFixed(2),
    [cancelledRows]
  );

  const ActiveSection = (
    <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="text-2xl text-slate-900">Ventas vigentes</CardTitle>
          <CardDescription className="mt-2 text-base">Total: S/ {money(activeTotal)}</CardDescription>
        </div>
      </div>

      {activeRows.length ? (
        <div className="mt-4 grid gap-3">
          {activeRows.map((sale) => {
            const isExpanded = expandedSaleId === sale.id;

            return (
              <Card key={sale.id} className="rounded-3xl border-slate-100 p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-xl font-extrabold text-slate-900">{saleTitle(sale)}</div>
                    <div className="mt-2 grid gap-1 text-sm text-slate-700">
                      <div>
                        <span className="font-semibold">Fecha:</span> {new Date(sale.createdAt as any).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Monto:</span> S/ {money(sale.total)}
                      </div>
                      <div>
                        <span className="font-semibold">Estado:</span> Vigente
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setExpandedSaleId((prev) => (prev === sale.id ? null : sale.id))}
                    >
                      {isExpanded ? "Ocultar detalles" : "Ver detalles"}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setSelectedSaleId(sale.id)}>
                      Cancelar venta
                    </Button>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-sm font-semibold text-slate-700">Productos en esta venta</div>
                    <div className="mt-2 grid gap-1 text-sm text-slate-700">
                      {sale.items.map((it: any, idx: number) => (
                        <div key={`${sale.id}-${idx}`} className="truncate">
                          • {[it.productNombre, it.variantNombre].filter(Boolean).join(" - ")}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 text-slate-600">No tienes ventas vigentes.</div>
      )}
    </Card>
  );

  const CancelledSection = (
    <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="text-2xl text-slate-900">Ventas canceladas</CardTitle>
          <CardDescription className="mt-2 text-base">Total: S/ {money(cancelledTotal)}</CardDescription>
        </div>
      </div>

      {cancelledRows.length ? (
        <div className="mt-4 grid gap-3">
          {cancelledRows.map((sale) => (
            <Card key={sale.id} className="rounded-3xl border-slate-100 p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xl font-extrabold text-slate-900">{saleTitle(sale)}</div>
                  <div className="mt-2 grid gap-1 text-sm text-slate-700">
                    <div>
                      <span className="font-semibold">Fecha:</span> {new Date(sale.createdAt as any).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-semibold">Monto:</span> S/ {money(sale.total)}
                    </div>
                    <div>
                      <span className="font-semibold">Estado:</span>{" "}
                      <span className="font-semibold text-red-700">Cancelada</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-4 text-slate-600">No tienes ventas canceladas.</div>
      )}
    </Card>
  );

  return (
    <div className="grid gap-5">
      <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
        <CardTitle className="text-2xl text-slate-900">Ventas</CardTitle>
        <CardDescription className="mt-2 text-base">
          Separa las ventas vigentes de las canceladas. Si anulas una venta, no se puede deshacer.
        </CardDescription>
      </Card>

      {salesQuery.isLoading ? <div className="text-slate-600">Cargando...</div> : null}
      {salesQuery.isError ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">No se pudo cargar.</div> : null}

      {!salesQuery.isLoading && !rows.length ? (
        <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
          <div className="text-lg font-bold text-slate-900">Aún no tienes ventas</div>
          <div className="mt-2 text-slate-600">Paso 2: registra una venta y vuelve aquí para revisarla.</div>
          <div className="mt-4">
            <Link to="../inventory" relative="path">
              <Button size="lg">Ver inventario</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      {rows.length ? (
        <div className="grid gap-5">
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="md"
                variant={mobileSection === "active" ? "primary" : "secondary"}
                onClick={() => setMobileSection("active")}
              >
                Vigentes
              </Button>
              <Button
                size="md"
                variant={mobileSection === "cancelled" ? "primary" : "secondary"}
                onClick={() => setMobileSection("cancelled")}
              >
                Canceladas
              </Button>
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-2 md:items-start md:gap-5">
            {ActiveSection}
            {CancelledSection}
          </div>

          <div className="md:hidden">
            {mobileSection === "active" ? ActiveSection : CancelledSection}
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={!!selectedSaleId}
        title="Anular venta"
        description="¿Anular esta venta? No se puede deshacer."
        confirmLabel="Sí, anular"
        cancelLabel="No, volver"
        confirmVariant="danger"
        busy={cancelMutation.isPending}
        onCancel={() => {
          setSelectedSaleId(null);
        }}
        onConfirm={() => {
          if (!selectedSaleId) return;
          cancelMutation.mutate({ id: selectedSaleId });
        }}
      >
        <div className="text-sm text-slate-600">Si fue un error, vuelve a registrarla correctamente.</div>
      </ConfirmDialog>
    </div>
  );
}

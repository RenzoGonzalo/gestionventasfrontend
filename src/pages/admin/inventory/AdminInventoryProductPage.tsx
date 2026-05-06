import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../../components/ui/card";
import { ConfirmDialog } from "../../../components/ui/confirm-dialog";
import { Input } from "../../../components/ui/input";
import { useToast } from "../../../components/ui/toast";
import {
  addVariantToProduct,
  adjustVariantStock,
  deleteVariant,
  getProduct,
  updateVariant
} from "../../../features/inventory/inventory.api";
import { apiMessage, UNIT_TYPES, type UnitTypeValue } from "./inventory.ui";

function toNumberLike(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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

export function AdminInventoryProductPage() {
  const { productId } = useParams();
  const qc = useQueryClient();
  const toast = useToast();

  const [varNombre, setVarNombre] = useState("");
  const [varUnitType, setVarUnitType] = useState<UnitTypeValue>("UND");
  const [varPrecioCompra, setVarPrecioCompra] = useState("");
  const [varPrecioVenta, setVarPrecioVenta] = useState("");
  const [varStockActual, setVarStockActual] = useState("");
  const [varStockMinimo, setVarStockMinimo] = useState("5");

  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editVarNombre, setEditVarNombre] = useState("");
  const [editVarUnitType, setEditVarUnitType] = useState<UnitTypeValue>("UND");
  const [editVarPrecioCompra, setEditVarPrecioCompra] = useState("");
  const [editVarPrecioVenta, setEditVarPrecioVenta] = useState("");
  const [editVarStockMinimo, setEditVarStockMinimo] = useState("5");

  const [adjustingVariantId, setAdjustingVariantId] = useState<string | null>(null);
  const [adjustCantidad, setAdjustCantidad] = useState("");
  const [adjustMotivo, setAdjustMotivo] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nombre: string } | null>(null);

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId as string),
    enabled: !!productId
  });

  const addVariantMutation = useMutation({
    mutationFn: async (input: { productId: string; data: any }) => addVariantToProduct(input.productId, input.data),
    onSuccess: async () => {
      toast.success("Tamaño agregado correctamente");
      setVarNombre("");
      setVarUnitType("UND");
      setVarPrecioCompra("");
      setVarPrecioVenta("");
      setVarStockActual("");
      setVarStockMinimo("5");
      await qc.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (err: any) => {
      toast.error(apiMessage(err, "Error al guardar"));
    }
  });

  const updateVariantMutation = useMutation({
    mutationFn: async (input: { id: string; data: any }) => updateVariant(input.id, input.data),
    onSuccess: async () => {
      setEditingVariantId(null);
      toast.success("Tamaño guardado correctamente");
      await qc.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (err: any) => {
      toast.error(apiMessage(err, "Error al guardar"));
    }
  });

  const deleteVariantMutation = useMutation({
    mutationFn: deleteVariant,
    onSuccess: async () => {
      toast.success("Tamaño eliminado");
      await qc.invalidateQueries({ queryKey: ["product", productId] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(apiMessage(err, "No se pudo eliminar"));
    }
  });

  const adjustStockMutation = useMutation({
    mutationFn: async (input: { id: string; data: any }) => adjustVariantStock(input.id, input.data),
    onSuccess: async () => {
      setAdjustingVariantId(null);
      setAdjustCantidad("");
      setAdjustMotivo("");
      toast.success("Cantidad actualizada");
      await qc.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (err: any) => {
      toast.error(apiMessage(err, "Error al guardar"));
    }
  });

  const product = productQuery.data ?? null;
  const variants = useMemo(() => product?.variantes ?? [], [product]);

  const totalStock = useMemo(
    () => variants.reduce((acc, variant) => acc + toNumberLike(variant.stockActual), 0),
    [variants]
  );

  return (
    <div className="grid gap-5">
      <div>
        <Link to=".." relative="path" className="text-base font-semibold text-slate-700 underline">
          Volver a productos
        </Link>
      </div>

      <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
        <CardTitle className="text-2xl text-slate-900">Ficha del producto</CardTitle>
        <CardDescription className="mt-2 text-base">
          Aquí revisas sus tamaños, la cantidad disponible y los precios. Abajo puedes agregar uno nuevo.
        </CardDescription>

        {productQuery.isLoading ? <div className="mt-4 text-slate-600">Cargando...</div> : null}
        {productQuery.isError ? <div className="mt-4 rounded-2xl bg-red-50 p-4 text-red-700">No se pudo cargar.</div> : null}

        {product ? (
          <div className="mt-5 grid gap-5">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="text-3xl font-extrabold text-slate-900">{product.nombre}</div>
            </div>

            <section className="grid gap-4 md:grid-cols-3">
              <SummaryBox title="Tamaños" value={String(variants.length)} helper="Variantes registradas" />
              <SummaryBox title="Cantidad total" value={String(totalStock)} helper="Suma de todas las variantes" />
              <SummaryBox title="Tamaño base" value={product.unitType} helper="Forma principal de venta" />
            </section>

            <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
              <CardTitle className="text-2xl text-slate-900">Tamaños</CardTitle>
              <CardDescription className="mt-2 text-base">
                Revisa aqui la cantidad y los precios de cada variante.
              </CardDescription>

              <div className="mt-5 grid gap-4">
                {variants.length ? (
                  variants.map((variant) => {
                    const currentStock = toNumberLike(variant.stockActual);
                    const minimumStock = toNumberLike(variant.stockMinimo);
                    const lowStock = currentStock <= minimumStock;

                    return (
                      <div key={variant.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="text-2xl font-extrabold text-slate-900">{variant.nombre}</div>
                            <div className="mt-2 text-sm font-semibold text-slate-600">Tamaño: {variant.unitType}</div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <div className="text-sm font-semibold text-slate-600">Cantidad actual</div>
                                <div className={`mt-1 text-2xl font-extrabold ${lowStock ? "text-red-600" : "text-slate-900"}`}>
                                  {variant.stockActual}
                                </div>
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <div className="text-sm font-semibold text-slate-600">Cantidad minima</div>
                                <div className="mt-1 text-2xl font-extrabold text-slate-900">{variant.stockMinimo}</div>
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <div className="text-sm font-semibold text-slate-600">Precio venta</div>
                                <div className="mt-1 text-2xl font-extrabold text-slate-900">{variant.precioVenta}</div>
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <div className="text-sm font-semibold text-slate-600">Precio compra</div>
                                <div className="mt-1 text-2xl font-extrabold text-slate-900">{variant.precioCompra}</div>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-sm">
                              {lowStock ? (
                                <span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700">
                                  Cantidad baja
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
                            <Button
                              size="lg"
                              onClick={() => {
                                setAdjustingVariantId(variant.id);
                                setAdjustCantidad("");
                                setAdjustMotivo("");
                              }}
                            >
                              Ajustar cantidad
                            </Button>
                            <Button
                              size="lg"
                              variant="secondary"
                              onClick={() => {
                                setEditingVariantId(variant.id);
                                setEditVarNombre(variant.nombre);
                                setEditVarUnitType((variant.unitType as any) ?? "UND");
                                setEditVarPrecioCompra(variant.precioCompra);
                                setEditVarPrecioVenta(variant.precioVenta);
                                setEditVarStockMinimo(variant.stockMinimo);
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              size="lg"
                              variant="danger"
                              disabled={deleteVariantMutation.isPending}
                              onClick={() => {
                                setDeleteTarget({ id: variant.id, nombre: variant.nombre });
                              }}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>

                        {adjustingVariantId === variant.id ? (
                          <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="grid gap-3">
                              <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                  Cantidad a ajustar
                                </label>
                                <Input
                                  value={adjustCantidad}
                                  onChange={(e) => setAdjustCantidad(e.target.value)}
                                  placeholder="Ej: 10 o -2"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Motivo</label>
                                <Input
                                  value={adjustMotivo}
                                  onChange={(e) => setAdjustMotivo(e.target.value)}
                                  placeholder="Ej: ajuste por inventario"
                                />
                              </div>
                              {adjustStockMutation.isError ? (
                                <div className="rounded-2xl bg-red-50 p-3 text-red-700">
                                  {apiMessage(adjustStockMutation.error, "No se pudo ajustar")}
                                </div>
                              ) : null}
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                  size="lg"
                                  disabled={adjustStockMutation.isPending || !adjustCantidad}
                                  onClick={() =>
                                    adjustStockMutation.mutate({
                                      id: variant.id,
                                      data: { cantidad: adjustCantidad, motivo: adjustMotivo || undefined }
                                    })
                                  }
                                >
                                  {adjustStockMutation.isPending ? "Guardando..." : "Aplicar ajuste"}
                                </Button>
                                <Button size="lg" variant="secondary" onClick={() => setAdjustingVariantId(null)}>
                                  Volver
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {editingVariantId === variant.id ? (
                          <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="mb-3 text-lg font-bold text-slate-900">Editar tamaño</div>
                            <div className="grid gap-3">
                              <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
                                <Input value={editVarNombre} onChange={(e) => setEditVarNombre(e.target.value)} />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Tamaño</label>
                                <select
                                  className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-slate-400"
                                  value={editVarUnitType}
                                  onChange={(e) => setEditVarUnitType(e.target.value as any)}
                                >
                                  {UNIT_TYPES.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                      {unit.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Precio compra</label>
                                <Input inputMode="decimal" value={editVarPrecioCompra} onChange={(e) => setEditVarPrecioCompra(e.target.value)} />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Precio venta</label>
                                <Input inputMode="decimal" value={editVarPrecioVenta} onChange={(e) => setEditVarPrecioVenta(e.target.value)} />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Cantidad minima</label>
                                <Input inputMode="decimal" value={editVarStockMinimo} onChange={(e) => setEditVarStockMinimo(e.target.value)} />
                              </div>

                              {updateVariantMutation.isError ? (
                                <div className="rounded-2xl bg-red-50 p-3 text-red-700">
                                  {apiMessage(updateVariantMutation.error, "No se pudo actualizar")}
                                </div>
                              ) : null}

                              <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                  size="lg"
                                  disabled={
                                    updateVariantMutation.isPending ||
                                    !editVarNombre ||
                                    !editVarPrecioCompra ||
                                    !editVarPrecioVenta
                                  }
                                  onClick={() =>
                                    updateVariantMutation.mutate({
                                      id: variant.id,
                                      data: {
                                        nombre: editVarNombre,
                                        unitType: editVarUnitType,
                                        precioCompra: editVarPrecioCompra,
                                        precioVenta: editVarPrecioVenta,
                                        stockMinimo: editVarStockMinimo
                                      }
                                    })
                                  }
                                >
                                  {updateVariantMutation.isPending ? "Guardando..." : "Guardar cambios"}
                                </Button>
                                <Button size="lg" variant="secondary" onClick={() => setEditingVariantId(null)}>
                                  Volver
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-3xl bg-white p-5 text-slate-600 shadow-sm ring-1 ring-slate-200">
                    Este producto aún no tiene tamaños registrados.
                  </div>
                )}
              </div>

              {deleteVariantMutation.isError ? (
                <div className="rounded-2xl bg-red-50 p-3 text-red-700">
                  {apiMessage(deleteVariantMutation.error, "No se pudo eliminar")}
                </div>
              ) : null}
            </Card>

            <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
              <CardTitle className="text-2xl text-slate-900">Agregar tamaño</CardTitle>
              <CardDescription className="mt-2 text-base">Solo lo esencial para vender y controlar cantidad.</CardDescription>

              <div className="mt-5 grid gap-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
                  <Input value={varNombre} onChange={(e) => setVarNombre(e.target.value)} placeholder="Ej: 1 pulgada" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Tamaño</label>
                  <select
                    className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-slate-400"
                    value={varUnitType}
                    onChange={(e) => setVarUnitType(e.target.value as any)}
                  >
                    {UNIT_TYPES.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Precio compra</label>
                  <Input inputMode="decimal" value={varPrecioCompra} onChange={(e) => setVarPrecioCompra(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Precio venta</label>
                  <Input inputMode="decimal" value={varPrecioVenta} onChange={(e) => setVarPrecioVenta(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Cantidad inicial</label>
                  <Input inputMode="decimal" value={varStockActual} onChange={(e) => setVarStockActual(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Cantidad minima</label>
                  <Input inputMode="decimal" value={varStockMinimo} onChange={(e) => setVarStockMinimo(e.target.value)} placeholder="5" />
                </div>

                {addVariantMutation.isError ? (
                  <div className="rounded-2xl bg-red-50 p-3 text-red-700">
                    {apiMessage(addVariantMutation.error, "No se pudo agregar")}
                  </div>
                ) : null}

                <Button
                  size="lg"
                  disabled={addVariantMutation.isPending || !productId || !varNombre || !varPrecioCompra || !varPrecioVenta}
                  onClick={() =>
                    addVariantMutation.mutate({
                      productId: productId as string,
                      data: {
                        nombre: varNombre,
                        unitType: varUnitType,
                        precioCompra: varPrecioCompra,
                        precioVenta: varPrecioVenta,
                        stockActual: varStockActual || undefined,
                        stockMinimo: varStockMinimo || undefined
                      }
                    })
                  }
                >
                  {addVariantMutation.isPending ? "Agregando..." : "Agregar tamaño"}
                </Button>
              </div>
            </Card>
          </div>
        ) : null}

        <ConfirmDialog
          open={!!deleteTarget}
          title={deleteTarget ? `Eliminar “${deleteTarget.nombre}”` : "Eliminar tamaño"}
          description="Este tamaño se eliminará. Esta acción no se puede deshacer."
          confirmLabel="Sí, eliminar"
          cancelLabel="No, volver"
          confirmVariant="danger"
          busy={deleteVariantMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (!deleteTarget) return;
            deleteVariantMutation.mutate(deleteTarget.id);
          }}
        />
      </Card>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
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

export function AdminInventoryProductPage() {
  const { productId } = useParams();
  const qc = useQueryClient();

  const [varNombre, setVarNombre] = useState("");
  const [varSku, setVarSku] = useState("");
  const [varCodigoBarras, setVarCodigoBarras] = useState("");
  const [varUnitType, setVarUnitType] = useState<UnitTypeValue>("UND");
  const [varPrecioCompra, setVarPrecioCompra] = useState("");
  const [varPrecioVenta, setVarPrecioVenta] = useState("");
  const [varStockActual, setVarStockActual] = useState("");
  const [varStockMinimo, setVarStockMinimo] = useState("5");
  const [varUbicacion, setVarUbicacion] = useState("");
  const [varActivo, setVarActivo] = useState(true);

  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editVarNombre, setEditVarNombre] = useState("");
  const [editVarSku, setEditVarSku] = useState("");
  const [editVarCodigoBarras, setEditVarCodigoBarras] = useState("");
  const [editVarUnitType, setEditVarUnitType] = useState<UnitTypeValue>("UND");
  const [editVarPrecioCompra, setEditVarPrecioCompra] = useState("");
  const [editVarPrecioVenta, setEditVarPrecioVenta] = useState("");
  const [editVarStockMinimo, setEditVarStockMinimo] = useState("5");
  const [editVarUbicacion, setEditVarUbicacion] = useState("");
  const [editVarActivo, setEditVarActivo] = useState(true);

  const [adjustingVariantId, setAdjustingVariantId] = useState<string | null>(null);
  const [adjustCantidad, setAdjustCantidad] = useState("");
  const [adjustMotivo, setAdjustMotivo] = useState("");

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId as string),
    enabled: !!productId
  });

  const addVariantMutation = useMutation({
    mutationFn: async (input: { productId: string; data: any }) => addVariantToProduct(input.productId, input.data),
    onSuccess: async () => {
      setVarNombre("");
      setVarSku("");
      setVarCodigoBarras("");
      setVarUnitType("UND");
      setVarPrecioCompra("");
      setVarPrecioVenta("");
      setVarStockActual("");
      setVarStockMinimo("5");
      setVarUbicacion("");
      setVarActivo(true);
      await qc.invalidateQueries({ queryKey: ["product", productId] });
    }
  });

  const updateVariantMutation = useMutation({
    mutationFn: async (input: { id: string; data: any }) => updateVariant(input.id, input.data),
    onSuccess: async () => {
      setEditingVariantId(null);
      await qc.invalidateQueries({ queryKey: ["product", productId] });
    }
  });

  const deleteVariantMutation = useMutation({
    mutationFn: deleteVariant,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["product", productId] });
    }
  });

  const adjustStockMutation = useMutation({
    mutationFn: async (input: { id: string; data: any }) => adjustVariantStock(input.id, input.data),
    onSuccess: async () => {
      setAdjustingVariantId(null);
      setAdjustCantidad("");
      setAdjustMotivo("");
      await qc.invalidateQueries({ queryKey: ["product", productId] });
    }
  });

  const product = productQuery.data ?? null;
  const variants = useMemo(() => product?.variantes ?? [], [product]);

  const totalStock = useMemo(
    () => variants.reduce((acc, variant) => acc + toNumberLike(variant.stockActual), 0),
    [variants]
  );

  return (
    <div className="grid gap-4">
      <div>
        <Link to=".." relative="path" className="text-base font-semibold text-slate-700 underline">
          ← Volver a productos
        </Link>
      </div>

      <Card className="p-5">
        <CardTitle>Producto</CardTitle>
        <CardDescription className="mt-2">
          Aqui ves primero las variantes del producto. Mas abajo puedes agregar una nueva variante.
        </CardDescription>

        {productQuery.isLoading ? <div className="mt-4 text-slate-600">Cargando...</div> : null}
        {productQuery.isError ? <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">No se pudo cargar.</div> : null}

        {product ? (
          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-3xl font-extrabold text-slate-900">{product.nombre}</div>
              <div className="mt-2 text-base text-slate-600">
                {product.descripcion || "Este producto no tiene descripcion."}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-600">Variantes</div>
                <div className="mt-1 text-3xl font-extrabold text-slate-900">{variants.length}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-600">Stock total</div>
                <div className="mt-1 text-3xl font-extrabold text-slate-900">{totalStock}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-600">Unidad</div>
                <div className="mt-1 text-3xl font-extrabold text-slate-900">{product.unitType}</div>
              </div>
            </div>

            <Card className="p-5">
              <CardTitle>Variantes</CardTitle>
              <CardDescription className="mt-2">
                Revisa aqui el stock, los precios y el estado de cada variante.
              </CardDescription>

              <div className="mt-4 grid gap-4">
                {variants.length ? (
                  variants.map((v) => (
                    <div key={v.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="text-2xl font-extrabold text-slate-900">{v.nombre}</div>
                          <div className="mt-2 text-base text-slate-600">SKU: {v.sku}</div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-sm font-semibold text-slate-600">Stock actual</div>
                              <div className="mt-1 text-2xl font-extrabold text-slate-900">{v.stockActual}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-sm font-semibold text-slate-600">Stock minimo</div>
                              <div className="mt-1 text-2xl font-extrabold text-slate-900">{v.stockMinimo}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-sm font-semibold text-slate-600">Precio venta</div>
                              <div className="mt-1 text-2xl font-extrabold text-slate-900">{v.precioVenta}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-sm font-semibold text-slate-600">Precio compra</div>
                              <div className="mt-1 text-2xl font-extrabold text-slate-900">{v.precioCompra}</div>
                            </div>
                          </div>

                          <div className="mt-3 text-sm text-slate-500">
                            Estado: {v.activo ? "Activa" : "Inactiva"}
                            {v.ubicacion ? ` · Ubicacion: ${v.ubicacion}` : ""}
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
                          <Button
                            size="md"
                            onClick={() => {
                              setAdjustingVariantId(v.id);
                              setAdjustCantidad("");
                              setAdjustMotivo("");
                            }}
                          >
                            Ajustar stock
                          </Button>
                          <Button
                            size="md"
                            variant="secondary"
                            onClick={() => {
                              setEditingVariantId(v.id);
                              setEditVarNombre(v.nombre);
                              setEditVarSku(v.sku);
                              setEditVarCodigoBarras(v.codigoBarras ?? "");
                              setEditVarUnitType((v.unitType as any) ?? "UND");
                              setEditVarPrecioCompra(v.precioCompra);
                              setEditVarPrecioVenta(v.precioVenta);
                              setEditVarStockMinimo(v.stockMinimo);
                              setEditVarUbicacion(v.ubicacion ?? "");
                              setEditVarActivo(!!v.activo);
                            }}
                          >
                            Editar variante
                          </Button>
                          <Button
                            size="md"
                            variant="danger"
                            disabled={deleteVariantMutation.isPending}
                            onClick={() => {
                              if (!window.confirm("¿Eliminar esta variante?")) return;
                              deleteVariantMutation.mutate(v.id);
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>

                      {adjustingVariantId === v.id ? (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                          <div className="grid gap-3">
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Cantidad (puede ser negativa)
                              </label>
                              <Input value={adjustCantidad} onChange={(e) => setAdjustCantidad(e.target.value)} placeholder="Ej: 10 o -2" />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Motivo (opcional)</label>
                              <Input value={adjustMotivo} onChange={(e) => setAdjustMotivo(e.target.value)} placeholder="Ej: ajuste por inventario" />
                            </div>
                            {adjustStockMutation.isError ? (
                              <div className="rounded-2xl bg-red-50 p-3 text-red-700">
                                {apiMessage(adjustStockMutation.error, "No se pudo ajustar")}
                              </div>
                            ) : null}
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button
                                size="md"
                                disabled={adjustStockMutation.isPending || !adjustCantidad}
                                onClick={() =>
                                  adjustStockMutation.mutate({
                                    id: v.id,
                                    data: { cantidad: adjustCantidad, motivo: adjustMotivo || undefined }
                                  })
                                }
                              >
                                {adjustStockMutation.isPending ? "Guardando..." : "Aplicar ajuste"}
                              </Button>
                              <Button size="md" variant="secondary" onClick={() => setAdjustingVariantId(null)}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {editingVariantId === v.id ? (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                          <div className="mb-3 text-lg font-bold text-slate-900">Editar variante</div>
                          <div className="grid gap-3">
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
                              <Input value={editVarNombre} onChange={(e) => setEditVarNombre(e.target.value)} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">SKU</label>
                              <Input value={editVarSku} onChange={(e) => setEditVarSku(e.target.value)} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Codigo de barras</label>
                              <Input value={editVarCodigoBarras} onChange={(e) => setEditVarCodigoBarras(e.target.value)} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Unidad</label>
                              <select
                                className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-slate-400"
                                value={editVarUnitType}
                                onChange={(e) => setEditVarUnitType(e.target.value as any)}
                              >
                                {UNIT_TYPES.map((u) => (
                                  <option key={u.value} value={u.value}>
                                    {u.label}
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
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Stock minimo</label>
                              <Input inputMode="decimal" value={editVarStockMinimo} onChange={(e) => setEditVarStockMinimo(e.target.value)} />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Ubicacion</label>
                              <Input value={editVarUbicacion} onChange={(e) => setEditVarUbicacion(e.target.value)} />
                            </div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <input type="checkbox" checked={editVarActivo} onChange={(e) => setEditVarActivo(e.target.checked)} className="h-5 w-5 rounded border-slate-300" />
                              Activa
                            </label>

                            {updateVariantMutation.isError ? (
                              <div className="rounded-2xl bg-red-50 p-3 text-red-700">
                                {apiMessage(updateVariantMutation.error, "No se pudo actualizar")}
                              </div>
                            ) : null}

                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button
                                size="md"
                                disabled={updateVariantMutation.isPending || !editVarNombre || !editVarSku || !editVarPrecioCompra || !editVarPrecioVenta}
                                onClick={() =>
                                  updateVariantMutation.mutate({
                                    id: v.id,
                                    data: {
                                      nombre: editVarNombre,
                                      sku: editVarSku,
                                      codigoBarras: editVarCodigoBarras ? editVarCodigoBarras : undefined,
                                      unitType: editVarUnitType,
                                      precioCompra: editVarPrecioCompra,
                                      precioVenta: editVarPrecioVenta,
                                      stockMinimo: editVarStockMinimo,
                                      ubicacion: editVarUbicacion ? editVarUbicacion : undefined,
                                      activo: editVarActivo
                                    }
                                  })
                                }
                              >
                                {updateVariantMutation.isPending ? "Guardando..." : "Guardar cambios"}
                              </Button>
                              <Button size="md" variant="secondary" onClick={() => setEditingVariantId(null)}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">
                    Este producto aun no tiene variantes.
                  </div>
                )}
              </div>

              {deleteVariantMutation.isError ? (
                <div className="rounded-2xl bg-red-50 p-3 text-red-700">
                  {apiMessage(deleteVariantMutation.error, "No se pudo eliminar")}
                </div>
              ) : null}
            </Card>

            <Card className="p-5">
              <CardTitle>Agregar variante</CardTitle>
              <CardDescription className="mt-2">
                Usa esta parte solo cuando necesites crear una nueva variante para este producto.
              </CardDescription>

              <div className="mt-4 grid gap-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
                  <Input value={varNombre} onChange={(e) => setVarNombre(e.target.value)} placeholder="Ej: 1 pulgada" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">SKU</label>
                  <Input value={varSku} onChange={(e) => setVarSku(e.target.value)} placeholder="Ej: CLAV-001" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Codigo de barras (opcional)</label>
                  <Input value={varCodigoBarras} onChange={(e) => setVarCodigoBarras(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Unidad</label>
                  <select
                    className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-slate-400"
                    value={varUnitType}
                    onChange={(e) => setVarUnitType(e.target.value as any)}
                  >
                    {UNIT_TYPES.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
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
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Stock inicial (opcional)</label>
                  <Input inputMode="decimal" value={varStockActual} onChange={(e) => setVarStockActual(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Stock minimo</label>
                  <Input inputMode="decimal" value={varStockMinimo} onChange={(e) => setVarStockMinimo(e.target.value)} placeholder="5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Ubicacion (opcional)</label>
                  <Input value={varUbicacion} onChange={(e) => setVarUbicacion(e.target.value)} placeholder="Ej: Estante A1" />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={varActivo} onChange={(e) => setVarActivo(e.target.checked)} className="h-5 w-5 rounded border-slate-300" />
                  Activa
                </label>

                {addVariantMutation.isError ? (
                  <div className="rounded-2xl bg-red-50 p-3 text-red-700">
                    {apiMessage(addVariantMutation.error, "No se pudo agregar")}
                  </div>
                ) : null}

                <Button
                  disabled={addVariantMutation.isPending || !productId || !varNombre || !varSku || !varPrecioCompra || !varPrecioVenta}
                  onClick={() =>
                    addVariantMutation.mutate({
                      productId: productId as string,
                      data: {
                        nombre: varNombre,
                        sku: varSku,
                        codigoBarras: varCodigoBarras || undefined,
                        unitType: varUnitType,
                        precioCompra: varPrecioCompra,
                        precioVenta: varPrecioVenta,
                        stockActual: varStockActual || undefined,
                        stockMinimo: varStockMinimo || undefined,
                        ubicacion: varUbicacion || undefined,
                        activo: varActivo
                      }
                    })
                  }
                >
                  {addVariantMutation.isPending ? "Agregando..." : "Agregar variante"}
                </Button>
              </div>
            </Card>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

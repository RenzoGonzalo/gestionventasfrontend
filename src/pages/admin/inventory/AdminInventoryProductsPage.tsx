import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../../components/ui/card";
import { ConfirmDialog } from "../../../components/ui/confirm-dialog";
import { Input } from "../../../components/ui/input";
import { useToast } from "../../../components/ui/toast";
import { deleteProduct, listCategories, listProducts, updateProduct } from "../../../features/inventory/inventory.api";
import type { Category } from "../../../features/inventory/inventory.types";
import { apiMessage, UNIT_TYPES, type UnitTypeValue } from "./inventory.ui";

export function AdminInventoryProductsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProdCategoryId, setEditProdCategoryId] = useState("");
  const [editProdNombre, setEditProdNombre] = useState("");
  const [editProdDesc, setEditProdDesc] = useState("");
  const [editProdUnitType, setEditProdUnitType] = useState<UnitTypeValue>("UND");
  const [editProdActivo, setEditProdActivo] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nombre: string } | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts()
  });

  const updateProductMutation = useMutation({
    mutationFn: async (input: { id: string; data: any }) => updateProduct(input.id, input.data),
    onSuccess: async (updated) => {
      setEditingProductId(null);
      toast.success("Producto guardado correctamente");
      await qc.invalidateQueries({ queryKey: ["products"] });
      await qc.invalidateQueries({ queryKey: ["product", updated.id] });
    },
    onError: (err: any) => {
      toast.error(apiMessage(err, "Error al guardar"));
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      toast.success("Producto eliminado");
      await qc.invalidateQueries({ queryKey: ["products"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(apiMessage(err, "No se pudo eliminar"));
    }
  });

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    for (const category of categories) map.set(category.id, category);
    return map;
  }, [categories]);

  return (
    <div className="grid gap-5">

      <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
        <CardTitle className="text-2xl text-slate-900">Mis productos</CardTitle>
        <CardDescription className="mt-2 text-base">
          Lista simple. Abre detalles solo si lo necesitas.
        </CardDescription>
      </Card>

      {productsQuery.isLoading ? <div className="text-slate-600">Cargando productos...</div> : null}
      {productsQuery.isError ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">No se pudo cargar.</div> : null}

      {products.length ? (
        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id} className="rounded-3xl border-slate-100 p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="text-xl font-extrabold text-slate-900">{product.nombre}</div>
                  <div className="mt-2 text-sm text-slate-600">
                    {categoryById.get(product.categoryId)?.nombre ? (
                      <span className="font-semibold">Categoría:</span>
                    ) : null}
                    {categoryById.get(product.categoryId)?.nombre ? ` ${categoryById.get(product.categoryId)?.nombre}` : " Sin categoría"}
                    {" • "}
                    {product.activo ? "Vigente" : "Inactivo"}
                  </div>

                  <details className="mt-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                    <summary className="cursor-pointer text-sm font-semibold text-blue-700">Ver detalles</summary>
                    <div className="mt-2 grid gap-2 text-sm text-slate-700">
                      {product.descripcion ? <div>{product.descripcion}</div> : <div className="text-slate-600">Sin descripción.</div>}
                      <div>
                        <span className="font-semibold">Tamaño:</span> {product.unitType}
                      </div>
                    </div>
                  </details>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
                  <Button size="lg" onClick={() => navigate(`${product.id}`, { relative: "path" })}>
                    Abrir producto
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => {
                      setEditingProductId(product.id);
                      setEditProdCategoryId(product.categoryId);
                      setEditProdNombre(product.nombre);
                      setEditProdDesc(product.descripcion ?? "");
                      setEditProdUnitType(product.unitType as any);
                      setEditProdActivo(!!product.activo);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="lg"
                    variant="danger"
                    disabled={deleteProductMutation.isPending}
                    onClick={() => {
                      setDeleteTarget({ id: product.id, nombre: product.nombre });
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              {editingProductId === product.id ? (
                <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="mb-3 text-lg font-bold text-slate-900">Editar producto</div>

                  <div className="grid gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Categoria</label>
                      <select
                        className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-slate-400"
                        value={editProdCategoryId}
                        onChange={(e) => setEditProdCategoryId(e.target.value)}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
                      <Input value={editProdNombre} onChange={(e) => setEditProdNombre(e.target.value)} />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Descripcion</label>
                      <Input value={editProdDesc} onChange={(e) => setEditProdDesc(e.target.value)} />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Unidad</label>
                      <select
                        className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-slate-400"
                        value={editProdUnitType}
                        onChange={(e) => setEditProdUnitType(e.target.value as any)}
                      >
                        {UNIT_TYPES.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={editProdActivo}
                        onChange={(e) => setEditProdActivo(e.target.checked)}
                        className="h-5 w-5 rounded border-slate-300"
                      />
                      Activo
                    </label>

                    {updateProductMutation.isError ? (
                      <div className="rounded-2xl bg-red-50 p-3 text-red-700">
                        {apiMessage(updateProductMutation.error, "No se pudo actualizar")}
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        size="lg"
                        disabled={updateProductMutation.isPending || !editProdNombre || !editProdCategoryId}
                        onClick={() =>
                          updateProductMutation.mutate({
                            id: product.id,
                            data: {
                              categoryId: editProdCategoryId,
                              nombre: editProdNombre,
                              descripcion: editProdDesc ? editProdDesc : null,
                              unitType: editProdUnitType,
                              activo: editProdActivo
                            }
                          })
                        }
                      >
                        {updateProductMutation.isPending ? "Guardando..." : "Guardar cambios"}
                      </Button>
                      <Button size="lg" variant="secondary" onClick={() => setEditingProductId(null)}>
                        Volver
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : !productsQuery.isLoading ? (
        <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
          <div className="grid gap-3">
            <div className="text-xl font-bold text-slate-900">Aún no tienes productos</div>
            <div className="text-slate-600">Paso 1: agrega tu primer producto. Haz clic en “Agregar mi primer producto” para empezar.</div>
            <div>
              <Button size="lg" onClick={() => navigate("../create/product", { relative: "path" })}>
                Agregar mi primer producto
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {deleteProductMutation.isError ? (
        <div className="rounded-2xl bg-red-50 p-3 text-red-700">
          {apiMessage(deleteProductMutation.error, "No se pudo eliminar")}
        </div>
      ) : null}

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget ? `Eliminar “${deleteTarget.nombre}”` : "Eliminar producto"}
        description="Este producto se eliminará y ya no aparecerá en tu inventario."
        confirmLabel="Sí, eliminar"
        cancelLabel="No, volver"
        confirmVariant="danger"
        busy={deleteProductMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteProductMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}

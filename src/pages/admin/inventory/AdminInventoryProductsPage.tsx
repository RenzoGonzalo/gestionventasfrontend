import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  deleteProduct,
  listCategories,
  listProducts,
  updateProduct
} from "../../../features/inventory/inventory.api";
import type { Category } from "../../../features/inventory/inventory.types";
import { apiMessage, UNIT_TYPES, type UnitTypeValue } from "./inventory.ui";

export function AdminInventoryProductsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProdCategoryId, setEditProdCategoryId] = useState("");
  const [editProdNombre, setEditProdNombre] = useState("");
  const [editProdDesc, setEditProdDesc] = useState("");
  const [editProdUnitType, setEditProdUnitType] = useState<UnitTypeValue>("UND");
  const [editProdActivo, setEditProdActivo] = useState(true);

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
      await qc.invalidateQueries({ queryKey: ["products"] });
      await qc.invalidateQueries({ queryKey: ["product", updated.id] });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
    }
  });

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Productos</CardTitle>
            <CardDescription className="mt-1">
              Primero elige o crea un producto. Luego entra para manejar sus variantes y su stock.
            </CardDescription>
          </div>

          <Button size="md" onClick={() => navigate("new", { relative: "path" })}>
            Nuevo producto
          </Button>
        </div>
      </Card>

      {productsQuery.isLoading ? <div className="text-slate-600">Cargando productos...</div> : null}
      {productsQuery.isError ? <div className="rounded-xl bg-red-50 p-4 text-red-700">No se pudo cargar.</div> : null}

      {products.length ? (
        <div className="grid gap-4">
          {products.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="text-2xl font-extrabold text-slate-900">{p.nombre}</div>
                  {p.descripcion ? <div className="mt-2 text-base text-slate-600">{p.descripcion}</div> : null}
                  <div className="mt-3 text-sm text-slate-500">
                    {p.activo ? "Activo" : "Inactivo"} · Unidad: {p.unitType}
                    {categoryById.get(p.categoryId)?.nombre ? ` · Categoria: ${categoryById.get(p.categoryId)?.nombre}` : ""}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
                  <Button size="md" onClick={() => navigate(`${p.id}`, { relative: "path" })}>
                    Abrir producto
                  </Button>
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => {
                      setEditingProductId(p.id);
                      setEditProdCategoryId(p.categoryId);
                      setEditProdNombre(p.nombre);
                      setEditProdDesc(p.descripcion ?? "");
                      setEditProdUnitType(p.unitType as any);
                      setEditProdActivo(!!p.activo);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="md"
                    variant="danger"
                    disabled={deleteProductMutation.isPending}
                    onClick={() => {
                      if (!window.confirm("¿Eliminar este producto?")) return;
                      deleteProductMutation.mutate(p.id);
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              {editingProductId === p.id ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <div className="mb-3 text-lg font-bold text-slate-900">Editar producto</div>

                  <div className="grid gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Categoria</label>
                      <select
                        className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-slate-400"
                        value={editProdCategoryId}
                        onChange={(e) => setEditProdCategoryId(e.target.value)}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
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
                        {UNIT_TYPES.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
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
                        size="md"
                        disabled={updateProductMutation.isPending || !editProdNombre || !editProdCategoryId}
                        onClick={() =>
                          updateProductMutation.mutate({
                            id: p.id,
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
                      <Button size="md" variant="secondary" onClick={() => setEditingProductId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : !productsQuery.isLoading ? (
        <Card>
          <div className="grid gap-3">
            <div className="text-xl font-bold text-slate-900">Aun no tienes productos</div>
            <div className="text-slate-600">Empieza creando tu primer producto en una vista mas simple y grande.</div>
            <div>
              <Button onClick={() => navigate("new", { relative: "path" })}>Crear primer producto</Button>
            </div>
          </div>
        </Card>
      ) : null}

      {deleteProductMutation.isError ? (
        <div className="rounded-2xl bg-red-50 p-3 text-red-700">
          {apiMessage(deleteProductMutation.error, "No se pudo eliminar")}
        </div>
      ) : null}
    </div>
  );
}

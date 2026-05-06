import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../../components/ui/card";
import { ConfirmDialog } from "../../../components/ui/confirm-dialog";
import { Input } from "../../../components/ui/input";
import { useToast } from "../../../components/ui/toast";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
} from "../../../features/inventory/inventory.api";
import { apiMessage } from "./inventory.ui";

export function AdminInventoryCategoriesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [catNombre, setCatNombre] = useState("");
  const [catDesc, setCatDesc] = useState("");

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCatNombre, setEditCatNombre] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [editCatActivo, setEditCatActivo] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nombre: string } | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      toast.success("Categoría creada correctamente");
      setCatNombre("");
      setCatDesc("");
      await qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      toast.error(apiMessage(err, "Error al guardar"));
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (input: { id: string; data: { nombre?: string; descripcion?: string | null; activo?: boolean } }) =>
      updateCategory(input.id, input.data),
    onSuccess: async () => {
      setEditingCategoryId(null);
      toast.success("Categoría guardada correctamente");
      await qc.invalidateQueries({ queryKey: ["categories"] });
      await qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => {
      toast.error(apiMessage(err, "Error al guardar"));
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      toast.success("Categoría eliminada");
      await qc.invalidateQueries({ queryKey: ["categories"] });
      await qc.invalidateQueries({ queryKey: ["products"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(apiMessage(err, "No se pudo eliminar"));
    }
  });

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  return (
    <div className="grid gap-3">
      <Card>
        <CardTitle>Categorías</CardTitle>
        <CardDescription className="mt-1">Crea, edita o elimina categorías.</CardDescription>

        <div className="mt-4 grid gap-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
            <Input value={catNombre} onChange={(e) => setCatNombre(e.target.value)} placeholder="Ej: Herramientas" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Descripción (opcional)</label>
            <Input value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Ej: Todo para construcción" />
          </div>

          {createCategoryMutation.isError ? (
            <div className="rounded-2xl bg-red-50 p-3 text-red-700">
              {apiMessage(createCategoryMutation.error, "No se pudo crear")}
            </div>
          ) : null}

          <Button
            disabled={createCategoryMutation.isPending || !catNombre}
            onClick={() => createCategoryMutation.mutate({ nombre: catNombre, descripcion: catDesc })}
          >
            {createCategoryMutation.isPending ? "Creando..." : "Crear categoría"}
          </Button>
        </div>

        {categoriesQuery.isLoading ? <div className="mt-4 text-slate-600">Cargando...</div> : null}
        {categoriesQuery.isError ? (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">No se pudo cargar.</div>
        ) : null}

        {categories.length ? (
          <div className="mt-4 grid gap-2">
            {categories.map((c) => (
              <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-bold">{c.nombre}</div>
                    {c.descripcion ? <div className="mt-1 text-slate-600">{c.descripcion}</div> : null}
                    <div className="mt-1 text-sm text-slate-500">{c.activo ? "Activa" : "Inactiva"}</div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingCategoryId(c.id);
                        setEditCatNombre(c.nombre);
                        setEditCatDesc(c.descripcion ?? "");
                        setEditCatActivo(!!c.activo);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={deleteCategoryMutation.isPending}
                      onClick={() => {
                        setDeleteTarget({ id: c.id, nombre: c.nombre });
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                {editingCategoryId === c.id ? (
                  <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                    <div className="grid gap-2">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
                        <Input value={editCatNombre} onChange={(e) => setEditCatNombre(e.target.value)} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Descripción</label>
                        <Input value={editCatDesc} onChange={(e) => setEditCatDesc(e.target.value)} />
                      </div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={editCatActivo}
                          onChange={(e) => setEditCatActivo(e.target.checked)}
                          className="h-5 w-5 rounded border-slate-300"
                        />
                        Activa
                      </label>

                      {updateCategoryMutation.isError ? (
                        <div className="rounded-2xl bg-red-50 p-3 text-red-700">
                          {apiMessage(updateCategoryMutation.error, "No se pudo actualizar")}
                        </div>
                      ) : null}

                      <div className="flex gap-2">
                        <Button
                          size="md"
                          disabled={updateCategoryMutation.isPending || !editCatNombre}
                          onClick={() =>
                            updateCategoryMutation.mutate({
                              id: c.id,
                              data: {
                                nombre: editCatNombre,
                                descripcion: editCatDesc ? editCatDesc : null,
                                activo: editCatActivo
                              }
                            })
                          }
                        >
                          {updateCategoryMutation.isPending ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button size="md" variant="secondary" onClick={() => setEditingCategoryId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : !categoriesQuery.isLoading ? (
          <div className="mt-4 text-slate-600">Aún no tienes categorías.</div>
        ) : null}

        {deleteCategoryMutation.isError ? (
          <div className="mt-3 rounded-2xl bg-red-50 p-3 text-red-700">
            {apiMessage(deleteCategoryMutation.error, "No se pudo eliminar")}
          </div>
        ) : null}

        <ConfirmDialog
          open={!!deleteTarget}
          title={deleteTarget ? `Eliminar categoría “${deleteTarget.nombre}”` : "Eliminar categoría"}
          description="Se eliminará esta categoría. Si tiene productos asociados, podrían quedar sin categoría."
          confirmLabel="Sí, eliminar"
          cancelLabel="No, volver"
          confirmVariant="danger"
          busy={deleteCategoryMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (!deleteTarget) return;
            deleteCategoryMutation.mutate(deleteTarget.id);
          }}
        />
      </Card>
    </div>
  );
}

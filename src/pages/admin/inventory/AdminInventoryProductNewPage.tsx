import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { createProduct, listCategories } from "../../../features/inventory/inventory.api";
import { apiMessage, UNIT_TYPES, type UnitTypeValue } from "./inventory.ui";

export function AdminInventoryProductNewPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodNombre, setProdNombre] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodUnitType, setProdUnitType] = useState<UnitTypeValue>("UND");
  const [prodActivo, setProdActivo] = useState(true);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      navigate(`../${created.id}`, { relative: "path" });
    }
  });

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  return (
    <div className="grid gap-4">
      <div>
        <Link to=".." relative="path" className="text-base font-semibold text-slate-700 underline">
          ← Volver a productos
        </Link>
      </div>

      <Card className="p-5">
        <CardTitle>Nuevo producto</CardTitle>
        <CardDescription className="mt-2">
          Completa estos datos primero. Las variantes y el stock se agregan despues, dentro del producto.
        </CardDescription>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Categoria</label>
            <select
              className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-slate-400"
              value={prodCategoryId}
              onChange={(e) => setProdCategoryId(e.target.value)}
            >
              <option value="">Selecciona una categoria...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Nombre</label>
            <Input value={prodNombre} onChange={(e) => setProdNombre(e.target.value)} placeholder="Ej: Clavos" />
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Descripcion (opcional)</label>
            <Input value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Ej: Clavos galvanizados" />
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Unidad</label>
            <select
              className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-slate-400"
              value={prodUnitType}
              onChange={(e) => setProdUnitType(e.target.value as any)}
            >
              {UNIT_TYPES.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-base font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={prodActivo}
              onChange={(e) => setProdActivo(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300"
            />
            Producto activo
          </label>

          {createProductMutation.isError ? (
            <div className="rounded-2xl bg-red-50 p-3 text-red-700">
              {apiMessage(createProductMutation.error, "No se pudo crear")}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              disabled={createProductMutation.isPending || !prodCategoryId || !prodNombre}
              onClick={() =>
                createProductMutation.mutate({
                  categoryId: prodCategoryId,
                  nombre: prodNombre,
                  descripcion: prodDesc || undefined,
                  unitType: prodUnitType,
                  activo: prodActivo,
                  atributos: [],
                  variantes: []
                })
              }
            >
              {createProductMutation.isPending ? "Creando..." : "Guardar y abrir producto"}
            </Button>
            <Button variant="secondary" onClick={() => navigate("..", { relative: "path" })}>
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

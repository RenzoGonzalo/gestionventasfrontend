import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { useToast } from "../../../components/ui/toast";
import { createProduct, listCategories } from "../../../features/inventory/inventory.api";
import { apiMessage, UNIT_TYPES, type UnitTypeValue } from "./inventory.ui";

export function AdminInventoryProductNewPage({
  showBackLink = true,
  backTarget = ".."
}: {
  showBackLink?: boolean;
  backTarget?: string;
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();

  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodNombre, setProdNombre] = useState("");
  const [prodUnitType, setProdUnitType] = useState<UnitTypeValue>("UND");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (created) => {
      toast.success("Producto creado correctamente");
      await qc.invalidateQueries({ queryKey: ["products"] });
      const base = backTarget.endsWith("/") ? backTarget.slice(0, -1) : backTarget;
      navigate(`${base}/${created.id}`, { relative: "path" });
    },
    onError: (err: any) => {
      toast.error(apiMessage(err, "Error al guardar"));
    }
  });

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  return (
    <div className="grid gap-5">
      {showBackLink ? (
        <div>
          <Link to={backTarget} relative="path" className="text-base font-semibold text-slate-700 underline">
            Volver a productos
          </Link>
        </div>
      ) : null}

      <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
        <CardTitle className="text-2xl text-slate-900">Nuevo producto</CardTitle>
        <CardDescription className="mt-2 text-base">Primero guarda el producto. Luego podrás agregar sus tamaños.</CardDescription>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Categoria</label>
            <select
              className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-slate-400"
              value={prodCategoryId}
              onChange={(e) => setProdCategoryId(e.target.value)}
            >
              <option value="">Selecciona una categoria...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Nombre</label>
            <Input value={prodNombre} onChange={(e) => setProdNombre(e.target.value)} placeholder="Ej: Clavos" />
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Tamaño</label>
            <select
              className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-slate-400"
              value={prodUnitType}
              onChange={(e) => setProdUnitType(e.target.value as any)}
            >
              {UNIT_TYPES.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          {createProductMutation.isError ? (
            <div className="rounded-2xl bg-red-50 p-3 text-red-700">
              {apiMessage(createProductMutation.error, "No se pudo crear")}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              disabled={createProductMutation.isPending || !prodCategoryId || !prodNombre}
              onClick={() =>
                createProductMutation.mutate({
                  categoryId: prodCategoryId,
                  nombre: prodNombre,
                  unitType: prodUnitType,
                  // Lo demás queda con defaults del backend.
                })
              }
            >
              {createProductMutation.isPending ? "Creando..." : "Guardar y abrir producto"}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate(backTarget, { relative: "path" })}>
              Volver
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

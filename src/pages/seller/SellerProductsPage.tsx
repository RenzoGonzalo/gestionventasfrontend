import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { sellerListVariants, sellerSearchVariants } from "../../features/seller/seller.api";

export function SellerProductsPage() {
  const [q, setQ] = useState("");

  const query = useQuery({
    queryKey: ["seller-products", q],
    queryFn: () => (q.trim() ? sellerSearchVariants(q) : sellerListVariants())
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);

  return (
    <div className="grid gap-3">
      <Card>
        <CardTitle>Productos</CardTitle>
        <CardDescription className="mt-1">Busca un producto para vender (solo consulta).</CardDescription>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Buscar</label>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: clavo, martillo, 1/2" />
        </div>

        {query.isLoading ? <div className="mt-3 text-slate-600">Cargando...</div> : null}
        {query.isError ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">No se pudo cargar.</div> : null}

        {rows.length ? (
          <div className="mt-3 grid gap-2">
            {rows.map((v) => (
              <div key={v.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">{v.productNombre}</div>
                <div className="text-lg font-extrabold">{v.nombre}</div>
                <div className="mt-1 text-sm text-slate-600">Stock: {v.stockActual}</div>
                <div className="mt-1 text-sm text-slate-600">Precio: S/ {v.precioVenta}</div>
              </div>
            ))}
          </div>
        ) : !query.isLoading ? (
          <div className="mt-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="text-lg font-bold text-slate-900">Sin resultados</div>
            <div className="mt-1 text-slate-600">Prueba con otra palabra (ej: clavo, martillo, 1/2).</div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

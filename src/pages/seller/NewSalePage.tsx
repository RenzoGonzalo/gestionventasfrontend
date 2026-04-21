import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { sellerSearchVariants } from "../../features/seller/seller.api";
import type { SellerVariant } from "../../features/seller/seller.types";
import { createSale } from "../../features/sales/sales.api";

type CartLine = {
  variant: SellerVariant;
  qty: number;
};

function money(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toFixed(2);
}

export function NewSalePage() {
  const [q, setQ] = useState("");
  const [submittedQ, setSubmittedQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [done, setDone] = useState<{ receiptNumber: string; total: string } | null>(null);

  const variantsQuery = useQuery({
    queryKey: ["seller-search", submittedQ],
    queryFn: () => sellerSearchVariants(submittedQ),
    enabled: submittedQ.trim().length > 0
  });

  const saleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: (sale) => {
      setDone({ receiptNumber: sale.receiptNumber, total: sale.total });
      setCart([]);
      setQ("");
      setSubmittedQ("");
    }
  });

  const total = useMemo(() => {
    return cart
      .reduce((acc, line) => acc + line.qty * Number(line.variant.precioVenta || 0), 0)
      .toFixed(2);
  }, [cart]);

  const addToCart = (variant: SellerVariant) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.variant.id === variant.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { variant, qty: 1 }];
    });
  };

  const updateQty = (variantId: string, nextQty: number) => {
    setCart((prev) => {
      const next = prev
        .map((x) => (x.variant.id === variantId ? { ...x, qty: nextQty } : x))
        .filter((x) => x.qty > 0);
      return next;
    });
  };

  if (done) {
    return (
      <Card>
        <CardTitle>¡Listo!</CardTitle>
        <CardDescription className="mt-1">
          N° comprobante: <span className="font-semibold">{done.receiptNumber}</span>
        </CardDescription>
        <div className="mt-3 text-3xl font-extrabold">S/ {money(done.total)}</div>

        <div className="mt-4 grid gap-2">
          <Button onClick={() => setDone(null)} className="w-full">
            Nueva venta
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      <Card>
          <CardTitle>1) Buscar producto</CardTitle>
          <CardDescription className="mt-1">Puedes buscar por nombre.</CardDescription>

          <div className="mt-3 flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Escribe aquí..."
            />
            <Button
              size="md"
              onClick={() => setSubmittedQ(q)}
              disabled={q.trim().length === 0}
            >
              Buscar
            </Button>
          </div>

          {variantsQuery.isFetching ? <div className="mt-3 text-slate-600">Buscando...</div> : null}
          {variantsQuery.isError ? (
            <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">
              No se pudo buscar. Intenta de nuevo.
            </div>
          ) : null}

          {variantsQuery.data?.length ? (
            <div className="mt-3 grid gap-2">
              {variantsQuery.data.map((v) => (
                <button
                  key={v.id}
                  onClick={() => addToCart(v)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50"
                >
                  <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {v.productNombre}
                  </div>
                  <div className="text-lg font-bold text-slate-900">{v.nombre}</div>
                  <div className="mt-1 flex items-center justify-between text-slate-700">
                    <div className="text-base">S/ {money(v.precioVenta)}</div>
                    <div className="text-sm">Stock: {money(v.stockActual)}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">Toca para agregar</div>
                </button>
              ))}
            </div>
          ) : submittedQ.trim().length > 0 && !variantsQuery.isFetching ? (
            <div className="mt-3 text-slate-600">Sin resultados.</div>
          ) : null}
      </Card>

      <Card>
          <CardTitle>2) Revisar y cobrar</CardTitle>
          <CardDescription className="mt-1">Ajusta cantidades y presiona Cobrar.</CardDescription>

          {cart.length === 0 ? (
            <div className="mt-3 text-slate-600">Aún no agregaste productos.</div>
          ) : (
            <div className="mt-3 grid gap-2">
              {cart.map((line) => (
                <div key={line.variant.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {line.variant.productNombre}
                  </div>
                  <div className="text-lg font-bold">{line.variant.nombre}</div>
                  <div className="mt-1 flex items-center justify-between text-slate-700">
                    <div>S/ {money(line.variant.precioVenta)}</div>
                    <div className="text-sm">Stock: {money(line.variant.stockActual)}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => updateQty(line.variant.id, line.qty - 1)}
                    >
                      -
                    </Button>
                    <div className="flex h-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-2xl font-extrabold">
                      {line.qty}
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => updateQty(line.variant.id, line.qty + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-lg font-bold">Total</div>
            <div className="text-3xl font-extrabold">S/ {money(total)}</div>
          </div>

          {saleMutation.isError ? (
            <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">
              {(saleMutation.error as any)?.response?.data?.message ?? "No se pudo registrar la venta"}
            </div>
          ) : null}

          <div className="mt-4">
            <Button
              className="w-full"
              disabled={cart.length === 0 || saleMutation.isPending}
              onClick={() => {
                saleMutation.mutate({
                  items: cart.map((line) => ({
                    variantId: line.variant.id,
                    quantity: String(line.qty)
                  }))
                });
              }}
            >
              {saleMutation.isPending ? "Cobrando..." : "Cobrar"}
            </Button>
          </div>
      </Card>
    </div>
  );
}

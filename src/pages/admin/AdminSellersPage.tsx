import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../features/auth/auth.context";
import { createSeller } from "../../features/users/sellers.api";
import { saveLastCreatedSellerName } from "../../features/users/sellers.storage";

export function AdminSellersPage() {
  const { session } = useAuth();
  const [nombre, setNombre] = useState("");
  const [code, setCode] = useState("");
  const [created, setCreated] = useState<{ nombre: string } | null>(null);

  const m = useMutation({
    mutationFn: createSeller,
    onSuccess: (user) => {
      const companySlug = session?.user?.companySlug;
      if (companySlug) {
        saveLastCreatedSellerName(companySlug, user.nombre);
      }
      setCreated({ nombre: user.nombre });
      setNombre("");
      setCode("");
    }
  });

  return (
    <div className="grid gap-5">
      <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
        <CardTitle className="text-2xl text-slate-900">Crear vendedor</CardTitle>
        <CardDescription className="mt-2 text-base">
          Crea un acceso simple para la persona que registrara ventas en tienda.
        </CardDescription>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Nombre</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Perez" />
          </div>
          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">Codigo de acceso (6 digitos)</label>
            <Input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej: 123456"
              inputMode="numeric"
              autoComplete="new-password"
            />
          </div>

          {created ? (
            <div className="rounded-2xl bg-green-50 p-4 text-green-800">
              Vendedor creado: <span className="font-semibold">{created.nombre}</span>
            </div>
          ) : null}

          {m.isError ? (
            <div className="rounded-2xl bg-red-50 p-4 text-red-700">
              {(m.error as any)?.response?.data?.message ?? "No se pudo crear"}
            </div>
          ) : null}

          <Button size="lg" disabled={m.isPending || !nombre || !code} onClick={() => m.mutate({ nombre, code })}>
            {m.isPending ? "Creando..." : "Crear vendedor"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

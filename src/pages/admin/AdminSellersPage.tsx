import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { createSeller } from "../../features/users/sellers.api";

export function AdminSellersPage() {
  const [nombre, setNombre] = useState("");
  const [code, setCode] = useState("");
  const [created, setCreated] = useState<{ nombre: string } | null>(null);

  const m = useMutation({
    mutationFn: createSeller,
    onSuccess: (u) => {
      setCreated({ nombre: u.nombre });
      setNombre("");
      setCode("");
    }
  });

  return (
    <div className="grid gap-3">
      <Card>
        <CardTitle>Crear vendedor</CardTitle>
        <CardDescription className="mt-1">Crea un acceso para un vendedor.</CardDescription>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Perez" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Codigo (6 digitos)</label>
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
            <div className="rounded-2xl bg-green-50 p-3 text-green-800">
              Vendedor creado: <span className="font-semibold">{created.nombre}</span>
            </div>
          ) : null}

          {m.isError ? (
            <div className="rounded-2xl bg-red-50 p-3 text-red-700">
              {(m.error as any)?.response?.data?.message ?? "No se pudo crear"}
            </div>
          ) : null}

          <Button
            disabled={m.isPending || !nombre || !code}
            onClick={() => m.mutate({ nombre, code })}
          >
            {m.isPending ? "Creando..." : "Crear vendedor"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

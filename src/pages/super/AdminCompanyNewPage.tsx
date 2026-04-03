import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { superProvisionCompany } from "../../features/super/companies.api";

export function AdminCompanyNewPage() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [ruc, setRuc] = useState("");
  const [address, setAddress] = useState("");

  const [adminNombre, setAdminNombre] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const m = useMutation({
    mutationFn: superProvisionCompany,
    onSuccess: () => {
      navigate("/admin/companies", { replace: true });
    }
  });

  return (
    <div className="grid gap-3">
      <Card>
        <CardTitle>Nueva empresa</CardTitle>
        <CardDescription className="mt-1">
          Crea la empresa y su STORE_ADMIN (ingresa con Google usando este correo).
        </CardDescription>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre empresa</label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ej: El Martillo" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">RUC (opcional)</label>
            <Input value={ruc} onChange={(e) => setRuc(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Dirección (opcional)</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="mt-2 text-sm font-extrabold text-slate-900">Admin de tienda</div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
            <Input value={adminNombre} onChange={(e) => setAdminNombre(e.target.value)} placeholder="Ej: Admin" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Correo</label>
            <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@tienda.com" />
          </div>

          {m.isError ? (
            <div className="rounded-2xl bg-red-50 p-3 text-red-700">{(m.error as any)?.response?.data?.message ?? "No se pudo crear"}</div>
          ) : null}

          <Button
            disabled={
              m.isPending ||
              !companyName ||
              !adminNombre ||
              !adminEmail
            }
            onClick={() =>
              m.mutate({
                company: { name: companyName, ruc: ruc ? ruc : null, address: address ? address : null },
                admin: { nombre: adminNombre, email: adminEmail }
              })
            }
          >
            {m.isPending ? "Creando..." : "Crear"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

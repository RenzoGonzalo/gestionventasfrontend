import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { superListCompanies, superUpdateCompany } from "../../features/super/companies.api";

export function AdminCompanyEditPage() {
  const { id } = useParams();
  const companyId = String(id ?? "");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["super", "companies"],
    queryFn: superListCompanies
  });

  const company = useMemo(() => (listQuery.data ?? []).find((c) => c.id === companyId) ?? null, [listQuery.data, companyId]);

  const [name, setName] = useState("");
  const [ruc, setRuc] = useState("");
  const [address, setAddress] = useState("");

  const m = useMutation({
    mutationFn: superUpdateCompany,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["super", "companies"] });
      navigate("/admin/companies", { replace: true });
    }
  });

  useEffect(() => {
    if (!company) return;
    setName(company.name);
    setRuc(company.ruc ?? "");
    setAddress(company.address ?? "");
  }, [companyId, company]);

  return (
    <div className="grid gap-3">
      <Card>
        <CardTitle>Editar empresa</CardTitle>
        <CardDescription className="mt-1">Slug (solo lectura): {company?.slug ?? "—"}</CardDescription>

        {listQuery.isLoading ? <div className="mt-3 text-slate-600">Cargando...</div> : null}
        {!listQuery.isLoading && !company ? (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">Empresa no encontrada.</div>
        ) : null}

        {company ? (
          <div className="mt-4 grid gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">RUC</label>
              <Input value={ruc} onChange={(e) => setRuc(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Dirección</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            {m.isError ? (
              <div className="rounded-2xl bg-red-50 p-3 text-red-700">{(m.error as any)?.response?.data?.message ?? "No se pudo guardar"}</div>
            ) : null}

            <div className="flex gap-2">
              <Button
                disabled={m.isPending}
                onClick={() =>
                  m.mutate({
                    id: companyId,
                    name,
                    ruc: ruc ? ruc : null,
                    address: address ? address : null
                  })
                }
              >
                {m.isPending ? "Guardando..." : "Guardar"}
              </Button>
              <Button variant="secondary" onClick={() => navigate("/admin/companies")}>Cancelar</Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

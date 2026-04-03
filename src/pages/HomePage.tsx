import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardTitle } from "../components/ui/card";
import { useAuth } from "../features/auth/auth.context";
import { useMyCompanyQuery } from "../features/companies/useMyCompanyQuery";

export function HomePage() {
  const { primaryRole } = useAuth();
  const myCompanyQuery = useMyCompanyQuery();

  const companyName = myCompanyQuery.data?.name ?? null;

  const companyHeader = companyName ? (
    <Card>
      <CardTitle className="text-2xl">{companyName}</CardTitle>
      <CardDescription className="mt-1">Menú de la empresa</CardDescription>
    </Card>
  ) : null;

  if (primaryRole === "SELLER") {
    return (
      <div className="grid gap-3">
        {companyHeader}
        <Link to="seller/sales">
          <Button className="w-full">Nueva venta</Button>
        </Link>
        <Link to="seller/sales">
          <Button variant="secondary" className="w-full">Buscar producto</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {companyHeader}
      <Link to="admin/sales">
        <Button className="w-full">Ventas</Button>
      </Link>
      <Link to="caja">
        <Button variant="secondary" className="w-full">Caja</Button>
      </Link>
      <Link to="admin/inventory">
        <Button variant="secondary" className="w-full">Inventario</Button>
      </Link>
      <Link to="admin/reports">
        <Button variant="secondary" className="w-full">Reportes</Button>
      </Link>
      <Link to="admin/sellers">
        <Button variant="secondary" className="w-full">Vendedores</Button>
      </Link>
    </div>
  );
}

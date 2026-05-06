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
        <Card>
          <CardTitle className="text-xl">Primeros pasos</CardTitle>
          <CardDescription className="mt-1">
            1) Busca el producto • 2) Haz clic en “Vender” para registrar la venta
          </CardDescription>
        </Card>
        <Link to="seller/sales/new">
          <Button className="w-full">Vender</Button>
        </Link>
        <Link to="seller/products">
          <Button variant="secondary" className="w-full">Buscar producto</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {companyHeader}
      <Card>
        <CardTitle className="text-xl">Primeros pasos</CardTitle>
        <CardDescription className="mt-1">
          1) Agrega tu primer producto • 2) Revisa tus ventas
        </CardDescription>
      </Card>
      <Link to="admin/sales">
        <Button className="w-full">Ver ventas</Button>
      </Link>
      <Link to="admin/inventory">
        <Button variant="secondary" className="w-full">Ver inventario</Button>
      </Link>
      <Link to="admin/dashboard">
        <Button variant="secondary" className="w-full">Resumen</Button>
      </Link>
      <Link to="admin/reports">
        <Button variant="secondary" className="w-full">Reportes</Button>
      </Link>
      <Link to="admin/users/sellers">
        <Button variant="secondary" className="w-full">Vendedores</Button>
      </Link>
    </div>
  );
}

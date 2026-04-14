import { Outlet, NavLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";

function tabClass(isActive: boolean) {
  return isActive
    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50";
}

export function AdminInventoryPage() {
  return (
    <div className="grid gap-5">
      <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
        <CardTitle className="text-2xl text-slate-900">Inventario</CardTitle>
        <CardDescription className="mt-2 text-base">
          Mantengamos esto simple: primero categorias y productos. Luego, dentro de cada producto, manejas tipos, medidas y stock.
        </CardDescription>

        <div className="mt-5 flex flex-wrap gap-3">
          <NavLink to="categories" end>
            {({ isActive }) => (
              <Button size="lg" className={tabClass(isActive)}>
                Categorias
              </Button>
            )}
          </NavLink>
          <NavLink to="products">
            {({ isActive }) => (
              <Button size="lg" className={tabClass(isActive)}>
                Productos
              </Button>
            )}
          </NavLink>
        </div>
      </Card>

      <Outlet />
    </div>
  );
}

import { NavLink, Outlet } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../../components/ui/card";

function tabClass(isActive: boolean) {
  return isActive
    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50";
}

export function AdminInventoryCreatePage() {
  return (
    <div className="grid gap-5">
      <Card className="rounded-3xl border-slate-100 p-6 shadow-sm">
        <CardTitle className="text-2xl text-slate-900">Agregar al inventario</CardTitle>
        <CardDescription className="mt-2 text-base">
          Aquí creas categorías y registras productos nuevos.
        </CardDescription>

        <div className="mt-5 flex flex-wrap gap-3">
          <NavLink to="categories" end>
            {({ isActive }) => (
              <Button size="lg" className={tabClass(isActive)}>
                Categorías
              </Button>
            )}
          </NavLink>
          <NavLink to="product">
            {({ isActive }) => (
              <Button size="lg" className={tabClass(isActive)}>
                Nuevo producto
              </Button>
            )}
          </NavLink>
        </div>
      </Card>

      <Outlet />
    </div>
  );
}

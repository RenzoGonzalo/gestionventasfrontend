import { Outlet, NavLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";

function tabClass(isActive: boolean) {
  return isActive ? "shadow-sm" : undefined;
}

export function AdminInventoryPage() {
  return (
    <div className="grid gap-3">
      <Card>
        <CardTitle>Inventario</CardTitle>
        <CardDescription className="mt-1">
          Mantenlo simple: crea categorias y productos. Las variantes y el stock se gestionan dentro de cada producto.
        </CardDescription>

        <div className="mt-4 flex flex-wrap gap-2">
          <NavLink to="categories" end>
            {({ isActive }) => (
              <Button size="md" variant={isActive ? "primary" : "secondary"} className={tabClass(isActive)}>
                Categorias
              </Button>
            )}
          </NavLink>
          <NavLink to="products">
            {({ isActive }) => (
              <Button size="md" variant={isActive ? "primary" : "secondary"} className={tabClass(isActive)}>
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

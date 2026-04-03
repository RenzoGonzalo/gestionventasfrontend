import { Link } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";

export function AdminInventoryVariantsPage() {
  return (
    <div className="grid gap-3">
      <Card>
        <CardTitle>Variantes</CardTitle>
        <CardDescription className="mt-1">
          Selecciona un producto para administrar sus variantes.
        </CardDescription>
        <div className="mt-4 text-sm">
          <Link to="../products" relative="path" className="font-semibold text-slate-700 underline">
            Ir a productos
          </Link>
        </div>
      </Card>
    </div>
  );
}

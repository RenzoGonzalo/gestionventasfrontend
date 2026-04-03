import { Link } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";

export function AdminStockAdjustPage() {
  return (
    <div className="grid gap-3">
      <Card>
        <CardTitle>Ajuste de stock</CardTitle>
        <CardDescription className="mt-1">
          El ajuste de stock se realiza dentro de un producto (en sus variantes).
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

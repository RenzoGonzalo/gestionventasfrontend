import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-extrabold">Página no encontrada</h1>
        <p className="mt-2 text-slate-600">La dirección no existe.</p>
        <div className="mt-4">
          <Link to="/">
            <Button>Ir al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

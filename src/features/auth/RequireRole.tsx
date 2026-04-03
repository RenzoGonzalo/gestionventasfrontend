import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "./auth.types";
import { useAuth } from "./auth.context";

export function RequireRole({ anyOf }: { anyOf: Role[] }) {
  const { roles } = useAuth();
  const ok = anyOf.some((r) => roles.includes(r));

  if (!ok) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

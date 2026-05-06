import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../features/auth/auth.context";
import { resendSuperAdminVerificationEmail } from "../features/auth/auth.api";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginAdmin, loginSeller, loginStoreAdminWithGoogle } = useAuth();

  const [mode, setMode] = useState<"seller" | "super_admin" | "store_admin">("seller");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sellerNombre, setSellerNombre] = useState("");
  const [sellerCode, setSellerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

  const verified = searchParams.get("verified") === "1";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "seller") {
        await loginSeller({ nombre: sellerNombre, code: sellerCode });
      } else {
        await loginAdmin({ email, password });
      }
      navigate("/", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "No se pudo iniciar sesión";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const canResendVerification =
    mode === "super_admin" &&
    Boolean(email) &&
    (error?.toLowerCase().includes("verificar tu correo") ?? false);

  return (
    <div className="relative min-h-screen bg-slate-50">
      <Button
        type="button"
        size="sm"
        variant={mode === "super_admin" ? "primary" : "secondary"}
        className="absolute left-4 top-4 z-10"
        onClick={() => setMode("super_admin")}
      >
        Soy súper admin
      </Button>
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Ingresar</h1>
          <p className="mt-1 text-slate-600">Usa tu correo y contraseña.</p>
        </div>

        {verified ? (
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
            Correo verificado. Ya puedes iniciar sesión.
          </div>
        ) : null}

        <Card>
          <CardTitle>¿Quién eres?</CardTitle>
          <CardDescription className="mt-1">Elige una opción para entrar.</CardDescription>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={mode === "seller" ? "primary" : "secondary"}
              onClick={() => setMode("seller")}
            >
              Vendedor
            </Button>
            <Button
              type="button"
              variant={mode === "store_admin" ? "primary" : "secondary"}
              onClick={() => setMode("store_admin")}
            >
              Admin Tienda
            </Button>
          </div>

          {mode === "store_admin" ? (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-sm text-slate-600">
                Entra con tu cuenta de Google (solo para administradores de tienda).
              </p>

              {!googleClientId ? (
                <div className="rounded-xl bg-amber-50 p-3 text-amber-800">
                  Falta configurar <b>VITE_GOOGLE_CLIENT_ID</b> en el frontend.
                </div>
              ) : null}

              {error ? <div className="rounded-xl bg-red-50 p-3 text-red-700">{error}</div> : null}
              {info ? <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800">{info}</div> : null}

              <div className="flex justify-start">
                <GoogleLogin
                  onSuccess={async (cred) => {
                    try {
                      setError(null);
                      setLoading(true);
                      const idToken = String(cred?.credential || "");
                      await loginStoreAdminWithGoogle(idToken);
                      navigate("/", { replace: true });
                    } catch (err: any) {
                      const msg =
                        err?.response?.data?.message ?? err?.message ?? "No se pudo iniciar sesión";
                      setError(String(msg));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={() => {
                    setError("No se pudo iniciar sesión con Google");
                  }}
                />
              </div>
            </div>
          ) : mode === "seller" ? (
            <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
                <Input
                  value={sellerNombre}
                  onChange={(e) => setSellerNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Código (6 dígitos)</label>
                <Input
                  type="password"
                  value={sellerCode}
                  onChange={(e) => setSellerCode(e.target.value)}
                  placeholder="Ej: 123456"
                  inputMode="numeric"
                  autoComplete="current-password"
                />
              </div>

              {error ? <div className="rounded-xl bg-red-50 p-3 text-red-700">{error}</div> : null}

              <Button disabled={loading || !sellerNombre || !sellerCode}>
                {loading ? "Ingresando..." : "Entrar"}
              </Button>
            </form>
          ) : (
            <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Correo</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Contraseña</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                />
              </div>

              {error ? <div className="rounded-xl bg-red-50 p-3 text-red-700">{error}</div> : null}

              {error?.toLowerCase().includes("verificar tu correo") ? (
                <div className="rounded-xl bg-amber-50 p-3 text-amber-800">
                  Revisa tu bandeja (y spam) y abre el link de verificación.
                </div>
              ) : null}

              {canResendVerification ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading}
                  onClick={async () => {
                    try {
                      setError(null);
                      setInfo(null);
                      setLoading(true);
                      const res = await resendSuperAdminVerificationEmail(email);
                      setInfo(res.message || "Correo reenviado");
                    } catch (err: any) {
                      const msg = err?.response?.data?.message ?? err?.message ?? "No se pudo reenviar";
                      setError(String(msg));
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Reenviar correo de verificación
                </Button>
              ) : null}

              <Button disabled={loading || !email || !password}>
                {loading ? "Ingresando..." : "Entrar"}
              </Button>
            </form>
          )}
        </Card>

        <div className="text-sm text-slate-500">
          Si no puedes entrar, pide ayuda al administrador.
        </div>
      </div>
    </div>
  );
}

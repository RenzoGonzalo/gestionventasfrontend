import React, { createContext, useContext, useMemo, useState } from "react";
import type { AuthSession, Role } from "./auth.types";
import { clearSession, getSession, setSession } from "./auth.session";
import { loginAdmin, loginSeller, loginStoreAdminWithGoogle } from "./auth.api";

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  roles: Role[];
  primaryRole: Role | null;
  loginAdmin: (input: { email: string; password: string }) => Promise<void>;
  loginSeller: (input: { nombre: string; code: string }) => Promise<void>;
  loginStoreAdminWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function pickPrimaryRole(roles: Role[]): Role | null {
  if (roles.includes("SUPER_ADMIN")) return "SUPER_ADMIN";
  if (roles.includes("STORE_ADMIN")) return "STORE_ADMIN";
  if (roles.includes("SELLER")) return "SELLER";
  return roles[0] ?? null;
}

function isRole(value: unknown): value is Role {
  return value === "SUPER_ADMIN" || value === "STORE_ADMIN" || value === "SELLER";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => getSession());

  const doLoginAdmin = async (input: { email: string; password: string }) => {
    const result = await loginAdmin(input);
    const next: AuthSession = { token: result.token, user: { ...result.user } };
    setSession(next);
    setSessionState(next);
  };

  const doLoginSeller = async (input: { nombre: string; code: string }) => {
    const result = await loginSeller(input);
    const next: AuthSession = { token: result.token, user: { ...result.user, rol: "SELLER" } };
    setSession(next);
    setSessionState(next);
  };

  const loginWithGoogle = async (idToken: string) => {
    const result = await loginStoreAdminWithGoogle(idToken);
    // Forzamos rol STORE_ADMIN para el flujo de login por Google.
    const next: AuthSession = { token: result.token, user: { ...result.user, rol: "STORE_ADMIN" } };
    setSession(next);
    setSessionState(next);
  };

  const logout = () => {
    clearSession();
    setSessionState(null);
  };

  const value = useMemo<AuthContextValue>(() => {
    const roles = (session?.user.roles ?? []) as Role[];
    const preferred = isRole(session?.user?.rol) ? session?.user?.rol : null;
    return {
      session,
      isAuthenticated: Boolean(session?.token),
      roles,
      primaryRole: preferred ?? pickPrimaryRole(roles),
      loginAdmin: doLoginAdmin,
      loginSeller: doLoginSeller,
      loginStoreAdminWithGoogle: loginWithGoogle,
      logout
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

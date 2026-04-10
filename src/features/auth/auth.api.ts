import { api } from "../../lib/api";
import {
  loginRequestSchema,
  loginResponseSchema,
  sellerCodeLoginRequestSchema,
  type LoginRequest,
  type LoginResponse,
  type SellerCodeLoginRequest
} from "./auth.types";

export async function loginAdmin(input: LoginRequest): Promise<LoginResponse> {
  const payload = loginRequestSchema.parse(input);
  const res = await api.post("/auth/login", payload);
  return loginResponseSchema.parse(res.data);
}

export async function loginSeller(input: SellerCodeLoginRequest): Promise<LoginResponse> {
  const payload = sellerCodeLoginRequestSchema.parse(input);
  const res = await api.post("/auth/seller-login", payload);
  return loginResponseSchema.parse(res.data);
}

export async function loginStoreAdminWithGoogle(idToken: string): Promise<LoginResponse> {
  const token = String(idToken || "").trim();
  if (!token) throw new Error("Token de Google requerido");
  const res = await api.post("/api/auth/google-login", { idToken: token });
  return loginResponseSchema.parse(res.data);
}

export async function resendSuperAdminVerificationEmail(email: string): Promise<{ message: string }> {
  const normalized = String(email || "").trim();
  const res = await api.post("/api/auth/resend-verification", { email: normalized });
  return res.data as { message: string };
}

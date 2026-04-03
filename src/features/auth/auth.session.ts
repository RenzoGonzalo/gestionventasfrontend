import type { AuthSession } from "./auth.types";
import { readJson, removeKey, writeJson } from "../../lib/storage";

const AUTH_SESSION_KEY = "gv.auth.session";

export function getSession(): AuthSession | null {
  return readJson<AuthSession>(AUTH_SESSION_KEY);
}

export function setSession(session: AuthSession) {
  writeJson(AUTH_SESSION_KEY, session);
}

export function clearSession() {
  removeKey(AUTH_SESSION_KEY);
}

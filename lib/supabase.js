import { SUPABASE_URL, SUPABASE_ANON, limpio } from "./env";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente con privilegios totales. SOLO en el servidor.
export function adminDb() {
  return createClient(SUPABASE_URL, limpio(process.env.SUPABASE_SERVICE_ROLE_KEY), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Cliente con la sesión del usuario (para saber quién está conectado).
export async function sessionClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch {}
      },
    },
  });
}

export async function usuarioActual() {
  const sb = await sessionClient();
  const { data } = await sb.auth.getUser();
  return data?.user || null;
}

export function esAdmin(user) {
  if (!user?.email) return false;
  const lista = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return lista.includes(user.email.toLowerCase());
}

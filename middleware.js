import { SUPABASE_URL, SUPABASE_ANON } from "@/lib/env";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Mantiene viva la sesión de Supabase en cada visita.
export async function middleware(request) {
  let response = NextResponse.next({ request });
  if (!SUPABASE_URL) return response;
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/mp|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

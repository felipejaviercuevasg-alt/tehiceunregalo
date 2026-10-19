import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  let next = url.searchParams.get("next") || decodeURIComponent(request.cookies.get("thur_next")?.value || "") || "/mis-celebraciones";
  if (!next.startsWith("/") || next.startsWith("//")) next = "/mis-celebraciones";
  if (code) {
    const sb = await sessionClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) {
      const res = NextResponse.redirect(new URL(next, url.origin));
      res.cookies.delete("thur_next");
      return res;
    }
  }
  return NextResponse.redirect(new URL("/entrar?error=1", url.origin));
}

import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase";

export async function POST(request) {
  const sb = await sessionClient();
  await sb.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

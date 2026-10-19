"use client";
import { SUPABASE_URL, SUPABASE_ANON } from "./env";
import { createBrowserClient } from "@supabase/ssr";

export function browserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
}

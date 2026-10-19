// Limpia valores pegados en Vercel: quita espacios, saltos de línea,
// comillas tipográficas y cualquier carácter no ASCII invisible.
export const limpio = (v) => String(v || "").replace(/[^\x21-\x7E]/g, "").replace(/^["']|["']$/g, "");

export const SUPABASE_URL = limpio(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/+$/, "");
export const SUPABASE_ANON = limpio(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

import { NextResponse } from "next/server";
import { conciliarPago } from "@/lib/datos";

// Mercado Pago avisa aquí cuando cambia un pago. No confiamos en el aviso:
// consultamos el pago directamente a Mercado Pago con nuestra clave antes de aprobarlo.
export async function POST(request) {
  const url = new URL(request.url);
  let body = {};
  try { body = await request.json(); } catch {}
  const tipo = body.type || body.topic || url.searchParams.get("type") || url.searchParams.get("topic");
  const id = body?.data?.id || url.searchParams.get("data.id") || (tipo === "payment" ? url.searchParams.get("id") : null);
  if (tipo === "payment" && id && /^\d+$/.test(String(id))) {
    try { await conciliarPago(String(id)); } catch (e) { console.error("webhook", e); return NextResponse.json({ ok: false }, { status: 500 }); }
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

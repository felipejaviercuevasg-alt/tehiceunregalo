import { NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase";
import { crearPreferencia } from "@/lib/mercadopago";

const txt = (v, max) => String(v ?? "").trim().slice(0, max);

export async function POST(request) {
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ error: "Datos inválidos." }, { status: 400 }); }
  const nombre = txt(b.nombre, 60);
  if (!nombre) return NextResponse.json({ error: "Escribe tu nombre." }, { status: 400 });
  const email = txt(b.email, 120).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });

  const db = adminDb();
  const { data: cel } = await db.from("celebraciones").select("id, slug, nombre, estado").eq("slug", txt(b.slug, 80)).maybeSingle();
  if (!cel) return NextResponse.json({ error: "No encontramos la celebración." }, { status: 404 });
  if (cel.estado !== "activa") return NextResponse.json({ error: "Esta celebración ya no recibe regalos." }, { status: 400 });

  let fila = { celebracion_id: cel.id, nombre, mensaje: txt(b.mensaje, 280) || null };
  let titulo;

  if (b.regaloId) {
    const { data: r } = await db.from("regalos").select("id, nombre, meta").eq("id", b.regaloId).eq("celebracion_id", cel.id).maybeSingle();
    if (!r) return NextResponse.json({ error: "Ese regalo ya no existe." }, { status: 404 });
    const { data: aps } = await db.from("aportes").select("monto").eq("regalo_id", r.id).eq("estado", "aprobado");
    const restante = r.meta - (aps || []).reduce((s, a) => s + a.monto, 0);
    if (restante < 1) return NextResponse.json({ error: "¡Este regalo ya completó su meta!" }, { status: 400 });
    const maxPct = Math.max(1, Math.ceil((restante / r.meta) * 100));
    const pct = Math.round(Number(b.porcentaje));
    if (!(pct >= 1 && pct <= maxPct)) return NextResponse.json({ error: `Puedes aportar hasta el ${maxPct}% de este regalo.` }, { status: 400 });
    const monto = pct >= maxPct ? restante : Math.round((r.meta * pct) / 100);
    if (monto < 1000) return NextResponse.json({ error: "El aporte mínimo es $1.000. Elige un porcentaje mayor." }, { status: 400 });
    fila = { ...fila, regalo_id: r.id, porcentaje: pct, monto };
    titulo = `Regalo para ${cel.nombre}: ${pct}% de ${r.nombre}`;
  } else if (b.deseoId) {
    const { data: d } = await db.from("deseos").select("id, titulo").eq("id", b.deseoId).eq("celebracion_id", cel.id).maybeSingle();
    if (!d) return NextResponse.json({ error: "Ese deseo ya no existe." }, { status: 404 });
    const monto = Math.round(Number(b.monto));
    if (!(monto >= 1000 && monto <= 5000000)) return NextResponse.json({ error: "El monto debe estar entre $1.000 y $5.000.000." }, { status: 400 });
    fila = { ...fila, deseo_id: d.id, monto };
    titulo = `Regalo para ${cel.nombre}: ${d.titulo}`;
  } else {
    return NextResponse.json({ error: "Elige un regalo o un deseo." }, { status: 400 });
  }

  const { data: aporte, error } = await db.from("aportes").insert(fila).select("id, monto").single();
  if (error) { console.error(error); return NextResponse.json({ error: "No pudimos registrar tu aporte." }, { status: 500 }); }

  try {
    const url = await crearPreferencia({ aporteId: aporte.id, titulo, monto: aporte.monto, slug: cel.slug, pagador: { nombre, email } });
    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    await db.from("aportes").update({ estado: "rechazado" }).eq("id", aporte.id);
    return NextResponse.json({ error: "No pudimos conectar con Mercado Pago. Inténtalo de nuevo en unos minutos." }, { status: 502 });
  }
}

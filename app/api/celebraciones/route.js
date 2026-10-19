import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { adminDb, usuarioActual } from "@/lib/supabase";
import { cifrar } from "@/lib/cripto";
import { rutValido } from "@/lib/rut";
import { tituloCelebracion } from "@/lib/datos";
import { leerLugar } from "@/lib/lugar";
import { leerRedes } from "@/lib/redes";

const txt = (v, max) => String(v ?? "").trim().slice(0, max);

function crearSlug(nombre) {
  const base = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "celebracion";
  return `${base}-${crypto.randomBytes(3).toString("hex")}`;
}

export async function POST(request) {
  const user = await usuarioActual();
  if (!user) return NextResponse.json({ error: "Tu sesión expiró. Vuelve a entrar con tu correo." }, { status: 401 });

  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ error: "Datos inválidos." }, { status: 400 }); }

  const ocasion = ["cumpleanos", "matrimonio", "baby-shower"].includes(b.ocasion) ? b.ocasion : null;
  const nombre = txt(b.nombre, 80);
  if (!ocasion || !nombre) return NextResponse.json({ error: "Falta la ocasión o el nombre." }, { status: 400 });
  const edad = ocasion === "cumpleanos" && b.edad ? Math.max(0, Math.min(130, parseInt(b.edad, 10) || 0)) : null;
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(b.fecha || "") ? b.fecha : null;
  if (!fecha) return NextResponse.json({ error: "Indica la fecha de la celebración." }, { status: 400 });

  const regalos = (Array.isArray(b.regalos) ? b.regalos : []).slice(0, 30).map((r, i) => ({
    nombre: txt(r.nombre, 80),
    descripcion: txt(r.descripcion, 160) || null,
    link: /^https?:\/\//i.test(r.link || "") ? txt(r.link, 500) : null,
    foto: typeof r.foto === "string" && r.foto.startsWith("data:image/jpeg;base64,") && r.foto.length < 400000 ? r.foto : null,
    meta: Math.round(Number(r.meta)),
    orden: i,
  })).filter((r) => r.nombre && r.meta >= 1000 && r.meta <= 100000000);

  const deseos = (Array.isArray(b.deseos) ? b.deseos : []).slice(0, 40).map((d, i) => ({
    titulo: txt(d.titulo, 140), descripcion: txt(d.descripcion, 300) || null, orden: i,
  })).filter((d) => d.titulo.length > 3);

  if (!regalos.length && !deseos.length) return NextResponse.json({ error: "Agrega al menos un regalo o un buen deseo." }, { status: 400 });

  const bk = b.banco || {};
  const banco = { titular: txt(bk.titular, 80), rut: txt(bk.rut, 12), banco: txt(bk.banco, 60), tipo: txt(bk.tipo, 40), numero: txt(bk.numero, 24).replace(/[\s-]/g, ""), email: txt(bk.email, 100) };
  if (!banco.titular || !rutValido(banco.rut) || !banco.banco || !banco.tipo || !/^\d{4,24}$/.test(banco.numero) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(banco.email)) {
    return NextResponse.json({ error: "Revisa los datos de la cuenta bancaria." }, { status: 400 });
  }

  const lg = leerLugar(b);
  if (lg.error) return NextResponse.json({ error: lg.error }, { status: 400 });
  const rd = leerRedes(b.redes);
  if (rd.error) return NextResponse.json({ error: rd.error }, { status: 400 });

  const db = adminDb();
  const slug = crearSlug(nombre);
  const { data: cel, error } = await db.from("celebraciones").insert({
    slug, owner_id: user.id, owner_email: user.email, nombre, ocasion, edad, fecha,
    mensaje: txt(b.mensaje, 400) || null,
    ...lg.campos,
    redes: rd.redes,
    banco_cifrado: cifrar(banco),
    banco_resumen: `${banco.banco} · ${banco.tipo} · ****${banco.numero.slice(-4)}`,
  }).select("id, slug, nombre, ocasion").single();
  if (error) { console.error(error); return NextResponse.json({ error: "No pudimos guardar la celebración. Inténtalo de nuevo." }, { status: 500 }); }

  const [r1, r2] = await Promise.all([
    regalos.length ? db.from("regalos").insert(regalos.map((r) => ({ ...r, celebracion_id: cel.id }))) : { error: null },
    deseos.length ? db.from("deseos").insert(deseos.map((d) => ({ ...d, celebracion_id: cel.id }))) : { error: null },
  ]);
  if (r1.error || r2.error) {
    console.error(r1.error || r2.error);
    await db.from("celebraciones").delete().eq("id", cel.id);
    return NextResponse.json({ error: "No pudimos guardar los regalos. Inténtalo de nuevo." }, { status: 500 });
  }
  return NextResponse.json({ slug: cel.slug, titulo: tituloCelebracion(cel) });
}

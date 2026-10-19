import { NextResponse } from "next/server";
import { adminDb, usuarioActual, esAdmin } from "@/lib/supabase";
import { cifrar } from "@/lib/cripto";
import { rutValido } from "@/lib/rut";
import { TEMAS, posValida } from "@/lib/temas";
import { pesos } from "@/lib/datos";
import { leerLugar } from "@/lib/lugar";
import { leerRedes } from "@/lib/redes";

const txt = (v, max) => String(v ?? "").trim().slice(0, max);
const err = (error, status = 400) => NextResponse.json({ error }, { status });
const fotoValida = (f, max) => typeof f === "string" && f.startsWith("data:image/jpeg;base64,") && f.length < max;

// Guarda todos los cambios de una celebración (solo su dueño).
export async function PUT(request, { params }) {
  const { id } = await params;
  const user = await usuarioActual();
  if (!user) return err("Tu sesión expiró. Vuelve a entrar con tu correo.", 401);

  let b;
  try { b = await request.json(); } catch { return err("Datos inválidos."); }

  const db = adminDb();
  const { data: cel } = await db.from("celebraciones").select("id, owner_id, ocasion, estado").eq("id", id).maybeSingle();
  if (!cel || (cel.owner_id !== user.id && !esAdmin(user))) return err("No encontramos tu celebración.", 404);

  // ---- Datos generales ----
  const nombre = txt(b.nombre, 80);
  if (!nombre) return err("Escribe un nombre.");
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(b.fecha || "") ? b.fecha : null;
  if (!fecha) return err("Indica la fecha de la celebración.");
  const cambios = {
    nombre, fecha,
    edad: cel.ocasion === "cumpleanos" && b.edad ? Math.max(0, Math.min(130, parseInt(b.edad, 10) || 0)) : null,
    mensaje: txt(b.mensaje, 400) || null,
    tema: TEMAS[b.tema] ? b.tema : "azul",
    portada_pos: posValida(b.portada_pos),
  };
  const lg = leerLugar(b);
  if (lg.error) return err(lg.error);
  Object.assign(cambios, lg.campos);
  const rd = leerRedes(b.redes);
  if (rd.error) return err(rd.error);
  cambios.redes = rd.redes;
  if (b.portada !== undefined) {
    if (b.portada === "" || b.portada === null) cambios.portada = null;
    else if (fotoValida(b.portada, 1200000)) cambios.portada = b.portada;
    else return err("La foto de portada es muy pesada. Prueba con otra.");
  }

  // Pausar o reabrir: no se puede reabrir después del pago final.
  if (b.estado === "activa" || b.estado === "cerrada") {
    if (b.estado === "activa" && cel.estado !== "activa") {
      const { data: fin } = await db.from("transferencias").select("id").eq("celebracion_id", id).eq("final", true).limit(1);
      if (fin?.length) return err("Esta celebración ya recibió su pago final y no se puede reabrir.");
    }
    cambios.estado = b.estado;
  }

  // Cambio de cuenta bancaria (opcional).
  if (b.banco) {
    const bk = b.banco;
    const banco = { titular: txt(bk.titular, 80), rut: txt(bk.rut, 12), banco: txt(bk.banco, 60), tipo: txt(bk.tipo, 40), numero: txt(bk.numero, 24).replace(/[\s-]/g, ""), email: txt(bk.email, 100) };
    if (!banco.titular || !rutValido(banco.rut) || !banco.banco || !banco.tipo || !/^\d{4,24}$/.test(banco.numero) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(banco.email)) {
      return err("Revisa los datos de la nueva cuenta bancaria.");
    }
    cambios.banco_cifrado = cifrar(banco);
    cambios.banco_resumen = `${banco.banco} · ${banco.tipo} · ****${banco.numero.slice(-4)}`;
  }

  // ---- Regalos y deseos ----
  const entrantesR = (Array.isArray(b.regalos) ? b.regalos : []);
  const entrantesD = (Array.isArray(b.deseos) ? b.deseos : []);
  if (entrantesR.length > 30) return err("Puedes tener hasta 30 regalos.");
  if (entrantesD.length > 40) return err("Puedes tener hasta 40 buenos deseos.");

  const [{ data: regAct }, { data: desAct }, { data: aps }] = await Promise.all([
    db.from("regalos").select("id").eq("celebracion_id", id),
    db.from("deseos").select("id").eq("celebracion_id", id),
    db.from("aportes").select("regalo_id, monto").eq("celebracion_id", id).eq("estado", "aprobado"),
  ]);
  const idsR = new Set((regAct || []).map((r) => r.id));
  const idsD = new Set((desAct || []).map((d) => d.id));
  const reunido = (rid) => (aps || []).filter((a) => a.regalo_id === rid).reduce((s, a) => s + a.monto, 0);

  const regalos = [];
  for (const [i, r] of entrantesR.entries()) {
    const fila = {
      nombre: txt(r.nombre, 80),
      descripcion: txt(r.descripcion, 160) || null,
      link: /^https?:\/\//i.test(r.link || "") ? txt(r.link, 500) : null,
      meta: Math.round(Number(r.meta)),
      orden: i,
    };
    if (!fila.nombre) return err(`Al regalo n° ${i + 1} le falta el nombre.`);
    if (!(fila.meta >= 1000 && fila.meta <= 100000000)) return err(`La meta de "${fila.nombre}" debe estar entre $1.000 y $100.000.000.`);
    if (r.link && !fila.link) return err(`El link de "${fila.nombre}" debe empezar con https://`);
    const existe = r.id && idsR.has(r.id);
    if (existe && fila.meta < reunido(r.id)) return err(`La meta de "${fila.nombre}" no puede ser menor a lo que ya te regalaron (${pesos(reunido(r.id))}).`);
    if (r.foto !== undefined) {
      if (r.foto === "" || r.foto === null) fila.foto = null;
      else if (fotoValida(r.foto, 400000)) fila.foto = r.foto;
      else return err(`La foto de "${fila.nombre}" es muy pesada. Prueba con otra.`);
    }
    regalos.push({ id: existe ? r.id : null, fila });
  }

  const deseos = [];
  for (const [i, d] of entrantesD.entries()) {
    const fila = { titulo: txt(d.titulo, 140), descripcion: txt(d.descripcion, 300) || null, orden: i };
    if (fila.titulo.length < 4) return err(`El deseo n° ${i + 1} es muy corto.`);
    deseos.push({ id: d.id && idsD.has(d.id) ? d.id : null, fila });
  }
  if (!regalos.length && !deseos.length) return err("Deja al menos un regalo o un buen deseo.");

  // ---- Guardar ----
  const { error: e1 } = await db.from("celebraciones").update(cambios).eq("id", id);
  if (e1) { console.error(e1); return err("No pudimos guardar los cambios. Inténtalo de nuevo.", 500); }

  const quedanR = new Set(regalos.filter((r) => r.id).map((r) => r.id));
  const quedanD = new Set(deseos.filter((d) => d.id).map((d) => d.id));
  const borrarR = [...idsR].filter((x) => !quedanR.has(x));
  const borrarD = [...idsD].filter((x) => !quedanD.has(x));
  // Los aportes de un regalo o deseo quitado se mantienen (el dinero sigue siendo del festejado).
  if (borrarR.length) await db.from("regalos").delete().in("id", borrarR).eq("celebracion_id", id);
  if (borrarD.length) await db.from("deseos").delete().in("id", borrarD).eq("celebracion_id", id);

  const guardar = async (tabla, items) => Promise.all(items.map(async ({ id: itemId, fila }) => {
    if (itemId) {
      const { error } = await db.from(tabla).update(fila).eq("id", itemId).eq("celebracion_id", id);
      if (error) throw error;
      return itemId;
    }
    const { data, error } = await db.from(tabla).insert({ ...fila, celebracion_id: id }).select("id").single();
    if (error) throw error;
    return data.id;
  }));

  try {
    const [idsRegalos, idsDeseos] = await Promise.all([guardar("regalos", regalos), guardar("deseos", deseos)]);
    return NextResponse.json({ ok: true, regalos: idsRegalos, deseos: idsDeseos, banco_resumen: cambios.banco_resumen || null });
  } catch (e) {
    console.error(e);
    return err("Se guardó una parte de los cambios, pero hubo un problema. Recarga la página y revisa.", 500);
  }
}

import { adminDb } from "./supabase";
import { obtenerPago } from "./mercadopago";

export const OCASIONES = { cumpleanos: "Cumpleaños", matrimonio: "Matrimonio", "baby-shower": "Baby shower" };

export function pesos(n) {
  return "$" + Math.round(n || 0).toLocaleString("es-CL");
}

export function tituloCelebracion(c) {
  const o = c.ocasion === "cumpleanos" ? "El cumpleaños de" : c.ocasion === "matrimonio" ? "El matrimonio de" : "El baby shower de";
  return `${o} ${c.nombre}`;
}

// Celebración con regalos, deseos y aportes aprobados (sin datos bancarios).
export async function celebracionPublica(slug) {
  const db = adminDb();
  const { data: c } = await db
    .from("celebraciones")
    .select("id, slug, nombre, ocasion, edad, fecha, mensaje, estado, owner_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!c) return null;
  const [{ data: regalos }, { data: deseos }, { data: aportes }] = await Promise.all([
    db.from("regalos").select("id, nombre, descripcion, link, foto, meta, orden").eq("celebracion_id", c.id).order("orden"),
    db.from("deseos").select("id, titulo, descripcion, orden").eq("celebracion_id", c.id).order("orden"),
    db.from("aportes").select("id, regalo_id, deseo_id, nombre, mensaje, monto, aprobado_at")
      .eq("celebracion_id", c.id).eq("estado", "aprobado").order("aprobado_at", { ascending: false }),
  ]);
  const ap = aportes || [];
  return {
    ...c,
    regalos: (regalos || []).map((r) => ({ ...r, recaudado: ap.filter((a) => a.regalo_id === r.id).reduce((s, a) => s + a.monto, 0) })),
    deseos: (deseos || []).map((d) => ({ ...d, veces: ap.filter((a) => a.deseo_id === d.id).length })),
    aportes: ap,
    total: ap.reduce((s, a) => s + a.monto, 0),
    personas: new Set(ap.map((a) => a.nombre.trim().toLowerCase())).size,
  };
}

// Actualiza un aporte según el estado real del pago en Mercado Pago.
export async function conciliarPago(paymentId) {
  const pago = await obtenerPago(paymentId);
  if (!pago || !pago.external_reference) return null;
  const db = adminDb();
  const { data: aporte } = await db.from("aportes").select("id, monto, estado").eq("id", pago.external_reference).maybeSingle();
  if (!aporte) return null;
  if (aporte.estado === "aprobado") return "aprobado";

  let estado = "pendiente";
  if (pago.status === "approved") {
    // El monto pagado debe coincidir con el aporte registrado.
    estado = Math.round(pago.transaction_amount) === aporte.monto && pago.currency_id === "CLP" ? "aprobado" : "rechazado";
  } else if (["rejected", "cancelled", "refunded", "charged_back"].includes(pago.status)) {
    estado = "rechazado";
  }
  await db.from("aportes").update({
    estado,
    mp_payment_id: String(pago.id),
    aprobado_at: estado === "aprobado" ? new Date().toISOString() : null,
  }).eq("id", aporte.id);
  return estado;
}

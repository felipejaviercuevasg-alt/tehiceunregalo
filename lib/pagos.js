// Reglas de transferencia al festejado:
//  - Se transfiere lo reunido cada 7 días.
//  - El saldo final, a más tardar 24 horas después del día de la celebración.

const DIA = 24 * 60 * 60 * 1000;

// Fin del día de la celebración (hora de Chile continental, aprox. UTC-3) + 24 horas.
export function limiteFinal(fecha) {
  if (!fecha) return null;
  return new Date(new Date(`${fecha}T23:59:59-03:00`).getTime() + DIA);
}

export function estadoPagos({ celebracion, aportes = [], transferencias = [], comisionPct = 0, ahora = new Date() }) {
  const total = aportes.reduce((s, a) => s + a.monto, 0);
  const transferido = transferencias.reduce((s, t) => s + t.monto, 0);
  const comisionCobrada = transferencias.reduce((s, t) => s + (t.comision || 0), 0);
  const pendienteBruto = Math.max(0, total - transferido - comisionCobrada);
  const comisionPendiente = Math.round((pendienteBruto * comisionPct) / 100);
  const pendiente = pendienteBruto - comisionPendiente;

  const ultima = transferencias.length ? new Date(Math.max(...transferencias.map((t) => new Date(t.created_at).getTime()))) : null;
  // Aportes que aún no se han transferido: el más antiguo marca desde cuándo corre el plazo de 7 días.
  const sinPagar = aportes.filter((a) => !ultima || new Date(a.aprobado_at) > ultima).map((a) => new Date(a.aprobado_at).getTime());
  const desde = sinPagar.length ? new Date(Math.min(...sinPagar)) : null;
  const semanal = desde ? new Date(desde.getTime() + 7 * DIA) : null;
  const limite = limiteFinal(celebracion.fecha);
  const celebracionPasada = limite ? ahora >= new Date(limite.getTime() - DIA) : false;

  let vence = semanal;
  if (limite && (!vence || limite < vence)) vence = limite;

  let estado = "al-dia";
  if (pendiente > 0) {
    if (limite && ahora >= limite) estado = "atrasada";
    else if (celebracionPasada) estado = "final";
    else if (vence && ahora >= vence) estado = "toca";
    else estado = "programada";
  }

  return { total, transferido, pendiente, comisionPendiente, pendienteBruto, ultima, vence, limite, celebracionPasada, estado };
}

export const ETIQUETA_ESTADO = {
  "atrasada": ["Atrasada", "urgente"],
  "final": ["Pago final (24 h)", "urgente"],
  "toca": ["Toca transferir", "pend"],
  "programada": ["Programada", ""],
  "al-dia": ["Al día", "ok"],
};

export function fechaCorta(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-CL", { day: "numeric", month: "short", timeZone: "America/Santiago" });
}

// Comisión (%) desde COMISION_PCT. Acepta "8", "8%", "8,5" o con espacios; si no se entiende, 0.
export function comisionPct() {
  const v = parseFloat(String(process.env.COMISION_PCT || "").replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(v) && v >= 0 && v < 50 ? v : 0;
}

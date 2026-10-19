import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminDb, usuarioActual, esAdmin } from "@/lib/supabase";
import { descifrar } from "@/lib/cripto";
import { pesos, tituloCelebracion } from "@/lib/datos";
import { estadoPagos, ETIQUETA_ESTADO, fechaCorta, comisionPct } from "@/lib/pagos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administración · Te hice un regalo", robots: { index: false } };


async function exigirAdmin() {
  const user = await usuarioActual();
  if (!user) redirect("/entrar?next=/admin");
  if (!esAdmin(user)) notFound();
  return user;
}

async function cargar(db, ids) {
  let qc = db.from("celebraciones").select("id, slug, nombre, ocasion, fecha, estado, owner_email, banco_cifrado, banco_resumen, created_at");
  if (ids) qc = qc.in("id", ids);
  let qa = db.from("aportes").select("celebracion_id, monto, aprobado_at").eq("estado", "aprobado");
  if (ids) qa = qa.in("celebracion_id", ids);
  let qt = db.from("transferencias").select("celebracion_id, monto, comision, final, created_at").order("created_at");
  if (ids) qt = qt.in("celebracion_id", ids);
  const [{ data: cels }, { data: aportes }, { data: transf, error: errT }] = await Promise.all([qc, qa, qt]);
  return { cels: cels || [], aportes: aportes || [], transf: transf || [], errT };
}

// Registra una transferencia por todo lo pendiente (recalculado en el servidor).
async function registrarTransferencia(formData) {
  "use server";
  await exigirAdmin();
  const id = String(formData.get("id"));
  const db = adminDb();
  const { cels, aportes, transf } = await cargar(db, [id]);
  const c = cels[0];
  if (!c) return;
  const e = estadoPagos({ celebracion: c, aportes, transferencias: transf, comisionPct: comisionPct() });
  if (e.pendiente <= 0) return;
  await db.from("transferencias").insert({ celebracion_id: id, monto: e.pendiente, comision: e.comisionPendiente, final: e.celebracionPasada });
  // Después del pago final, la celebración deja de recibir aportes.
  if (e.celebracionPasada) await db.from("celebraciones").update({ estado: "cerrada" }).eq("id", id);
  revalidatePath("/admin");
}

async function cambiarEstado(formData) {
  "use server";
  await exigirAdmin();
  const id = String(formData.get("id"));
  const estado = formData.get("estado") === "cerrada" ? "cerrada" : "activa";
  await adminDb().from("celebraciones").update({ estado }).eq("id", id);
  revalidatePath("/admin");
}

export default async function Admin({ searchParams }) {
  await exigirAdmin();
  const sp = await searchParams;
  const filtro = sp.f || "por-pagar";
  const db = adminDb();
  const { cels, aportes, transf, errT } = await cargar(db);
  const pct = comisionPct();

  const todas = cels.map((c) => {
    const e = estadoPagos({
      celebracion: c,
      aportes: aportes.filter((a) => a.celebracion_id === c.id),
      transferencias: transf.filter((t) => t.celebracion_id === c.id),
      comisionPct: pct,
    });
    return { ...c, e, historial: transf.filter((t) => t.celebracion_id === c.id) };
  });
  const orden = { atrasada: 0, final: 1, toca: 2, programada: 3, "al-dia": 4 };
  const filas = todas
    .filter((c) => filtro === "todas" ? true : filtro === "proximas" ? c.e.estado === "programada" : ["atrasada", "final", "toca"].includes(c.e.estado))
    .sort((a, b) => orden[a.e.estado] - orden[b.e.estado] || (a.e.vence?.getTime() || 9e15) - (b.e.vence?.getTime() || 9e15));

  const porPagar = todas.filter((c) => ["atrasada", "final", "toca"].includes(c.e.estado));
  const totalPorPagar = porPagar.reduce((s, c) => s + c.e.pendiente, 0);
  const totalGeneral = aportes.reduce((s, a) => s + a.monto, 0);

  return (
    <main className="pagina">
      <div className="contenedor">
        <span className="etiqueta">Administración</span>
        <h1 style={{ fontSize: "clamp(1.9rem,4vw,2.6rem)", margin: "8px 0 8px" }}>Transferencias</h1>
        <p className="gris" style={{ marginBottom: 20 }}>
          Recaudado en total: <strong>{pesos(totalGeneral)}</strong> · Por transferir hoy: <strong>{pesos(totalPorPagar)}</strong> en {porPagar.length} {porPagar.length === 1 ? "celebración" : "celebraciones"} · Comisión: {pct}%
        </p>
        {errT && <p className="error" style={{ marginBottom: 16 }}>Falta crear la tabla de transferencias en Supabase (archivo supabase/002_transferencias.sql).</p>}
        <div className="rapidos" style={{ marginBottom: 20 }}>
          {[["por-pagar", `Por transferir (${porPagar.length})`], ["proximas", "Próximas"], ["todas", "Todas"]].map(([v, t]) => (
            <a key={v} className="rapido" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} aria-pressed={filtro === v} href={`/admin?f=${v}`}>{t}</a>
          ))}
        </div>
        <p className="aviso" style={{ marginBottom: 18 }}>
          Regla: se transfiere lo reunido <strong>cada 7 días</strong> y el saldo final <strong>a más tardar 24 horas después</strong> del día de la celebración. Transfiere desde tu banco o Mercado Pago y luego presiona <strong>Registrar transferencia</strong>.
        </p>
        <div className="caja-scroll">
          <table className="tabla">
            <thead><tr><th>Estado</th><th>Celebración</th><th>Reunido</th><th>Ya transferido</th><th>A transferir</th><th>Cuenta</th><th></th></tr></thead>
            <tbody>
              {!filas.length && <tr><td colSpan={7} className="gris">No hay celebraciones en esta lista.</td></tr>}
              {filas.map((c) => {
                const b = descifrar(c.banco_cifrado);
                const [txt, clase] = ETIQUETA_ESTADO[c.e.estado];
                return (
                  <tr key={c.id}>
                    <td>
                      <span className={"chip-estado " + clase}>{txt}</span>
                      {c.e.pendiente > 0 && <><br /><span className="gris" style={{ fontSize: ".82rem" }}>Vence {fechaCorta(c.e.vence)}</span></>}
                    </td>
                    <td><a href={`/c/${c.slug}`} target="_blank">{tituloCelebracion(c)}</a><br /><span className="gris">{c.fecha ? `Fecha: ${fechaCorta(c.fecha + "T12:00:00")}` : ""} · {c.owner_email}</span></td>
                    <td>{pesos(c.e.total)}</td>
                    <td>{pesos(c.e.transferido)}{c.historial.length > 0 && <><br /><span className="gris" style={{ fontSize: ".82rem" }}>{c.historial.length} pago{c.historial.length > 1 ? "s" : ""} · último {fechaCorta(c.e.ultima)}</span></>}</td>
                    <td><strong>{pesos(c.e.pendiente)}</strong>{c.e.comisionPendiente > 0 && <><br /><span className="gris" style={{ fontSize: ".82rem" }}>comisión {pesos(c.e.comisionPendiente)}</span></>}</td>
                    <td>
                      <details style={{ padding: 0, border: 0 }}>
                        <summary style={{ fontSize: ".9rem" }}>{c.banco_resumen}</summary>
                        {b ? (
                          <p style={{ fontSize: ".9rem", marginTop: 8, color: "var(--azul)" }}>
                            {b.titular}<br />RUT {b.rut}<br />{b.banco} · {b.tipo}<br />N° {b.numero}<br />{b.email}
                          </p>
                        ) : <p className="error">No se pudo descifrar (¿cambió ENCRYPTION_KEY?)</p>}
                      </details>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                        {c.e.pendiente > 0 && (
                          <form action={registrarTransferencia}>
                            <input type="hidden" name="id" value={c.id} />
                            <button className="btn btn-primario btn-chico">Registrar transferencia de {pesos(c.e.pendiente)}</button>
                          </form>
                        )}
                        <form action={cambiarEstado}>
                          <input type="hidden" name="id" value={c.id} /><input type="hidden" name="estado" value={c.estado === "activa" ? "cerrada" : "activa"} />
                          <button className="btn-texto">{c.estado === "activa" ? "Cerrar celebración" : "Reabrir celebración"}</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

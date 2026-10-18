import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminDb, usuarioActual, esAdmin } from "@/lib/supabase";
import { descifrar } from "@/lib/cripto";
import { pesos, tituloCelebracion } from "@/lib/datos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administración · Te hice un regalo", robots: { index: false } };

async function exigirAdmin() {
  const user = await usuarioActual();
  if (!user) redirect("/entrar?next=/admin");
  if (!esAdmin(user)) notFound();
  return user;
}

async function marcarTransferido(formData) {
  "use server";
  await exigirAdmin();
  const id = String(formData.get("id"));
  const monto = Math.round(Number(formData.get("monto")));
  await adminDb().from("celebraciones").update({ transferido_at: new Date().toISOString(), transferido_monto: monto, estado: "cerrada" }).eq("id", id);
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
  const { data: cels } = await db.from("celebraciones")
    .select("id, slug, nombre, ocasion, fecha, estado, owner_email, banco_cifrado, banco_resumen, transferido_at, transferido_monto, created_at")
    .order("fecha", { ascending: true });
  const { data: aportes } = await db.from("aportes").select("celebracion_id, monto").eq("estado", "aprobado");
  const comisionPct = Number(process.env.COMISION_PCT || 0);
  const hoy = new Date().toISOString().slice(0, 10);

  const filas = (cels || []).map((c) => {
    const total = (aportes || []).filter((a) => a.celebracion_id === c.id).reduce((s, a) => s + a.monto, 0);
    const comision = Math.round((total * comisionPct) / 100);
    return { ...c, total, comision, aTransferir: total - comision, paso: c.fecha && c.fecha < hoy };
  }).filter((c) =>
    filtro === "todas" ? true :
    filtro === "transferidas" ? !!c.transferido_at :
    !c.transferido_at && c.paso && c.total > 0);

  const totalGeneral = (aportes || []).reduce((s, a) => s + a.monto, 0);

  return (
    <main className="pagina">
      <div className="contenedor">
        <span className="etiqueta">Administración</span>
        <h1 style={{ fontSize: "clamp(1.9rem,4vw,2.6rem)", margin: "8px 0 8px" }}>Celebraciones</h1>
        <p className="gris" style={{ marginBottom: 20 }}>Recaudado en total: <strong>{pesos(totalGeneral)}</strong> · Comisión configurada: {comisionPct}%</p>
        <div className="rapidos" style={{ marginBottom: 20 }}>
          {[["por-pagar", "Por transferir"], ["transferidas", "Transferidas"], ["todas", "Todas"]].map(([v, t]) => (
            <a key={v} className="rapido" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} aria-pressed={filtro === v} href={`/admin?f=${v}`}>{t}</a>
          ))}
        </div>
        {filtro === "por-pagar" && <p className="aviso" style={{ marginBottom: 18 }}>Celebraciones cuya fecha ya pasó, con dinero reunido y sin transferir. Antes de transferir, verifica en tu cuenta de Mercado Pago que el dinero ya esté disponible.</p>}
        <div className="caja-scroll">
          <table className="tabla">
            <thead><tr><th>Fecha</th><th>Celebración</th><th>Reunido</th><th>A transferir</th><th>Cuenta</th><th>Estado</th></tr></thead>
            <tbody>
              {!filas.length && <tr><td colSpan={6} className="gris">No hay celebraciones en esta lista.</td></tr>}
              {filas.map((c) => {
                const b = descifrar(c.banco_cifrado);
                return (
                  <tr key={c.id}>
                    <td>{c.fecha}</td>
                    <td><a href={`/c/${c.slug}`} target="_blank">{tituloCelebracion(c)}</a><br /><span className="gris">{c.owner_email}</span></td>
                    <td>{pesos(c.total)}</td>
                    <td><strong>{pesos(c.aTransferir)}</strong>{c.comision > 0 && <><br /><span className="gris">comisión {pesos(c.comision)}</span></>}</td>
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
                      {c.transferido_at ? (
                        <span className="chip-estado ok">Transferido {pesos(c.transferido_monto)}<br />{new Date(c.transferido_at).toLocaleDateString("es-CL")}</span>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                          <span className={"chip-estado " + (c.estado === "activa" ? "pend" : "")}>{c.estado === "activa" ? "Activa" : "Cerrada"}</span>
                          {c.total > 0 && (
                            <form action={marcarTransferido}>
                              <input type="hidden" name="id" value={c.id} /><input type="hidden" name="monto" value={c.aTransferir} />
                              <button className="btn btn-primario btn-chico">Marcar transferido</button>
                            </form>
                          )}
                          <form action={cambiarEstado}>
                            <input type="hidden" name="id" value={c.id} /><input type="hidden" name="estado" value={c.estado === "activa" ? "cerrada" : "activa"} />
                            <button className="btn-texto">{c.estado === "activa" ? "Cerrar" : "Reabrir"}</button>
                          </form>
                        </div>
                      )}
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

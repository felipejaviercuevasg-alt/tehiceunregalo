import Link from "next/link";
import { redirect } from "next/navigation";
import { adminDb, usuarioActual, esAdmin } from "@/lib/supabase";
import { pesos, tituloCelebracion } from "@/lib/datos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mis celebraciones · Te hice un regalo" };

export default async function MisCelebraciones() {
  const user = await usuarioActual();
  if (!user) redirect("/entrar?next=/mis-celebraciones");
  const db = adminDb();
  const { data: cels } = await db.from("celebraciones")
    .select("id, slug, nombre, ocasion, fecha, estado, banco_resumen, transferido_at, transferido_monto, created_at")
    .eq("owner_id", user.id).order("created_at", { ascending: false });
  const ids = (cels || []).map((c) => c.id);
  const { data: aportes } = ids.length
    ? await db.from("aportes").select("celebracion_id, nombre, mensaje, monto, aprobado_at, regalo_id, deseo_id").in("celebracion_id", ids).eq("estado", "aprobado").order("aprobado_at", { ascending: false })
    : { data: [] };

  return (
    <main className="pagina">
      <div className="contenedor">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
          <div>
            <span className="etiqueta">{user.email}</span>
            <h1 style={{ fontSize: "clamp(1.9rem,4vw,2.6rem)", marginTop: 8 }}>Mis celebraciones</h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {esAdmin(user) && <Link className="btn btn-secundario btn-chico" href="/admin">Panel de administración</Link>}
            <form action="/auth/salir" method="post"><button className="btn-texto">Cerrar sesión</button></form>
          </div>
        </div>

        {!cels?.length && (
          <div className="tarjeta" style={{ textAlign: "center", padding: 44 }}>
            <h2 style={{ fontSize: "1.5rem" }}>Aún no tienes celebraciones</h2>
            <p className="gris" style={{ margin: "10px 0 22px" }}>Crea la primera y compártela con tus invitados.</p>
            <Link className="btn btn-primario" href="/crear">Crear mi celebración</Link>
          </div>
        )}

        {(cels || []).map((c) => {
          const ap = (aportes || []).filter((a) => a.celebracion_id === c.id);
          const total = ap.reduce((s, a) => s + a.monto, 0);
          return (
            <div className="tarjeta" key={c.id} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: "1.4rem" }}>{tituloCelebracion(c)}</h2>
                  <p className="gris" style={{ fontSize: ".92rem", marginTop: 4 }}>
                    {c.fecha ? new Date(c.fecha + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) : ""} · Se transfiere a: {c.banco_resumen}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{pesos(total)}</div>
                  <div className="gris" style={{ fontSize: ".88rem" }}>{ap.length} {ap.length === 1 ? "regalo recibido" : "regalos recibidos"}</div>
                </div>
              </div>
              {c.transferido_at && <p className="aviso" style={{ marginTop: 14 }}>Transferimos {pesos(c.transferido_monto)} a tu cuenta el {new Date(c.transferido_at).toLocaleDateString("es-CL")}.</p>}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "18px 0" }}>
                <Link className="btn btn-oscuro btn-chico" href={`/c/${c.slug}`}>Ver mi celebración</Link>
                <a className="btn btn-secundario btn-chico" target="_blank" rel="noopener" href={"https://wa.me/?text=" + encodeURIComponent(`${tituloCelebracion(c)} 🎁 Regálale algo que de verdad quiere: ${process.env.NEXT_PUBLIC_SITE_URL}/c/${c.slug}`)}>Compartir por WhatsApp</a>
              </div>
              {ap.length > 0 && (
                <details>
                  <summary>Ver quién me regaló</summary>
                  <div className="caja-scroll" style={{ marginTop: 12 }}>
                    <table className="tabla">
                      <thead><tr><th>Fecha</th><th>De</th><th>Monto</th><th>Mensaje</th></tr></thead>
                      <tbody>
                        {ap.map((a, i) => (
                          <tr key={i}><td>{new Date(a.aprobado_at).toLocaleDateString("es-CL")}</td><td>{a.nombre}</td><td>{pesos(a.monto)}</td><td>{a.mensaje || "—"}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

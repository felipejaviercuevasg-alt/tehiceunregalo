import { redirect, notFound } from "next/navigation";
import { adminDb, usuarioActual, esAdmin } from "@/lib/supabase";
import { tituloCelebracion } from "@/lib/datos";
import Editor from "./Editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Personalizar mi celebración · Te hice un regalo", robots: { index: false } };

export default async function Editar({ params }) {
  const { slug } = await params;
  const user = await usuarioActual();
  if (!user) redirect(`/entrar?next=/editar/${slug}`);
  const db = adminDb();
  const { data: c } = await db.from("celebraciones")
    .select("id, slug, owner_id, nombre, ocasion, edad, fecha, mensaje, estado, banco_resumen, portada, tema, portada_pos")
    .eq("slug", slug).maybeSingle();
  if (!c || (c.owner_id !== user.id && !esAdmin(user))) notFound();

  const [{ data: regalos }, { data: deseos }, { data: aportes }, { data: fin }] = await Promise.all([
    db.from("regalos").select("id, nombre, descripcion, link, foto, meta").eq("celebracion_id", c.id).order("orden"),
    db.from("deseos").select("id, titulo, descripcion").eq("celebracion_id", c.id).order("orden"),
    db.from("aportes").select("regalo_id, deseo_id, monto").eq("celebracion_id", c.id).eq("estado", "aprobado"),
    db.from("transferencias").select("id").eq("celebracion_id", c.id).eq("final", true).limit(1),
  ]);
  const ap = aportes || [];
  const inicial = {
    id: c.id, slug: c.slug, nombre: c.nombre, ocasion: c.ocasion, edad: c.edad ?? "", fecha: c.fecha || "",
    mensaje: c.mensaje || "", estado: c.estado, banco_resumen: c.banco_resumen,
    portada: c.portada || "", tema: c.tema || "azul", portada_pos: c.portada_pos || "50% 50%", pagoFinal: !!fin?.length,
    regalos: (regalos || []).map((r) => ({
      ...r, descripcion: r.descripcion || "", link: r.link || "", foto: r.foto || "",
      reunido: ap.filter((a) => a.regalo_id === r.id).reduce((s, a) => s + a.monto, 0),
    })),
    deseos: (deseos || []).map((d) => ({ ...d, descripcion: d.descripcion || "", veces: ap.filter((a) => a.deseo_id === d.id).length })),
  };

  return (
    <main className="pagina" style={{ paddingBottom: 0 }}>
      <div className="contenedor angosto">
        <a href="/mis-celebraciones" className="gris" style={{ fontSize: ".92rem" }}>← Mis celebraciones</a>
        <span className="etiqueta" style={{ display: "block", marginTop: 16 }}>Personalizar</span>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", margin: "8px 0 28px" }}>{tituloCelebracion(c)}</h1>
        <Editor inicial={inicial} />
      </div>
    </main>
  );
}

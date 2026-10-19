import { notFound } from "next/navigation";
import { celebracionPublica, tituloCelebracion } from "@/lib/datos";
import { usuarioActual } from "@/lib/supabase";
import VistaInvitado from "./VistaInvitado";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = await celebracionPublica(slug);
  if (!c) return { title: "Celebración no encontrada · Te hice un regalo" };
  const t = tituloCelebracion(c);
  return { title: `${t} · Te hice un regalo`, description: `Regálale a ${c.nombre} algo que de verdad quiere.`, openGraph: { title: t, description: `Regálale a ${c.nombre} algo que de verdad quiere.`, images: ["/og-image.png"] } };
}

export default async function Celebracion({ params }) {
  const { slug } = await params;
  const c = await celebracionPublica(slug);
  if (!c) notFound();
  // Solo lo necesario para el navegador: sin dueño ni montos individuales.
  const publico = {
    slug: c.slug, nombre: c.nombre, ocasion: c.ocasion, fecha: c.fecha, mensaje: c.mensaje, estado: c.estado, portada: c.portada, tema: c.tema, portada_pos: c.portada_pos, hora: c.hora, lugar: c.lugar, direccion: c.direccion, mapa_link: c.mapa_link,
    total: c.total, personas: c.personas, regalos: c.regalos, deseos: c.deseos,
    aportes: c.aportes.map((a) => ({ nombre: a.nombre, mensaje: a.mensaje, regalo_id: a.regalo_id, deseo_id: a.deseo_id })),
  };
  const user = await usuarioActual();
  return <VistaInvitado cel={publico} titulo={tituloCelebracion(c)} esDueno={!!user && user.id === c.owner_id} />;
}

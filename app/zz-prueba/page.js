import VistaInvitado from "../c/[slug]/VistaInvitado";
export default async function P({ searchParams }) {
  const sp = await searchParams;
  const cel = { slug: "x", nombre: "Felipe", ocasion: "cumpleanos", fecha: "2026-11-13", hora: "21:30", lugar: "Bar La Providencia", direccion: "Av. Providencia 1234, Providencia", mapa_link: "", mensaje: "¡Los espero!", estado: "activa", tema: sp.t || "azul", portada: "", total: 11400, personas: 1, regalos: [], deseos: [{ id: "d", titulo: "Te regalo algo", descripcion: "", veces: 0 }], aportes: [] };
  return <VistaInvitado cel={cel} titulo="El cumpleaños de Felipe" />;
}

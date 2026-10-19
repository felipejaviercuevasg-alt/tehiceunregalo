import Editor from "../editar/[slug]/Editor";
import VistaInvitado from "../c/[slug]/VistaInvitado";
export default async function P({ searchParams }) {
  const sp = await searchParams;
  const ini = { id: "x", slug: "camila-abc", nombre: "Camila", ocasion: "cumpleanos", edad: 30, fecha: "2026-11-20", mensaje: "¡Gracias!", estado: "activa", banco_resumen: "BancoEstado · Cuenta vista / CuentaRUT · ****1234", portada: "", tema: sp.t || "azul", pagoFinal: false,
    regalos: [{ id: "r1", nombre: "Casco de moto", descripcion: "Talla M", link: "", foto: "", meta: 200000, reunido: 70000 }, { id: "r2", nombre: "Chaqueta", descripcion: "", link: "", foto: "", meta: 50000, reunido: 0 }],
    deseos: [{ id: "d1", titulo: "Te regalo un día sin obligaciones", descripcion: "Para descansar", veces: 2 }] };
  if (sp.v) return <VistaInvitado cel={{ ...ini, total: 70000, personas: 3, regalos: ini.regalos.map(r => ({ ...r, recaudado: r.reunido })), deseos: ini.deseos, aportes: [] }} titulo="El cumpleaños de Camila" esDueno />;
  return <main className="pagina" style={{ paddingBottom: 0 }}><div className="contenedor angosto"><Editor inicial={ini} /></div></main>;
}

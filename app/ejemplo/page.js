import VistaInvitado from "../c/[slug]/VistaInvitado";

export const metadata = { title: "Ejemplo de celebración · Te hice un regalo" };

const ejemplo = {
  slug: "ejemplo", nombre: "Camila", ocasion: "cumpleanos", fecha: "2026-12-12", estado: "activa",
  mensaje: "¡Gracias por acompañarme! Este año quiero cumplir dos sueños, y cualquier aporte, por chico que sea, me acerca un montón.",
  total: 105000, personas: 4,
  regalos: [
    { id: "r1", nombre: "Casco de moto", descripcion: "Casco integral talla M, color negro mate.", link: null, foto: null, meta: 200000, recaudado: 70000 },
    { id: "r2", nombre: "Chaqueta de cuero", descripcion: "La café que vimos en el mall, talla S.", link: null, foto: null, meta: 50000, recaudado: 25000 },
  ],
  deseos: [
    { id: "d1", titulo: "Te regalo kilómetros de libertad", descripcion: "Para llenar el estanque, tomar la carretera y cambiar de paisaje.", veces: 1 },
    { id: "d2", titulo: "Te regalo una cena que no tengas que cocinar", descripcion: "Hoy el único trabajo es elegir qué vas a pedir.", veces: 0 },
    { id: "d3", titulo: "Te regalo un pedacito del viaje que sueñas", descripcion: "Para que ese destino de tu lista esté un poco más cerca.", veces: 0 },
    { id: "d4", titulo: "Te regalo una tregua con las cuentas", descripcion: "Para que por una vez el dinero llegue antes que los gastos.", veces: 0 },
  ],
  aportes: [
    { nombre: "Pedro", mensaje: "¡Buen viaje!", deseo_id: "d1" },
    { nombre: "Martina", mensaje: "Te va a quedar increíble", regalo_id: "r2" },
    { nombre: "Tío Jorge", mensaje: "¡Para que andes segura!", regalo_id: "r1" },
  ],
};

export default function Ejemplo() {
  return <VistaInvitado cel={ejemplo} titulo="El cumpleaños de Camila" demo />;
}

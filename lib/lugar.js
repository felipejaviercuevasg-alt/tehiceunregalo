// Hora, lugar y enlaces de mapa/calendario de una celebración.

const txt = (v, max) => String(v ?? "").trim().slice(0, max);

// Valida lo que llega del formulario. Devuelve { campos } o { error }.
export function leerLugar(b) {
  const hora = txt(b.hora, 5);
  if (hora && !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) return { error: "Revisa la hora (ej: 20:30)." };
  const mapa = txt(b.mapa_link, 500);
  if (mapa && !/^https:\/\/\S+$/i.test(mapa)) return { error: "El enlace del mapa debe empezar con https://" };
  return { campos: { hora: hora || null, lugar: txt(b.lugar, 100) || null, direccion: txt(b.direccion, 200) || null, mapa_link: mapa || null } };
}

export function horaBonita(h) {
  return h ? `${h} hrs` : "";
}

export function enlacesLugar(c, titulo) {
  const donde = [c.lugar, c.direccion].filter(Boolean).join(", ");
  const q = encodeURIComponent(donde);
  const mapa = c.mapa_link || (donde ? `https://www.google.com/maps/search/?api=1&query=${q}` : null);
  const waze = donde ? `https://waze.com/ul?q=${q}&navigate=yes` : null;
  let calendario = null;
  if (c.fecha) {
    const d = c.fecha.replace(/-/g, "");
    let fechas;
    if (c.hora) {
      const [h, m] = c.hora.split(":").map(Number);
      const fin = Math.min(23, h + 3);
      const p = (n) => String(n).padStart(2, "0");
      fechas = `${d}T${p(h)}${p(m)}00/${d}T${p(fin)}${p(fin === 23 && h + 3 > 23 ? 59 : m)}00`;
    } else {
      const sig = new Date(c.fecha + "T12:00:00Z"); sig.setUTCDate(sig.getUTCDate() + 1);
      fechas = `${d}/${sig.toISOString().slice(0, 10).replace(/-/g, "")}`;
    }
    calendario = "https://calendar.google.com/calendar/render?action=TEMPLATE"
      + `&text=${encodeURIComponent(titulo)}&dates=${fechas}&ctz=America/Santiago`
      + (donde ? `&location=${q}` : "");
  }
  return { donde, mapa, waze, calendario };
}

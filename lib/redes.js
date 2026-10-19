// Redes sociales del festejado. Se acepta el usuario (@camila) o el enlace completo.
export const REDES = [
  { id: "instagram", nombre: "Instagram", dominios: ["instagram.com"], url: (u) => `https://www.instagram.com/${u}`, ej: "@camila" },
  { id: "tiktok", nombre: "TikTok", dominios: ["tiktok.com"], url: (u) => `https://www.tiktok.com/@${u}`, ej: "@camila" },
  { id: "facebook", nombre: "Facebook", dominios: ["facebook.com", "fb.com", "fb.me"], url: (u) => `https://www.facebook.com/${u}`, ej: "camila.perez" },
  { id: "x", nombre: "X (Twitter)", dominios: ["x.com", "twitter.com"], url: (u) => `https://x.com/${u}`, ej: "@camila" },
  { id: "youtube", nombre: "YouTube", dominios: ["youtube.com", "youtu.be"], url: (u) => `https://www.youtube.com/@${u}`, ej: "@camila" },
  { id: "linkedin", nombre: "LinkedIn", dominios: ["linkedin.com"], url: (u) => `https://www.linkedin.com/in/${u}`, ej: "camila-perez" },
];

// Convierte lo escrito en un enlace. Devuelve "" si está vacío, null si no es válido.
export function enlaceRed(red, valor) {
  const v = String(valor ?? "").trim();
  if (!v) return "";
  const r = REDES.find((x) => x.id === red);
  if (!r) return null;
  if (/^https?:\/\//i.test(v) || /^(www\.)?[a-z0-9-]+\.[a-z]{2,}\//i.test(v)) {
    try {
      const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
      const host = u.hostname.toLowerCase().replace(/^(www\.|m\.|mobile\.|web\.)/, "");
      if (!r.dominios.some((d) => host === d || host.endsWith("." + d))) return null;
      u.protocol = "https:";
      return u.toString().slice(0, 300);
    } catch { return null; }
  }
  const usuario = v.replace(/^@/, "");
  return /^[A-Za-z0-9._-]{1,60}$/.test(usuario) ? r.url(usuario) : null;
}

// Validación en el servidor. Devuelve { redes } o { error }.
export function leerRedes(entrada) {
  const redes = {};
  for (const r of REDES) {
    const e = enlaceRed(r.id, entrada?.[r.id]);
    if (e === null) return { error: `Revisa tu ${r.nombre}: escribe tu usuario (ej: ${r.ej}) o el enlace a tu perfil.` };
    if (e) redes[r.id] = e;
  }
  return { redes };
}

// Lo que se muestra en el campo al editar: el usuario si el enlace es el estándar.
export function valorEditable(red, url) {
  if (!url) return "";
  const r = REDES.find((x) => x.id === red);
  const base = r.url("§");
  const [pre, post] = base.split("§");
  if (url.startsWith(pre) && url.endsWith(post) && /^[A-Za-z0-9._-]+$/.test(url.slice(pre.length, url.length - post.length))) {
    const u = url.slice(pre.length, url.length - post.length);
    return red === "facebook" || red === "linkedin" ? u : "@" + u;
  }
  return url;
}

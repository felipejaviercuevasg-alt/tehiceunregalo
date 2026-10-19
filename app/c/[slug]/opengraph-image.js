import { ImageResponse } from "next/og";
import { celebracionPublica } from "@/lib/datos";
import { ocasion, OCASIONES } from "@/lib/ocasiones";
import { TEMAS, posValida } from "@/lib/temas";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Invitación en Te hice un regalo";

// Descarga una fuente de Google Fonts en formato TTF (el que entiende el generador de imágenes).
async function fuente(familia, estilo) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${familia}:${estilo}&display=swap`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch { return null; }
}

function fechaLarga(f) {
  if (!f) return "";
  const t = new Date(f + "T12:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default async function Imagen({ params }) {
  const { slug } = await params;
  const c = await celebracionPublica(slug);
  const [serif, serifItalica, sans] = await Promise.all([
    fuente("Fraunces", "wght@400"), fuente("Fraunces", "ital,wght@1,400"), fuente("Sora", "wght@600"),
  ]);
  const fonts = [
    serif && { name: "Fraunces", data: serif, style: "normal", weight: 400 },
    serifItalica && { name: "Fraunces", data: serifItalica, style: "italic", weight: 400 },
    sans && { name: "Sora", data: sans, style: "normal", weight: 600 },
  ].filter(Boolean);

  const t = TEMAS[c?.tema] || TEMAS.azul;
  const fondo = t.fondo, texto = t.texto, acento = t.acento, suave = t.suave;
  const nombre = c?.nombre || "Te hice un regalo";
  const largo = nombre.length > 18;
  const sup = c ? `${OCASIONES[c.ocasion] || ""}${c.ocasion === "cumpleanos" && c.edad ? ` · ${c.edad} años` : ""}` : "";
  const cuando = c ? [fechaLarga(c.fecha), c.hora ? `${c.hora} hrs` : ""].filter(Boolean).join(" · ") : "";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 60, padding: "60px 72px", background: fondo, color: texto, fontFamily: "Sora" }}>
        {c?.portada && (
          <img src={c.portada} width={370} height={510} style={{ width: 370, height: 510, objectFit: "cover", objectPosition: posValida(c.portada_pos), borderRadius: "185px 185px 24px 24px" }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 24 }}>
          {sup && <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: acento }}>{sup}</div>}
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Fraunces", fontSize: c?.portada ? (largo ? 64 : 80) : (largo ? 76 : 96), lineHeight: 1.04, letterSpacing: -1.5 }}>
            <span>{c ? ocasion(c.ocasion).titulo : ""}</span>
            <span style={{ fontStyle: "italic", color: acento }}>{nombre}</span>
          </div>
          {cuando && <div style={{ fontSize: 28, color: suave }}>{cuando}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16, fontSize: 22, color: suave }}>
            <div style={{ display: "flex", flexWrap: "wrap", width: 30, gap: 2 }}>
              <div style={{ width: 14, height: 14, background: texto, borderRadius: 2 }} />
              <div style={{ width: 14, height: 14, background: "#E9A93B", borderRadius: 2 }} />
              <div style={{ width: 14, height: 14, background: "#E9A93B", borderRadius: 2 }} />
              <div style={{ width: 14, height: 14, background: texto, borderRadius: 2 }} />
            </div>
            tehiceunregalo.cl · Regálale lo que de verdad quiere
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}

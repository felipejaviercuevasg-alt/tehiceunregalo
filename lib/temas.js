// Colores de portada que puede elegir el festejado.
export const TEMAS = {
  azul:      { nombre: "Azul noche", fondo: "#17324D", texto: "#FBF6EC", acento: "#E9A93B", suave: "#C9D3DD", caja: "rgba(251,246,236,.08)" },
  mostaza:   { nombre: "Mostaza",    fondo: "#E9A93B", texto: "#17324D", acento: "#17324D", suave: "#3B4A5A", caja: "rgba(23,50,77,.08)" },
  terracota: { nombre: "Terracota",  fondo: "#B4532D", texto: "#FBF6EC", acento: "#FCEFD6", suave: "#F6DCCD", caja: "rgba(251,246,236,.12)" },
  bosque:    { nombre: "Bosque",     fondo: "#1F4D3F", texto: "#F4F1E6", acento: "#E9A93B", suave: "#C8D8CF", caja: "rgba(244,241,230,.09)" },
  rosa:      { nombre: "Rosa",       fondo: "#F3D3D0", texto: "#5A2433", acento: "#B4532D", suave: "#7A4652", caja: "rgba(90,36,51,.07)" },
  celeste:   { nombre: "Celeste",    fondo: "#D6E8F2", texto: "#17324D", acento: "#B4532D", suave: "#4A5D70", caja: "rgba(23,50,77,.07)" },
  lila:      { nombre: "Lila",       fondo: "#4B3A6B", texto: "#F6F1FA", acento: "#F2C14E", suave: "#D7CCE6", caja: "rgba(246,241,250,.1)" },
};

// Variables CSS de la portada. Con foto, el texto va claro sobre la foto oscurecida.
export function estiloPortada(tema, portada) {
  const t = TEMAS[tema] || TEMAS.azul;
  if (portada) {
    return {
      "--p-texto": "#FFFFFF", "--p-acento": "#F2C14E", "--p-suave": "#E6ECF1", "--p-caja": "rgba(15,34,54,.45)",
      backgroundColor: t.fondo,
      backgroundImage: `linear-gradient(180deg, rgba(15,34,54,.35), rgba(15,34,54,.82)), url("${portada}")`,
      backgroundSize: "cover", backgroundPosition: "center",
    };
  }
  return { "--p-fondo": t.fondo, "--p-texto": t.texto, "--p-acento": t.acento, "--p-suave": t.suave, "--p-caja": t.caja };
}

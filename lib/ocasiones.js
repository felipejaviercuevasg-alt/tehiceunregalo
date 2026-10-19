// Ocasiones disponibles. Para agregar una nueva: súmala aquí, en lib/deseos.js y en la restricción de la base de datos.
export const LISTA_OCASIONES = [
  { id: "cumpleanos", nombre: "Cumpleaños", titulo: "El cumpleaños de", para: "un cumpleaños", etiquetaNombre: "Tu nombre", ejemplo: "Ej: Camila" },
  { id: "matrimonio", nombre: "Matrimonio", titulo: "El matrimonio de", para: "un matrimonio", etiquetaNombre: "Nombres de los novios", ejemplo: "Ej: Camila y Andrés" },
  { id: "baby-shower", nombre: "Baby shower", titulo: "El baby shower de", para: "un baby shower", etiquetaNombre: "Nombre del bebé o de los papás", ejemplo: "Ej: Agustín" },
  { id: "home-shower", nombre: "Home shower", titulo: "El home shower de", para: "un home shower", etiquetaNombre: "Nombre de quienes estrenan casa", ejemplo: "Ej: Camila y Andrés" },
  { id: "graduacion", nombre: "Graduación", titulo: "La graduación de", para: "una graduación", etiquetaNombre: "Nombre de quien se gradúa", ejemplo: "Ej: Camila" },
  { id: "especial", nombre: "Ocasión especial", titulo: "La celebración de", para: "una ocasión especial", etiquetaNombre: "Tu nombre", ejemplo: "Ej: Camila" },
];

export const OCASIONES = Object.fromEntries(LISTA_OCASIONES.map((o) => [o.id, o.nombre]));
export const ocasion = (id) => LISTA_OCASIONES.find((o) => o.id === id) || LISTA_OCASIONES[LISTA_OCASIONES.length - 1];
export const ocasionValida = (id) => LISTA_OCASIONES.some((o) => o.id === id);

// Validación de RUT chileno (módulo 11).
export function rutValido(rut) {
  const r = String(rut || "").replace(/[.\-\s]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(r)) return false;
  let suma = 0, mult = 2;
  for (let i = r.length - 2; i >= 0; i--) { suma += +r[i] * mult; mult = mult === 7 ? 2 : mult + 1; }
  const dv = 11 - (suma % 11);
  return r.slice(-1) === (dv === 11 ? "0" : dv === 10 ? "K" : String(dv));
}

import crypto from "node:crypto";

// Cifrado AES-256-GCM para los datos bancarios.
function clave() {
  const k = process.env.ENCRYPTION_KEY;
  if (!k || k.length < 32) throw new Error("ENCRYPTION_KEY no configurada (mínimo 32 caracteres)");
  return crypto.createHash("sha256").update(k).digest();
}

export function cifrar(obj) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", clave(), iv);
  const datos = Buffer.concat([c.update(JSON.stringify(obj), "utf8"), c.final()]);
  return [iv, c.getAuthTag(), datos].map((b) => b.toString("base64")).join(".");
}

export function descifrar(txt) {
  try {
    const [iv, tag, datos] = txt.split(".").map((s) => Buffer.from(s, "base64"));
    const d = crypto.createDecipheriv("aes-256-gcm", clave(), iv);
    d.setAuthTag(tag);
    return JSON.parse(Buffer.concat([d.update(datos), d.final()]).toString("utf8"));
  } catch {
    return null;
  }
}

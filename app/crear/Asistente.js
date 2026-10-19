"use client";
import { useState, useRef } from "react";
import { deseosPara } from "@/lib/deseos";
import { rutValido } from "@/lib/rut";

const PASOS = ["Tu celebración", "Regalos", "Buenos deseos", "Recibir el dinero", "Compartir"];
const BANCOS = ["Banco de Chile / Edwards", "BancoEstado", "Santander", "BCI / MACH", "Scotiabank", "Itaú", "Banco Security", "Banco BICE", "Banco Falabella", "Banco Ripley", "Banco Consorcio", "Banco Internacional", "Coopeuch", "Tenpo", "Mercado Pago", "Otro"];
const pesos = (n) => "$" + Math.round(n || 0).toLocaleString("es-CL");

function IconoRegalo() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18" /><path d="M12 8c-2-4-6-4-6-1s6 1 6 1zM12 8c2-4 6-4 6-1s-6 1-6 1z" /></svg>;
}

function fotoComoDato(file) {
  return new Promise((res) => {
    if (!file) return res("");
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 700, k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = () => res("");
    img.src = url;
  });
}

export default function Asistente({ email }) {
  const [paso, setPaso] = useState(1);
  const [ocasion, setOcasion] = useState("cumpleanos");
  const [datos, setDatos] = useState({ nombre: "", edad: "", fecha: "", mensaje: "" });
  const [regalos, setRegalos] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: "", meta: "", link: "", desc: "" });
  const fotoRef = useRef(null);
  const [deseos, setDeseos] = useState([]);
  const [claveDeseos, setClaveDeseos] = useState("");
  const [banco, setBanco] = useState({ titular: "", rut: "", banco: "", tipo: "", numero: "", email: email || "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const ir = (n) => { setError(""); setPaso(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const etiquetaNombre = ocasion === "matrimonio" ? "Nombres de los novios" : ocasion === "baby-shower" ? "Nombre del bebé o de los papás" : "Tu nombre";

  function aPaso2(e) {
    e.preventDefault();
    if (!datos.nombre.trim()) return setError("Escribe un nombre.");
    ir(2);
  }

  async function agregarRegalo(e) {
    e.preventDefault();
    const meta = Math.round(Number(nuevo.meta));
    if (!nuevo.nombre.trim() || !(meta >= 1000)) return setError("Escribe el regalo y una meta de al menos $1.000.");
    if (nuevo.link && !/^https?:\/\//i.test(nuevo.link)) return setError("El link debe empezar con https://");
    const foto = await fotoComoDato(fotoRef.current?.files?.[0]);
    setRegalos([...regalos, { nombre: nuevo.nombre.trim(), meta, link: nuevo.link.trim(), descripcion: nuevo.desc.trim(), foto }]);
    setNuevo({ nombre: "", meta: "", link: "", desc: "" });
    if (fotoRef.current) fotoRef.current.value = "";
    setError("");
  }

  function aPaso3() {
    const sug = deseosPara(ocasion, datos.edad);
    const clave = ocasion + "|" + sug[0].t;
    if (clave !== claveDeseos) { setDeseos(sug.map((d) => ({ ...d, activo: true }))); setClaveDeseos(clave); }
    ir(3);
  }

  function aPaso4() {
    const activos = deseos.filter((d) => d.activo && d.t.trim().length > 10);
    if (!regalos.length && !activos.length) return setError("Agrega al menos un regalo o marca un buen deseo para continuar.");
    ir(4);
  }

  async function publicar(e) {
    e.preventDefault();
    if (!rutValido(banco.rut)) return setError("El RUT no es válido. Revisa el dígito verificador.");
    if (!/^\d{4,20}$/.test(banco.numero.replace(/[\s-]/g, ""))) return setError("Revisa el número de cuenta (solo números).");
    setEnviando(true); setError("");
    try {
      const res = await fetch("/api/celebraciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ocasion, ...datos,
          regalos,
          deseos: deseos.filter((d) => d.activo && d.t.trim().length > 10).map((d) => ({ titulo: d.t.trim(), descripcion: d.d.trim() })),
          banco: { ...banco, numero: banco.numero.replace(/[\s-]/g, "") },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No pudimos crear la celebración.");
      setResultado({ slug: json.slug, url: `${window.location.origin}/c/${json.slug}`, titulo: json.titulo });
      ir(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <ol className="pasos-nav">
        {PASOS.map((p, i) => <li key={p} className={i + 1 < paso ? "hecho" : i + 1 === paso ? "actual" : ""}>{i + 1} · {p}</li>)}
      </ol>

      {paso === 1 && (
        <form className="tarjeta" onSubmit={aPaso2}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 20 }}>¿Qué celebras?</h2>
          <div className="ocasiones" role="group" aria-label="Ocasión">
            {[["cumpleanos", "Cumpleaños"], ["matrimonio", "Matrimonio"], ["baby-shower", "Baby shower"]].map(([v, t]) => (
              <button type="button" key={v} className="ocasion" aria-pressed={ocasion === v} onClick={() => setOcasion(v)}>{t}</button>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <div className="campo"><label htmlFor="nombre">{etiquetaNombre}</label><input type="text" id="nombre" maxLength={80} required value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} placeholder={ocasion === "matrimonio" ? "Ej: Camila y Andrés" : ocasion === "baby-shower" ? "Ej: Agustín" : "Ej: Camila"} /></div>
            <div className="fila">
              {ocasion === "cumpleanos" && (
                <div className="campo"><label htmlFor="edad">¿Cuántos años cumples?</label><input type="number" id="edad" min={1} max={120} value={datos.edad} onChange={(e) => setDatos({ ...datos, edad: e.target.value })} placeholder="Ej: 30" /><p className="ayuda">Lo usamos para sugerirte buenos deseos.</p></div>
              )}
              <div className="campo"><label htmlFor="fecha">Fecha de la celebración</label><input type="date" id="fecha" required value={datos.fecha} onChange={(e) => setDatos({ ...datos, fecha: e.target.value })} /></div>
            </div>
            <div className="campo"><label htmlFor="mensaje">Mensaje para tus invitados <span className="gris" style={{ fontWeight: 400 }}>(opcional)</span></label><textarea id="mensaje" maxLength={400} value={datos.mensaje} onChange={(e) => setDatos({ ...datos, mensaje: e.target.value })} placeholder="Ej: ¡Gracias por acompañarme! Cualquier aporte me acerca a cumplir mis sueños." /></div>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="navegacion"><span /><button className="btn btn-oscuro">Siguiente: regalos</button></div>
        </form>
      )}

      {paso === 2 && (
        <div>
          <form className="tarjeta" onSubmit={agregarRegalo}>
            <h2 style={{ fontSize: "1.5rem" }}>Tus regalos soñados</h2>
            <p className="gris" style={{ margin: "8px 0 22px" }}>Agrega lo que quieres recibir y ponle una meta. Tus invitados podrán aportar desde el 1% hasta el 100%. Si prefieres pedir solo buenos deseos, puedes saltarte este paso.</p>
            <div className="campo"><label htmlFor="rNombre">¿Qué regalo quieres?</label><input type="text" id="rNombre" maxLength={80} value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Ej: Casco de moto" /></div>
            <div className="fila">
              <div className="campo"><label htmlFor="rMeta">Meta (precio objetivo)</label><div className="prefijo"><span>$</span><input type="number" id="rMeta" min={1000} step={1000} value={nuevo.meta} onChange={(e) => setNuevo({ ...nuevo, meta: e.target.value })} placeholder="200000" /></div></div>
              <div className="campo"><label htmlFor="rLink">Link donde lo venden <span className="gris" style={{ fontWeight: 400 }}>(opcional)</span></label><input type="url" id="rLink" maxLength={500} value={nuevo.link} onChange={(e) => setNuevo({ ...nuevo, link: e.target.value })} placeholder="https://…" /></div>
            </div>
            <div className="campo"><label htmlFor="rDesc">Descripción <span className="gris" style={{ fontWeight: 400 }}>(opcional)</span></label><input type="text" id="rDesc" maxLength={160} value={nuevo.desc} onChange={(e) => setNuevo({ ...nuevo, desc: e.target.value })} placeholder="Ej: Talla M, color negro mate" /></div>
            <div className="campo"><label htmlFor="rFoto">Foto <span className="gris" style={{ fontWeight: 400 }}>(opcional)</span></label><input type="file" id="rFoto" accept="image/*" ref={fotoRef} style={{ minHeight: 44 }} /></div>
            {error && <p className="error" role="alert">{error}</p>}
            <button className="btn btn-primario" type="submit">Agregar regalo</button>
          </form>
          <div style={{ marginTop: 20 }}>
            {regalos.map((r, i) => (
              <div className="regalo-item" key={i}>
                <div className="miniatura">{r.foto ? <img src={r.foto} alt="" /> : <IconoRegalo />}</div>
                <div><h3>{r.nombre}</h3><p className="gris" style={{ fontSize: ".92rem" }}>Meta {pesos(r.meta)}{r.descripcion ? " · " + r.descripcion : ""}</p></div>
                <div className="acciones-item"><button className="btn-texto" type="button" onClick={() => setRegalos(regalos.filter((_, j) => j !== i))}>Quitar</button></div>
              </div>
            ))}
          </div>
          <div className="navegacion"><button className="btn btn-secundario" type="button" onClick={() => ir(1)}>Atrás</button><button className="btn btn-oscuro" type="button" onClick={aPaso3}>Siguiente: buenos deseos</button></div>
        </div>
      )}

      {paso === 3 && (
        <div>
          <div className="tarjeta" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.5rem" }}>Buenos deseos</h2>
            <p className="gris" style={{ marginTop: 8 }}>Te sugerimos estos deseos para {ocasion === "matrimonio" ? "un matrimonio" : ocasion === "baby-shower" ? "un baby shower" : "un cumpleaños" + (datos.edad ? ` de ${datos.edad} años` : "")}. Marca los que quieras ofrecer, edita el texto a tu gusto o escribe los tuyos. Cada invitado podrá elegir uno y regalártelo con el monto que quiera.</p>
          </div>
          {deseos.map((d, i) => {
            const set = (cambio) => setDeseos(deseos.map((x, j) => (j === i ? { ...x, ...cambio } : x)));
            return (
              <div key={i} className={"deseo-edit" + (d.activo ? " activo" : "")}>
                <input type="checkbox" checked={d.activo} onChange={(e) => set({ activo: e.target.checked })} aria-label="Incluir este deseo" />
                <div>
                  <input type="text" maxLength={140} value={d.t} onChange={(e) => set({ t: e.target.value })} aria-label="Título del deseo" />
                  <textarea rows={2} maxLength={300} value={d.d} onChange={(e) => set({ d: e.target.value })} aria-label="Descripción del deseo" />
                </div>
              </div>
            );
          })}
          <button className="btn btn-secundario" type="button" style={{ marginTop: 8 }} onClick={() => setDeseos([...deseos, { t: "Te regalo ", d: "", activo: true }])}>+ Escribir mi propio deseo</button>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="navegacion"><button className="btn btn-secundario" type="button" onClick={() => ir(2)}>Atrás</button><button className="btn btn-oscuro" type="button" onClick={aPaso4}>Siguiente: recibir el dinero</button></div>
        </div>
      )}

      {paso === 4 && (
        <form className="tarjeta" onSubmit={publicar}>
          <h2 style={{ fontSize: "1.5rem" }}>¿Dónde te transferimos lo reunido?</h2>
          <p className="gris" style={{ margin: "8px 0 22px" }}>Tus invitados pagan con Mercado Pago y nosotros te transferimos lo reunido a esta cuenta cada 7 días, y el saldo final a más tardar 24 horas después de tu celebración. Tus datos se guardan cifrados y solo se usan para hacerte la transferencia.</p>
          <div className="fila">
            <div className="campo"><label htmlFor="bTitular">Nombre del titular</label><input type="text" id="bTitular" maxLength={80} required autoComplete="name" value={banco.titular} onChange={(e) => setBanco({ ...banco, titular: e.target.value })} /></div>
            <div className="campo"><label htmlFor="bRut">RUT del titular</label><input type="text" id="bRut" maxLength={12} required placeholder="12.345.678-9" value={banco.rut} onChange={(e) => setBanco({ ...banco, rut: e.target.value })} /></div>
          </div>
          <div className="fila">
            <div className="campo"><label htmlFor="bBanco">Banco</label>
              <select id="bBanco" required value={banco.banco} onChange={(e) => setBanco({ ...banco, banco: e.target.value })}>
                <option value="">Elige tu banco</option>{BANCOS.map((b) => <option key={b}>{b}</option>)}
              </select></div>
            <div className="campo"><label htmlFor="bTipo">Tipo de cuenta</label>
              <select id="bTipo" required value={banco.tipo} onChange={(e) => setBanco({ ...banco, tipo: e.target.value })}>
                <option value="">Elige el tipo</option><option>Cuenta corriente</option><option>Cuenta vista / CuentaRUT</option><option>Cuenta de ahorro</option>
              </select></div>
          </div>
          <div className="fila">
            <div className="campo"><label htmlFor="bNumero">Número de cuenta</label><input type="text" id="bNumero" maxLength={24} required inputMode="numeric" value={banco.numero} onChange={(e) => setBanco({ ...banco, numero: e.target.value })} /></div>
            <div className="campo"><label htmlFor="bEmail">Correo del titular</label><input type="email" id="bEmail" maxLength={100} required value={banco.email} onChange={(e) => setBanco({ ...banco, email: e.target.value })} /></div>
          </div>
          <p className="ayuda">Al crear tu celebración aceptas los <a href="/terminos" target="_blank">términos y condiciones</a>.</p>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="navegacion"><button type="button" className="btn btn-secundario" onClick={() => ir(3)}>Atrás</button><button type="submit" className="btn btn-oscuro" disabled={enviando}>{enviando ? "Creando…" : "Crear mi celebración"}</button></div>
        </form>
      )}

      {paso === 5 && resultado && (
        <div className="tarjeta" style={{ textAlign: "center", padding: "44px 28px" }}>
          <img src="/thur-isotipo-color.svg" alt="" style={{ width: 110, margin: "0 auto 20px" }} />
          <h2 style={{ fontSize: "1.8rem" }}>¡Tu celebración está lista!</h2>
          <p className="gris" style={{ marginTop: 10 }}>Comparte este enlace con tus invitados.</p>
          <div className="enlace-final">
            <input type="text" readOnly value={resultado.url} aria-label="Enlace de tu celebración" onFocus={(e) => e.target.select()} />
            <button className="btn btn-primario" type="button" onClick={async () => { try { await navigator.clipboard.writeText(resultado.url); setCopiado(true); } catch {} }}>{copiado ? "¡Copiado!" : "Copiar"}</button>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn-oscuro" target="_blank" rel="noopener" href={"https://wa.me/?text=" + encodeURIComponent(`${resultado.titulo} 🎁 Regálale algo que de verdad quiere: ${resultado.url}`)}>Compartir por WhatsApp</a>
            <a className="btn btn-secundario" href={`/c/${resultado.slug}`}>Ver mi celebración</a>
          </div>
        </div>
      )}
    </>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import { deseosPara } from "@/lib/deseos";
import { rutValido } from "@/lib/rut";
import { TEMAS, estiloPortada, posValida } from "@/lib/temas";

const BANCOS = ["Banco de Chile / Edwards", "BancoEstado", "Santander", "BCI / MACH", "Scotiabank", "Itaú", "Banco Security", "Banco BICE", "Banco Falabella", "Banco Ripley", "Banco Consorcio", "Banco Internacional", "Coopeuch", "Tenpo", "Mercado Pago", "Otro"];
const OCASIONES = { cumpleanos: "Cumpleaños", matrimonio: "Matrimonio", "baby-shower": "Baby shower" };
const pesos = (n) => "$" + Math.round(n || 0).toLocaleString("es-CL");
let contador = 0;
const clave = () => "k" + ++contador;

function IconoRegalo() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18" /><path d="M12 8c-2-4-6-4-6-1s6 1 6 1zM12 8c2-4 6-4 6-1s-6 1-6 1z" /></svg>;
}

// Reduce la foto en el navegador y la devuelve como JPEG.
function fotoComoDato(file, max = 700, calidad = 0.78) {
  return new Promise((res) => {
    if (!file) return res("");
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", calidad));
    };
    img.onerror = () => { URL.revokeObjectURL(url); res(""); };
    img.src = url;
  });
}

// Vista previa de la portada con foto; se puede arrastrar para mover el encuadre.
function VistaFoto({ tema, portada, pos, setPos, ancho = false, datos, ocasion }) {
  const ref = useRef(null);
  const arrastre = useRef(null);
  const abajo = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = { x: e.clientX, y: e.clientY, pos };
  };
  const mueve = (e) => {
    const a = arrastre.current; if (!a) return;
    const r = ref.current.getBoundingClientRect();
    // Arrastrar hacia la derecha muestra más de la izquierda de la foto (como mover la foto con el dedo).
    const k = (v) => Math.max(0, Math.min(100, Math.round(v)));
    setPos([k(a.pos[0] - ((e.clientX - a.x) / r.width) * 100), k(a.pos[1] - ((e.clientY - a.y) / r.height) * 100)]);
  };
  const suelta = () => { arrastre.current = null; };
  return (
    <div ref={ref} className={"vista-portada vista-foto" + (ancho ? " ancha" : " angosta")}
      style={{ ...estiloPortada(tema, portada, `${pos[0]}% ${pos[1]}%`), color: "var(--p-texto)" }}
      onPointerDown={abajo} onPointerMove={mueve} onPointerUp={suelta} onPointerCancel={suelta}>
      <span className="etiqueta">{OCASIONES[ocasion]}</span>
      <h3>{datos.nombre || "Tu nombre"}</h3>
    </div>
  );
}

function mover(lista, i, d) {
  const j = i + d;
  if (j < 0 || j >= lista.length) return lista;
  const n = [...lista]; [n[i], n[j]] = [n[j], n[i]]; return n;
}

export default function Editor({ inicial }) {
  const [datos, setDatos] = useState({ nombre: inicial.nombre, edad: inicial.edad, fecha: inicial.fecha, mensaje: inicial.mensaje });
  const [tema, setTema] = useState(inicial.tema);
  const [portada, setPortada] = useState(inicial.portada);
  const [portadaCambio, setPortadaCambio] = useState(false);
  const [pos, setPos] = useState(() => posValida(inicial.portada_pos).split(" ").map((v) => parseInt(v, 10)));
  const [regalos, setRegalos] = useState(() => inicial.regalos.map((r) => ({ ...r, k: clave(), fotoCambio: false })));
  const [deseos, setDeseos] = useState(() => inicial.deseos.map((d) => ({ ...d, k: clave() })));
  const [abierta, setAbierta] = useState(inicial.estado === "activa");
  const [bancoResumen, setBancoResumen] = useState(inicial.banco_resumen);
  const [cambiarBanco, setCambiarBanco] = useState(false);
  const [banco, setBanco] = useState({ titular: "", rut: "", banco: "", tipo: "", numero: "", email: "" });
  const [verSug, setVerSug] = useState(false);
  const [sucio, setSucio] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const marcar = () => { setSucio(true); setOk(false); };

  useEffect(() => {
    const aviso = (e) => { if (sucio) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sucio]);

  const setR = (i, cambio) => { setRegalos(regalos.map((r, j) => (j === i ? { ...r, ...cambio } : r))); marcar(); };
  const setD = (i, cambio) => { setDeseos(deseos.map((d, j) => (j === i ? { ...d, ...cambio } : d))); marcar(); };

  async function elegirPortada(e) {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    const dato = await fotoComoDato(f, 1600, 0.8);
    if (!dato) return setError("No pudimos leer esa foto. Prueba con otra.");
    setPortada(dato); setPortadaCambio(true); setPos([50, 50]); marcar();
  }
  async function elegirFotoRegalo(i, e) {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    const dato = await fotoComoDato(f);
    if (!dato) return setError("No pudimos leer esa foto. Prueba con otra.");
    setR(i, { foto: dato, fotoCambio: true });
  }

  function quitarRegalo(i) {
    const r = regalos[i];
    if (r.reunido > 0 && !window.confirm(`"${r.nombre}" ya tiene ${pesos(r.reunido)} en aportes. Si lo quitas, ese dinero igual es tuyo y se te transfiere, pero el regalo deja de aparecer en tu página. ¿Quitarlo?`)) return;
    setRegalos(regalos.filter((_, j) => j !== i)); marcar();
  }
  function quitarDeseo(i) {
    const d = deseos[i];
    if (d.veces > 0 && !window.confirm(`Este deseo ya fue regalado ${d.veces} ${d.veces === 1 ? "vez" : "veces"}. El dinero igual es tuyo, pero el deseo deja de aparecer. ¿Quitarlo?`)) return;
    setDeseos(deseos.filter((_, j) => j !== i)); marcar();
  }

  const sugerencias = deseosPara(inicial.ocasion, datos.edad).filter((s) => !deseos.some((d) => d.titulo.trim().toLowerCase() === s.t.toLowerCase()));

  async function guardar() {
    setError(""); setOk(false);
    if (!datos.nombre.trim()) return setError("Escribe un nombre.");
    if (!datos.fecha) return setError("Indica la fecha de la celebración.");
    for (const r of regalos) {
      if (!r.nombre.trim()) return setError("Hay un regalo sin nombre.");
      if (!(Number(r.meta) >= 1000)) return setError(`La meta de "${r.nombre}" debe ser de al menos $1.000.`);
      if (Number(r.meta) < r.reunido) return setError(`La meta de "${r.nombre}" no puede ser menor a lo que ya te regalaron (${pesos(r.reunido)}).`);
      if (r.link && !/^https?:\/\//i.test(r.link)) return setError(`El link de "${r.nombre}" debe empezar con https://`);
    }
    for (const d of deseos) if (d.titulo.trim().length < 4) return setError("Hay un buen deseo vacío o muy corto.");
    if (!regalos.length && !deseos.length) return setError("Deja al menos un regalo o un buen deseo.");
    if (cambiarBanco) {
      if (!banco.titular.trim() || !banco.banco || !banco.tipo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(banco.email)) return setError("Completa todos los datos de la nueva cuenta.");
      if (!rutValido(banco.rut)) return setError("El RUT de la nueva cuenta no es válido.");
      if (!/^\d{4,24}$/.test(banco.numero.replace(/[\s-]/g, ""))) return setError("Revisa el número de la nueva cuenta (solo números).");
    }

    setGuardando(true);
    try {
      const res = await fetch(`/api/celebraciones/${inicial.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...datos, tema, estado: abierta ? "activa" : "cerrada", portada_pos: `${pos[0]}% ${pos[1]}%`,
          ...(portadaCambio ? { portada } : {}),
          regalos: regalos.map((r) => ({ id: r.id, nombre: r.nombre, descripcion: r.descripcion, link: r.link.trim(), meta: Math.round(Number(r.meta)), ...(r.fotoCambio ? { foto: r.foto } : {}) })),
          deseos: deseos.map((d) => ({ id: d.id, titulo: d.titulo, descripcion: d.descripcion })),
          ...(cambiarBanco ? { banco: { ...banco, numero: banco.numero.replace(/[\s-]/g, "") } } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || (res.status === 413 ? "Las fotos pesan demasiado juntas. Guarda de a poco." : "No pudimos guardar los cambios."));
      // Los regalos y deseos nuevos reciben su id definitivo.
      setRegalos((rs) => rs.map((r, i) => ({ ...r, id: json.regalos[i], fotoCambio: false })));
      setDeseos((ds) => ds.map((d, i) => ({ ...d, id: json.deseos[i] })));
      setPortadaCambio(false);
      if (json.banco_resumen) { setBancoResumen(json.banco_resumen); setCambiarBanco(false); setBanco({ titular: "", rut: "", banco: "", tipo: "", numero: "", email: "" }); }
      setSucio(false); setOk(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  const etiquetaNombre = inicial.ocasion === "matrimonio" ? "Nombres de los novios" : inicial.ocasion === "baby-shower" ? "Nombre del bebé o de los papás" : "Tu nombre";

  return (
    <>
      {/* Portada */}
      <section className="tarjeta ed-seccion" style={{ padding: 28 }}>
        <h2>Portada</h2>
        <p className="gris">Es lo primero que ven tus invitados. Sube una foto tuya o elige un color.</p>
        {portada ? (
          <>
            <div className="vistas-foto">
              <div>
                <span className="ayuda">En computador</span>
                <VistaFoto tema={tema} portada={portada} pos={pos} setPos={(p) => { setPos(p); marcar(); }} ancho datos={datos} ocasion={inicial.ocasion} />
              </div>
              <div>
                <span className="ayuda">En celular</span>
                <VistaFoto tema={tema} portada={portada} pos={pos} setPos={(p) => { setPos(p); marcar(); }} datos={datos} ocasion={inicial.ocasion} />
              </div>
            </div>
            <p className="ayuda" style={{ margin: "4px 0 10px" }}><strong>Arrastra la foto</strong> para encuadrarla, o usa las barras.</p>
            <div className="fila" style={{ marginBottom: 14 }}>
              <div><label htmlFor="posX" style={{ fontSize: ".88rem" }}>Mover a los lados</label><input type="range" id="posX" min={0} max={100} value={pos[0]} onChange={(e) => { setPos([+e.target.value, pos[1]]); marcar(); }} /></div>
              <div><label htmlFor="posY" style={{ fontSize: ".88rem" }}>Mover arriba / abajo</label><input type="range" id="posY" min={0} max={100} value={pos[1]} onChange={(e) => { setPos([pos[0], +e.target.value]); marcar(); }} /></div>
            </div>
          </>
        ) : (
          <div className="vista-portada" style={{ ...estiloPortada(tema, ""), color: "var(--p-texto)", background: "var(--p-fondo)" }}>
            <span className="etiqueta">{OCASIONES[inicial.ocasion]}</span>
            <h3>{datos.nombre || "Tu nombre"}</h3>
            {datos.fecha && <p>{new Date(datos.fecha + "T12:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</p>}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          <label className="btn btn-oscuro btn-chico" style={{ margin: 0 }}>
            {portada ? "Cambiar foto de portada" : "Subir foto de portada"}
            <input type="file" accept="image/*" onChange={elegirPortada} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
          </label>
          {portada && <button type="button" className="btn-texto" onClick={() => { setPortada(""); setPortadaCambio(true); marcar(); }}>Quitar foto</button>}
        </div>
        <label>{portada ? "Color de respaldo" : "Color de la portada"}</label>
        <div className="temas" role="group" aria-label="Color de la portada">
          {Object.entries(TEMAS).map(([v, t]) => (
            <button key={v} type="button" className="tema" title={t.nombre} aria-label={t.nombre} aria-pressed={tema === v} style={{ background: `linear-gradient(135deg, ${t.fondo} 60%, ${t.acento} 60%)` }} onClick={() => { setTema(v); marcar(); }} />
          ))}
        </div>
      </section>

      {/* Datos */}
      <section className="tarjeta ed-seccion">
        <h2>Datos de la celebración</h2>
        <p className="gris">La ocasión no se puede cambiar. Si te equivocaste, crea una celebración nueva.</p>
        <div className="campo"><label htmlFor="eNombre">{etiquetaNombre}</label><input type="text" id="eNombre" maxLength={80} value={datos.nombre} onChange={(e) => { setDatos({ ...datos, nombre: e.target.value }); marcar(); }} /></div>
        <div className="fila">
          {inicial.ocasion === "cumpleanos" && <div className="campo"><label htmlFor="eEdad">Años que cumples</label><input type="number" id="eEdad" min={1} max={120} value={datos.edad} onChange={(e) => { setDatos({ ...datos, edad: e.target.value }); marcar(); }} /></div>}
          <div className="campo"><label htmlFor="eFecha">Fecha de la celebración</label><input type="date" id="eFecha" value={datos.fecha} onChange={(e) => { setDatos({ ...datos, fecha: e.target.value }); marcar(); }} /><p className="ayuda">El saldo final se transfiere a más tardar 24 horas después de esta fecha.</p></div>
        </div>
        <div className="campo"><label htmlFor="eMsj">Mensaje para tus invitados</label><textarea id="eMsj" maxLength={400} value={datos.mensaje} onChange={(e) => { setDatos({ ...datos, mensaje: e.target.value }); marcar(); }} placeholder="Ej: ¡Gracias por acompañarme! Cualquier aporte me acerca a cumplir mis sueños." /></div>
      </section>

      {/* Regalos */}
      <section className="tarjeta ed-seccion">
        <h2>Regalos ({regalos.length})</h2>
        <p className="gris">Cambia nombres, precios y fotos, ordénalos o agrega nuevos. La meta no puede quedar bajo lo que ya te regalaron.</p>
        {regalos.map((r, i) => (
          <div className="ed-item" key={r.k}>
            <div className="ed-foto">
              <div className="miniatura">{r.foto ? <img src={r.foto} alt="" /> : <IconoRegalo />}</div>
              <label>{r.foto ? "Cambiar foto" : "Agregar foto"}<input type="file" accept="image/*" onChange={(e) => elegirFotoRegalo(i, e)} /></label>
              {r.foto && <button type="button" className="btn-texto" style={{ minHeight: 32, padding: 0, fontSize: ".85rem" }} onClick={() => setR(i, { foto: "", fotoCambio: true })}>Quitar foto</button>}
            </div>
            <div>
              <div className="fila">
                <div className="campo"><label htmlFor={`rn${r.k}`}>Regalo</label><input type="text" id={`rn${r.k}`} maxLength={80} value={r.nombre} onChange={(e) => setR(i, { nombre: e.target.value })} /></div>
                <div className="campo"><label htmlFor={`rm${r.k}`}>Meta</label><div className="prefijo"><span>$</span><input type="number" id={`rm${r.k}`} min={Math.max(1000, r.reunido)} step={1000} value={r.meta} onChange={(e) => setR(i, { meta: e.target.value })} /></div>{r.reunido > 0 && <p className="ayuda">Ya te regalaron {pesos(r.reunido)}</p>}</div>
              </div>
              <div className="campo"><label htmlFor={`rd${r.k}`}>Descripción</label><input type="text" id={`rd${r.k}`} maxLength={160} value={r.descripcion} onChange={(e) => setR(i, { descripcion: e.target.value })} placeholder="Ej: Talla M, color negro" /></div>
              <div className="campo"><label htmlFor={`rl${r.k}`}>Link donde lo venden</label><input type="url" id={`rl${r.k}`} maxLength={500} value={r.link} onChange={(e) => setR(i, { link: e.target.value })} placeholder="https://…" /></div>
              <div className="ed-acciones">
                <button type="button" className="btn-icono" aria-label="Subir" disabled={i === 0} onClick={() => { setRegalos(mover(regalos, i, -1)); marcar(); }}>↑</button>
                <button type="button" className="btn-icono" aria-label="Bajar" disabled={i === regalos.length - 1} onClick={() => { setRegalos(mover(regalos, i, 1)); marcar(); }}>↓</button>
                <button type="button" className="btn-texto" onClick={() => quitarRegalo(i)}>Quitar regalo</button>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-primario btn-chico" disabled={regalos.length >= 30} onClick={() => { setRegalos([...regalos, { k: clave(), id: null, nombre: "", meta: "", descripcion: "", link: "", foto: "", fotoCambio: false, reunido: 0 }]); marcar(); }}>+ Agregar regalo</button>
      </section>

      {/* Deseos */}
      <section className="tarjeta ed-seccion">
        <h2>Buenos deseos ({deseos.length})</h2>
        <p className="gris">Edita el texto, cambia el orden, quita los que no quieras o agrega nuevos.</p>
        {deseos.map((d, i) => (
          <div className="ed-deseo" key={d.k}>
            <input type="text" maxLength={140} value={d.titulo} onChange={(e) => setD(i, { titulo: e.target.value })} aria-label="Título del deseo" placeholder="Te regalo…" />
            <textarea maxLength={300} value={d.descripcion} onChange={(e) => setD(i, { descripcion: e.target.value })} aria-label="Descripción del deseo" placeholder="Una frase que lo explique (opcional)" />
            <div className="ed-acciones" style={{ marginTop: 6 }}>
              {d.veces > 0 && <span className="gris" style={{ fontSize: ".85rem", marginRight: "auto" }}>Regalado {d.veces} {d.veces === 1 ? "vez" : "veces"}</span>}
              <button type="button" className="btn-icono" aria-label="Subir" disabled={i === 0} onClick={() => { setDeseos(mover(deseos, i, -1)); marcar(); }}>↑</button>
              <button type="button" className="btn-icono" aria-label="Bajar" disabled={i === deseos.length - 1} onClick={() => { setDeseos(mover(deseos, i, 1)); marcar(); }}>↓</button>
              <button type="button" className="btn-texto" onClick={() => quitarDeseo(i)}>Quitar</button>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primario btn-chico" disabled={deseos.length >= 40} onClick={() => { setDeseos([...deseos, { k: clave(), id: null, titulo: "Te regalo ", descripcion: "", veces: 0 }]); marcar(); }}>+ Escribir un deseo</button>
          {sugerencias.length > 0 && <button type="button" className="btn btn-secundario btn-chico" onClick={() => setVerSug(!verSug)}>{verSug ? "Ocultar sugerencias" : `Ver sugerencias (${sugerencias.length})`}</button>}
        </div>
        {verSug && sugerencias.length > 0 && (
          <div style={{ marginTop: 14, background: "var(--crema)", borderRadius: 14, padding: "6px 16px" }}>
            {sugerencias.map((s) => (
              <div className="sugerencia" key={s.t}>
                <div><strong>{s.t}</strong><br /><span className="gris" style={{ fontSize: ".9rem" }}>{s.d}</span></div>
                <button type="button" className="btn-texto" disabled={deseos.length >= 40} onClick={() => { setDeseos([...deseos, { k: clave(), id: null, titulo: s.t, descripcion: s.d, veces: 0 }]); marcar(); }}>+ Agregar</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recibir regalos */}
      <section className="tarjeta ed-seccion">
        <h2>Recibir regalos</h2>
        <p className="gris">Si pausas tu celebración, la página sigue visible pero nadie puede regalar.</p>
        <label className="interruptor">
          <input type="checkbox" checked={abierta} disabled={inicial.pagoFinal && !abierta} onChange={(e) => { setAbierta(e.target.checked); marcar(); }} />
          {abierta ? "Recibiendo regalos" : "Pausada: no recibe regalos"}
        </label>
        {inicial.pagoFinal && !abierta && <p className="ayuda">Ya recibiste el pago final, así que esta celebración quedó cerrada.</p>}
      </section>

      {/* Cuenta bancaria */}
      <section className="tarjeta ed-seccion">
        <h2>Cuenta para recibir el dinero</h2>
        <p className="gris">Ahora transferimos a: <strong style={{ color: "var(--azul)" }}>{bancoResumen}</strong></p>
        {!cambiarBanco ? (
          <button type="button" className="btn btn-secundario btn-chico" onClick={() => setCambiarBanco(true)}>Cambiar cuenta</button>
        ) : (
          <div>
            <p className="aviso" style={{ marginBottom: 16 }}>Escribe todos los datos de la nueva cuenta. Las próximas transferencias irán a ella.</p>
            <div className="fila">
              <div className="campo"><label htmlFor="bT">Nombre del titular</label><input type="text" id="bT" maxLength={80} value={banco.titular} onChange={(e) => { setBanco({ ...banco, titular: e.target.value }); marcar(); }} /></div>
              <div className="campo"><label htmlFor="bR">RUT del titular</label><input type="text" id="bR" maxLength={12} placeholder="12.345.678-9" value={banco.rut} onChange={(e) => { setBanco({ ...banco, rut: e.target.value }); marcar(); }} /></div>
            </div>
            <div className="fila">
              <div className="campo"><label htmlFor="bB">Banco</label><select id="bB" value={banco.banco} onChange={(e) => { setBanco({ ...banco, banco: e.target.value }); marcar(); }}><option value="">Elige tu banco</option>{BANCOS.map((x) => <option key={x}>{x}</option>)}</select></div>
              <div className="campo"><label htmlFor="bTi">Tipo de cuenta</label><select id="bTi" value={banco.tipo} onChange={(e) => { setBanco({ ...banco, tipo: e.target.value }); marcar(); }}><option value="">Elige el tipo</option><option>Cuenta corriente</option><option>Cuenta vista / CuentaRUT</option><option>Cuenta de ahorro</option></select></div>
            </div>
            <div className="fila">
              <div className="campo"><label htmlFor="bN">Número de cuenta</label><input type="text" id="bN" inputMode="numeric" maxLength={24} value={banco.numero} onChange={(e) => { setBanco({ ...banco, numero: e.target.value }); marcar(); }} /></div>
              <div className="campo"><label htmlFor="bE">Correo del titular</label><input type="email" id="bE" maxLength={100} value={banco.email} onChange={(e) => { setBanco({ ...banco, email: e.target.value }); marcar(); }} /></div>
            </div>
            <button type="button" className="btn-texto" onClick={() => setCambiarBanco(false)}>Cancelar cambio de cuenta</button>
          </div>
        )}
      </section>

      <div className="barra-guardar">
        <div className="contenedor angosto" style={{ padding: 0 }}>
          <div style={{ minWidth: 0 }}>
            {error ? <p className="error" role="alert" style={{ margin: 0 }}>{error}</p>
              : ok ? <span className="ok-msg" role="status">✓ Cambios guardados</span>
              : <span className="gris">{sucio ? "Tienes cambios sin guardar" : "Todo guardado"}</span>}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="btn btn-secundario btn-chico" href={`/c/${inicial.slug}`} target="_blank" rel="noopener">Ver mi página</a>
            <button type="button" className="btn btn-oscuro btn-chico" disabled={guardando || !sucio} onClick={guardar}>{guardando ? "Guardando…" : "Guardar cambios"}</button>
          </div>
        </div>
      </div>
    </>
  );
}

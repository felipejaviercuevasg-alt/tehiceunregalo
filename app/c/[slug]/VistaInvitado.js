"use client";
import { useState, useRef, useEffect } from "react";
import { estiloPortada, posValida } from "@/lib/temas";
import { enlacesLugar, horaBonita } from "@/lib/lugar";
import { REDES } from "@/lib/redes";
import IconoRed from "./IconoRed";

const pesos = (n) => "$" + Math.round(n || 0).toLocaleString("es-CL");
import { OCASIONES, ocasion as datosOcasion } from "@/lib/ocasiones";
const RAPIDOS_PCT = [5, 10, 25, 50, 100];
const RAPIDOS_MONTO = [5000, 10000, 20000, 50000];

function IconoRegalo() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18" /><path d="M12 8c-2-4-6-4-6-1s6 1 6 1zM12 8c2-4 6-4 6-1s-6 1-6 1z" /></svg>;
}

function fechaCorta(f) {
  const t = new Date(f + "T12:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "short" }).replace(".", "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Cuenta regresiva hasta la celebración (hora de Chile). Se dibuja solo en el navegador.
function CuentaRegresiva({ fecha, hora }) {
  const [ahora, setAhora] = useState(null);
  useEffect(() => {
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  if (!fecha || ahora === null) return null;
  const inicio = new Date(`${fecha}T${hora || "00:00"}:00-03:00`).getTime();
  const finDia = new Date(`${fecha}T23:59:59-03:00`).getTime();
  if (ahora > finDia) return null;
  if (ahora >= inicio) return <p className="cel-hoy">¡Es hoy!</p>;
  const m = Math.floor((inicio - ahora) / 60000);
  const partes = [[Math.floor(m / 1440), "días"], [Math.floor((m % 1440) / 60), "horas"], [m % 60, "min"]];
  return (
    <div className="cel-cuenta" aria-label={`Faltan ${partes[0][0]} días, ${partes[1][0]} horas y ${partes[2][0]} minutos`}>
      {partes.map(([n, u], i) => (
        <div key={u} className="cel-cuenta-item">
          {i > 0 && <span className="cel-punto" aria-hidden="true">·</span>}
          <div><strong>{String(n).padStart(i ? 2 : 1, "0")}</strong><span>{u}</span></div>
        </div>
      ))}
    </div>
  );
}

function fechaBonita(f) {
  if (!f) return "";
  return new Date(f + "T12:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function VistaInvitado({ cel, titulo, demo = false, esDueno = false }) {
  const [pestana, setPestana] = useState(cel.regalos.length ? "regalos" : "deseos");
  const [actual, setActual] = useState(null); // {tipo, item}
  const [pct, setPct] = useState(10);
  const [monto, setMonto] = useState(10000);
  const [otro, setOtro] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const dlg = useRef(null);

  const cerrada = cel.estado !== "activa";

  function maxPct(r) {
    const rest = r.meta - r.recaudado;
    return Math.max(1, Math.ceil((rest / r.meta) * 100));
  }
  function montoRegalo(r, p) {
    const rest = r.meta - r.recaudado;
    return p >= maxPct(r) ? rest : Math.round((r.meta * p) / 100);
  }
  const montoActual = () => actual?.tipo === "regalo" ? montoRegalo(actual.item, pct) : (Number(otro) || monto);

  function abrir(tipo, item) {
    setActual({ tipo, item }); setError("");
    if (tipo === "regalo") setPct(Math.min(10, maxPct(item)));
    else { setMonto(10000); setOtro(""); }
    dlg.current?.showModal();
  }

  async function pagar(e) {
    e.preventDefault();
    if (!nombre.trim()) return setError("Escribe tu nombre.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError("Escribe un correo válido.");
    const m = montoActual();
    if (m < 1000) return setError("El mínimo es $1.000.");
    if (demo) return setError("Esta es una celebración de ejemplo. Crea la tuya para recibir regalos de verdad.");
    setEnviando(true); setError("");
    try {
      const res = await fetch("/api/aportes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: cel.slug, nombre: nombre.trim(), email: email.trim(), mensaje: mensaje.trim(),
          ...(actual.tipo === "regalo" ? { regaloId: actual.item.id, porcentaje: pct } : { deseoId: actual.item.id, monto: m }),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "No pudimos iniciar el pago.");
      window.location.href = json.url;
    } catch (err) {
      setError(err.message); setEnviando(false);
    }
  }

  const mensajes = cel.aportes.filter((a) => a.mensaje);
  const nombreDe = (a) => cel.regalos.find((r) => r.id === a.regalo_id)?.nombre || cel.deseos.find((d) => d.id === a.deseo_id)?.titulo || "";

  return (
    <main className="cel">
      {esDueno && (
        <div className="barra-dueno">
          <div className="contenedor"><span>Así ven tu celebración tus invitados.</span><a href={`/editar/${cel.slug}`}>Editar y personalizar →</a></div>
        </div>
      )}

      <section className="cel-hero" style={estiloPortada(cel.tema, "")}>
        <div className={"cel-hero-in" + (cel.portada ? "" : " sin-foto")}>
          {cel.portada && <div className="cel-arco" role="img" aria-label={`Foto de ${cel.nombre}`} style={{ backgroundImage: `url("${cel.portada}")`, backgroundPosition: posValida(cel.portada_pos) }} />}
          <div className="cel-texto">
            <p className="cel-sup">{demo ? "Ejemplo · " : ""}{OCASIONES[cel.ocasion]}{cel.ocasion === "cumpleanos" && cel.edad ? ` · ${cel.edad} años` : ""}</p>
            <h1 className="cel-titulo">{datosOcasion(cel.ocasion).titulo} <em>{cel.nombre}</em></h1>
            {cel.mensaje && <p className="cel-msj">{cel.mensaje}</p>}
            {(() => {
              const l = enlacesLugar(cel, titulo);
              const datos = [
                cel.fecha && ["Cuándo", fechaCorta(cel.fecha)],
                cel.hora && ["Hora", horaBonita(cel.hora)],
                (cel.lugar || cel.direccion) && ["Dónde", cel.lugar || cel.direccion],
              ].filter(Boolean);
              return (
                <>
                  {datos.length > 0 && (
                    <div className="cel-datos" style={{ gridTemplateColumns: `repeat(${datos.length}, minmax(0, 1fr))` }}>
                      {datos.map(([k, v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}
                    </div>
                  )}
                  {cel.lugar && cel.direccion && <p className="cel-dir">{cel.direccion}</p>}
                  <div className="cel-fila">
                    <CuentaRegresiva fecha={cel.fecha} hora={cel.hora} />
                    <div className="cel-chips">
                      {l.mapa && <a className="chip-link" href={l.mapa} target="_blank" rel="noopener noreferrer">Cómo llegar</a>}
                      {l.waze && <a className="chip-link" href={l.waze} target="_blank" rel="noopener noreferrer">Waze</a>}
                      {l.calendario && !demo && <a className="chip-link" href={l.calendario} target="_blank" rel="noopener noreferrer">Agregar al calendario</a>}
                    </div>
                  </div>
                </>
              );
            })()}
            {REDES.some((r) => cel.redes?.[r.id]) && (
              <div className="redes" aria-label={`Redes sociales de ${cel.nombre}`}>
                {REDES.filter((r) => cel.redes?.[r.id]).map((r) => (
                  <a key={r.id} className="red" href={cel.redes[r.id]} target="_blank" rel="noopener noreferrer nofollow" aria-label={`${r.nombre} de ${cel.nombre}`} title={r.nombre}><IconoRed red={r.id} /></a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="cel-franja-wrap">
        <div className="cel-franja">
          <div className="cel-totales">
            <div><strong>{pesos(cel.total)}</strong><span>regalado hasta ahora</span></div>
            <div><strong>{cel.personas}</strong><span>{cel.personas === 1 ? "persona ha regalado" : "personas han regalado"}</span></div>
          </div>
          {cel.regalos.length > 0 && cel.deseos.length > 0 && (
            <div className="cel-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={pestana === "regalos"} onClick={() => setPestana("regalos")}>Regalos ({cel.regalos.length})</button>
              <button type="button" role="tab" aria-selected={pestana === "deseos"} onClick={() => setPestana("deseos")}>Buenos deseos ({cel.deseos.length})</button>
            </div>
          )}
        </div>
      </div>

      <div className="cel-cuerpo">
        {cerrada && <p className="aviso" style={{ marginBottom: 28 }}>Esta celebración ya cerró y no recibe más regalos. Gracias a todos los que participaron.</p>}

        {pestana === "regalos" && (
          <div role="tabpanel">
            <div className="cel-cab"><h2>Regalos soñados</h2><p>Aporta desde el 1% hasta el 100% de cada regalo.</p></div>
            <div className="cel-regalos">
              {cel.regalos.map((r) => {
                const p = Math.min(100, Math.round((r.recaudado / r.meta) * 100));
                return (
                  <article className="cel-regalo" key={r.id}>
                    <div className={"cel-regalo-foto" + (r.foto ? "" : " patron")}>{r.foto && <img src={r.foto} alt={r.nombre} />}</div>
                    <div className="cel-regalo-cuerpo">
                      <div>
                        <h3>{r.nombre}</h3>
                        {r.descripcion && <p className="gris">{r.descripcion}</p>}
                        {r.link && <a className="cel-link" href={r.link} target="_blank" rel="noopener noreferrer nofollow">Ver el producto</a>}
                      </div>
                      <div>
                        <div className="cel-barra" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance de ${r.nombre}`}><div style={{ width: p + "%" }} /></div>
                        <div className="cel-meta"><span><strong>{pesos(r.recaudado)}</strong> de {pesos(r.meta)}</span><span>{p}%</span></div>
                      </div>
                      {r.recaudado >= r.meta ? (
                        <span className="cel-cumplida"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>Meta cumplida</span>
                      ) : !cerrada && <button type="button" className="cel-btn" onClick={() => abrir("regalo", r)}>Regalar un porcentaje</button>}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {pestana === "deseos" && (
          <div role="tabpanel">
            <div className="cel-cab"><h2>Buenos deseos</h2><p>Elige un deseo y regálalo con el monto que quieras.</p></div>
            <div className="cel-deseos">
              {cel.deseos.map((d) => (
                <article className="cel-deseo" key={d.id}>
                  <h3>“{d.titulo}”</h3>
                  {d.descripcion && <p className="gris">{d.descripcion}</p>}
                  {d.veces > 0 && <p className="cel-veces">{d.veces === 1 ? "1 persona ya lo regaló" : `${d.veces} personas ya lo regalaron`}</p>}
                  {!cerrada && <button type="button" className="cel-btn claro" onClick={() => abrir("deseo", d)}>Regalar este deseo</button>}
                </article>
              ))}
            </div>
          </div>
        )}

        {mensajes.length > 0 && (
          <section className="cel-mensajes">
            <div className="cel-cab"><h2>Mensajes para {cel.nombre}</h2></div>
            <div className="cel-muro">
              {mensajes.map((m, i) => (
                <figure className={"cel-nota" + (i % 3 === 1 ? " oscura" : "")} key={i}>
                  <blockquote>“{m.mensaje}”</blockquote>
                  <figcaption><strong>{m.nombre}</strong>{nombreDe(m) ? ` · regaló ${nombreDe(m)}` : ""}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <p className="cel-seguro">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          Pago seguro con Mercado Pago. El dinero llega a la cuenta de {cel.nombre}.
        </p>
      </div>

      <dialog ref={dlg} aria-labelledby="mTitulo" onClose={() => setEnviando(false)}>
        {actual && (
          <form onSubmit={pagar}>
            <div className="modal-cuerpo">
              <span className="etiqueta">{actual.tipo === "regalo" ? "Regalo con meta" : "Buen deseo"}</span>
              <h2 id="mTitulo" style={{ fontSize: "1.5rem", margin: "8px 0 16px" }}>{actual.tipo === "regalo" ? actual.item.nombre : `“${actual.item.titulo}”`}</h2>
              {actual.tipo === "regalo" ? (
                <div>
                  <label htmlFor="pct">¿Qué porcentaje quieres regalar?</label>
                  <div className="monto-grande">{pesos(montoActual())}</div>
                  <p className="gris" style={{ fontSize: ".92rem" }}>{pct}% de la meta de {pesos(actual.item.meta)}</p>
                  <input type="range" id="pct" min={1} max={maxPct(actual.item)} value={pct} onChange={(e) => setPct(+e.target.value)} />
                  <div className="rapidos">
                    {[...new Set([...RAPIDOS_PCT.filter((p) => p < maxPct(actual.item)), maxPct(actual.item)])].map((p) => (
                      <button type="button" key={p} className="rapido" aria-pressed={pct === p} onClick={() => setPct(p)}>
                        {p === maxPct(actual.item) && p < 100 ? `Completar (${p}%)` : `${p}%`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="monto">¿Con cuánto quieres regalar este deseo?</label>
                  <div className="rapidos" style={{ marginBottom: 12 }}>
                    {RAPIDOS_MONTO.map((m) => <button type="button" key={m} className="rapido" aria-pressed={!otro && monto === m} onClick={() => { setMonto(m); setOtro(""); }}>{pesos(m)}</button>)}
                  </div>
                  <div className="prefijo"><span>$</span><input type="number" id="monto" min={1000} step={500} placeholder="Otro monto" value={otro} onChange={(e) => setOtro(e.target.value)} /></div>
                </div>
              )}
              <div style={{ marginTop: 20 }} className="campo"><label htmlFor="deNombre">Tu nombre</label><input type="text" id="deNombre" maxLength={60} required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Tío Jorge" /></div>
              <div className="campo"><label htmlFor="deEmail">Tu correo</label><input type="email" id="deEmail" maxLength={120} required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Para enviarte el comprobante" /><p className="ayuda">No se muestra en la página.</p></div>
              <div className="campo"><label htmlFor="deMsj">Mensaje <span className="gris" style={{ fontWeight: 400 }}>(opcional)</span></label><textarea id="deMsj" maxLength={280} value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Unas palabras para su día" /></div>
              <p className="aviso">Pagarás de forma segura en <strong>Mercado Pago</strong>. Tu nombre y mensaje serán visibles en esta página; el monto exacto solo lo ve el festejado.</p>
              {error && <p className="error" role="alert">{error}</p>}
            </div>
            <div className="modal-pie">
              <button type="button" className="btn btn-secundario" onClick={() => dlg.current?.close()}>Cancelar</button>
              <button className="btn btn-primario" disabled={enviando}>{enviando ? "Abriendo Mercado Pago…" : `Pagar ${pesos(montoActual())} con Mercado Pago`}</button>
            </div>
          </form>
        )}
      </dialog>
    </main>
  );
}

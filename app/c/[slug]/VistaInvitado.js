"use client";
import { useState, useRef } from "react";
import { estiloPortada } from "@/lib/temas";
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
    <main>
      {esDueno && (
        <div className="barra-dueno">
          <div className="contenedor"><span>Así ven tu celebración tus invitados.</span><a href={`/editar/${cel.slug}`}>Editar y personalizar →</a></div>
        </div>
      )}
      <section className={"portada" + (cel.portada ? " con-foto" : "")} style={estiloPortada(cel.tema, cel.portada, cel.portada_pos)}>
        <div className="contenedor">
          <span className="etiqueta">{demo ? "Ejemplo · " : ""}{OCASIONES[cel.ocasion]}</span>
          <h1>{titulo}</h1>
          <p className="fecha">{fechaBonita(cel.fecha)}{cel.hora ? ` · ${horaBonita(cel.hora)}` : ""}</p>
          {(() => {
            const l = enlacesLugar(cel, titulo);
            return (
              <div className="donde">
                {l.donde && <p className="donde-txt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>{l.donde}</p>}
                <div className="donde-btns">
                  {l.mapa && <a className="chip-link" href={l.mapa} target="_blank" rel="noopener noreferrer">Cómo llegar · Google Maps</a>}
                  {l.waze && <a className="chip-link" href={l.waze} target="_blank" rel="noopener noreferrer">Waze</a>}
                  {l.calendario && !demo && <a className="chip-link" href={l.calendario} target="_blank" rel="noopener noreferrer">Agregar a mi calendario</a>}
                </div>
              </div>
            );
          })()}
          {REDES.some((r) => cel.redes?.[r.id]) && (
            <div className="redes" aria-label={`Redes sociales de ${cel.nombre}`}>
              {REDES.filter((r) => cel.redes?.[r.id]).map((r) => (
                <a key={r.id} className="red" href={cel.redes[r.id]} target="_blank" rel="noopener noreferrer nofollow" aria-label={`${r.nombre} de ${cel.nombre}`} title={r.nombre}><IconoRed red={r.id} /></a>
              ))}
            </div>
          )}
          {cel.mensaje && <p className="mensaje">“{cel.mensaje}”</p>}
          <div className="resumen">
            <div><strong>{pesos(cel.total)}</strong><span>regalado hasta ahora</span></div>
            <div><strong>{cel.personas}</strong><span>{cel.personas === 1 ? "persona ha regalado" : "personas han regalado"}</span></div>
          </div>
        </div>
      </section>
      <div className="contenedor" style={{ paddingBottom: 88 }}>
        <div className="tabs" role="tablist">
          {cel.regalos.length > 0 && <button className="tab" role="tab" aria-selected={pestana === "regalos"} onClick={() => setPestana("regalos")}>Regalos ({cel.regalos.length})</button>}
          {cel.deseos.length > 0 && <button className="tab" role="tab" aria-selected={pestana === "deseos"} onClick={() => setPestana("deseos")}>Buenos deseos ({cel.deseos.length})</button>}
        </div>
        {cerrada && <p className="aviso" style={{ marginBottom: 22 }}>Esta celebración ya cerró y no recibe más regalos. ¡Gracias a todos los que participaron!</p>}

        {pestana === "regalos" && (
          <div role="tabpanel">
            <p className="gris" style={{ marginBottom: 22 }}>Elige un regalo y aporta desde el 1% hasta el 100% de la meta.</p>
            <div className="grid-regalos">
              {cel.regalos.map((r) => {
                const p = Math.min(100, Math.round((r.recaudado / r.meta) * 100));
                return (
                  <article className="regalo" key={r.id}>
                    <div className="foto">{r.foto ? <img src={r.foto} alt={r.nombre} /> : <IconoRegalo />}</div>
                    <div className="cuerpo">
                      <h3>{r.nombre}</h3>
                      {r.descripcion && <p className="gris" style={{ fontSize: ".93rem" }}>{r.descripcion}</p>}
                      {r.link && <a href={r.link} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: ".9rem" }}>Ver el producto</a>}
                      <div>
                        <div className="barra-progreso" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance de ${r.nombre}`}><div style={{ width: p + "%" }} /></div>
                        <div className="meta-linea"><span><strong>{pesos(r.recaudado)}</strong> de {pesos(r.meta)}</span><span><strong>{p}%</strong></span></div>
                      </div>
                      {r.recaudado >= r.meta ? <span className="completo">¡Meta cumplida!</span>
                        : !cerrada && <button className="btn btn-oscuro" onClick={() => abrir("regalo", r)}>Regalar un %</button>}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {pestana === "deseos" && (
          <div role="tabpanel">
            <p className="gris" style={{ marginBottom: 22 }}>Elige un buen deseo y regálalo con el monto que quieras.</p>
            <div className="deseos">
              {cel.deseos.map((d) => (
                <article className="deseo" key={d.id}>
                  <h3>“{d.titulo}”</h3>
                  {d.descripcion && <p className="gris">{d.descripcion}</p>}
                  {d.veces > 0 && <p className="cuantos">{d.veces === 1 ? "1 persona ya lo regaló" : `${d.veces} personas ya lo regalaron`}</p>}
                  {!cerrada && <button className="btn btn-primario btn-chico" onClick={() => abrir("deseo", d)}>Regalar este deseo</button>}
                </article>
              ))}
            </div>
          </div>
        )}

        {mensajes.length > 0 && (
          <div className="mensajes">
            <h2 style={{ fontSize: "1.6rem", marginBottom: 18 }}>Mensajes</h2>
            {mensajes.map((m, i) => <div className="msj" key={i}><strong>{m.nombre}</strong>“{m.mensaje}”<br /><span>Regaló: {nombreDe(m)}</span></div>)}
          </div>
        )}
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

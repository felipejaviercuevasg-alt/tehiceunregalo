import Link from "next/link";

export default function Inicio() {
  return (
    <main>
      <section className="hero">
        <div className="contenedor hero-grid">
          <div>
            <span className="etiqueta">Cumpleaños · Matrimonios · Baby showers</span>
            <h1 style={{ marginTop: 14 }}>Recibe el regalo que <span>de verdad quieres</span>.</h1>
            <p className="bajada">Arma tu lista de regalos soñados con una meta, comparte el enlace y deja que cada invitado aporte desde el 1% hasta el 100%. O pide buenos deseos. Nada de regalos repetidos ni cajas que no vas a usar.</p>
            <div className="acciones">
              <Link className="btn btn-primario" href="/crear">Crear mi celebración</Link>
              <Link className="btn btn-secundario" href="/ejemplo">Ver un ejemplo</Link>
            </div>
          </div>
          <div className="mock" aria-hidden="true">
            <div className="tarjeta t1">
              <div className="mock-cab">
                <div className="mock-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15a8 8 0 0 1 16 0v2H4z" /><path d="M12 7v4" /><path d="M4 17h16v2H4z" /></svg></div>
                <div><h3>Casco de moto</h3><span className="gris" style={{ fontSize: ".9rem" }}>Meta $200.000</span></div>
              </div>
              <div className="barra-progreso"><div style={{ width: "35%" }} /></div>
              <div className="meta-linea"><span><strong>$70.000</strong> reunidos</span><span>35%</span></div>
              <div className="burbuja">Tío Jorge aportó el 25% · “¡Para que andes segura!”</div>
            </div>
            <div className="tarjeta t2">
              <span className="etiqueta" style={{ fontSize: ".7rem" }}>Buen deseo</span>
              <p className="deseo-mini" style={{ marginTop: 6 }}>“Te regalo kilómetros de libertad”<small>Para llenar el estanque y cambiar de paisaje.</small></p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="contenedor">
          <div className="cabecera">
            <span className="etiqueta">Dos formas de regalar</span>
            <h2 style={{ marginTop: 12 }}>Tú eliges qué pedir</h2>
            <p>Puedes usar una, la otra o las dos en la misma celebración.</p>
          </div>
          <div className="dos">
            <div className="forma a">
              <span className="etiqueta">Regalos con meta</span>
              <h3>Lo que tú quieres, entre todos</h3>
              <p>Agrega los regalos que deseas con una foto, un link o una descripción, y ponle un precio como meta. Tus invitados aportan el porcentaje que quieran hasta completarlo.</p>
              <ul><li>Casco de moto · meta $200.000</li><li>Chaqueta · meta $50.000</li><li>Agrega todos los que quieras</li></ul>
            </div>
            <div className="forma b">
              <span className="etiqueta">Buenos deseos</span>
              <h3>“Te regalo…”</h3>
              <p>Elige deseos sugeridos según la ocasión y tu edad, edítalos o escribe los tuyos. Cada invitado elige un deseo y te lo regala con el monto que quiera y un mensaje.</p>
              <ul><li>“Te regalo una cena que no tengas que cocinar”</li><li>“Te regalo un pedacito del viaje que sueñas”</li></ul>
            </div>
          </div>
        </div>
      </section>

      <section className="roles">
        <div className="contenedor rol-grid">
          <div className="rol">
            <span className="etiqueta">Si eres el festejado o festejada</span>
            <h3>Crea tu celebración en minutos</h3>
            {[
              ["Cuéntanos la ocasión", "Cumpleaños, matrimonio o baby shower, y la fecha."],
              ["Agrega tus regalos soñados", "Nombre, foto o link, y el monto de la meta."],
              ["Elige tus buenos deseos", "Te sugerimos los ideales para tu ocasión. Puedes editarlos o crear los tuyos."],
              ["Comparte el enlace", "Por WhatsApp, Instagram o donde quieras, y mira cómo avanza tu meta."],
              ["Recibe tu plata cada semana", "Transferimos lo reunido cada 7 días, y todo a más tardar 24 horas después de tu celebración."],
            ].map(([t, d], i) => (
              <div className="paso" key={t}><div className="n">{i + 1}</div><div><strong>{t}</strong><p>{d}</p></div></div>
            ))}
            <Link className="btn btn-oscuro" href="/crear">Crear mi celebración</Link>
          </div>
          <div className="rol inv">
            <span className="etiqueta">Si eres invitado o invitada</span>
            <h3>Regala justo lo que quiere</h3>
            {[
              ["Abre el enlace que te enviaron", "Verás sus regalos, cuánto llevan y sus buenos deseos."],
              ["Elige cuánto aportar", "Desde el 1% hasta el 100% de un regalo, o regala un buen deseo."],
              ["Déjale un mensaje", "Tu nombre y unas palabras que va a leer en su día."],
              ["Paga seguro con Mercado Pago", "Sin envíos, sin cambios, sin regalos repetidos."],
            ].map(([t, d], i) => (
              <div className="paso" key={t}><div className="n">{i + 1}</div><div><strong>{t}</strong><p>{d}</p></div></div>
            ))}
            <Link className="btn btn-primario" href="/ejemplo">Ver una celebración de ejemplo</Link>
          </div>
        </div>
      </section>

      <section>
        <div className="contenedor">
          <div className="cabecera">
            <span className="etiqueta">Para cada celebración</span>
            <h2 style={{ marginTop: 12 }}>Deseos pensados para tu momento</h2>
            <p>Los buenos deseos sugeridos cambian según la ocasión y, en los cumpleaños, según la edad.</p>
          </div>
          <div className="ocas">
            <div className="tarjeta"><h3>Cumpleaños</h3><p className="gris">Deseos distintos para 18–25, 26–39, 40–56 y 57 años o más.</p><p className="cita">“Te regalo un día sin obligaciones”</p></div>
            <div className="tarjeta"><h3>Matrimonio</h3><p className="gris">Para la luna de miel, el hogar soñado o las primeras discusiones.</p><p className="cita">“Te regalo mil citas después del sí”</p></div>
            <div className="tarjeta"><h3>Baby shower</h3><p className="gris">Para pañales, el primer outfit y las desveladas de mamá.</p><p className="cita">“Te regalo tu primer kit de bañito”</p></div>
          </div>
        </div>
      </section>

      <section className="faq">
        <div className="contenedor angosto">
          <div className="cabecera">
            <span className="etiqueta">Preguntas frecuentes</span>
            <h2 style={{ marginTop: 12 }}>Lo que más nos preguntan</h2>
          </div>
          <details><summary>¿Cómo recibe el dinero el festejado?</summary><p>Por transferencia a la cuenta bancaria que indica al crear su celebración. Transferimos lo reunido cada 7 días, y el saldo final a más tardar 24 horas después de la fecha de la celebración.</p></details>
          <details><summary>¿Qué pasa si un regalo no llega al 100%?</summary><p>El festejado recibe igual todo lo que se reunió. La meta es una guía para los invitados, no un requisito.</p></details>
          <details><summary>¿Cómo pago mi aporte?</summary><p>Con Mercado Pago, de forma segura: con tarjeta de crédito, débito o tu cuenta de Mercado Pago. No necesitas crear una cuenta en Te hice un regalo.</p></details>
          <details><summary>¿Puedo aportar más de una vez o a varios regalos?</summary><p>Sí. Puedes aportar a todos los regalos y deseos que quieras.</p></details>
          <details><summary>¿Necesito una cuenta para crear mi celebración?</summary><p>Solo tu correo. Te enviamos un enlace para entrar, sin contraseñas.</p></details>
        </div>
      </section>

      <section className="cta">
        <div className="contenedor">
          <div className="cta-caja">
            <div><h2>¿Se viene tu celebración?</h2><p>Crea tu lista y compártela hoy mismo.</p></div>
            <Link className="btn btn-oscuro" href="/crear">Crear mi celebración</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

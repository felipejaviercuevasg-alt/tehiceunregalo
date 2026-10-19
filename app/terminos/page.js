export const metadata = { title: "Términos y condiciones · Te hice un regalo" };

// BORRADOR: revisar con un abogado antes de operar con dinero real.
export default function Terminos() {
  return (
    <main className="pagina">
      <div className="contenedor angosto">
        <span className="etiqueta">Legal</span>
        <h1 style={{ fontSize: "clamp(1.9rem,4vw,2.6rem)", margin: "10px 0 24px" }}>Términos y condiciones</h1>
        <div className="tarjeta" style={{ lineHeight: 1.75 }}>
          <p className="aviso" style={{ marginBottom: 20 }}>Versión preliminar. Última actualización: [FECHA].</p>
          <h3>1. Qué es Te hice un regalo</h3>
          <p>tehiceunregalo.cl es una plataforma operada por [RAZÓN SOCIAL], RUT [RUT], con domicilio en [DOMICILIO], que permite a una persona (el “festejado”) publicar una lista de regalos deseados y buenos deseos, para que sus invitados aporten dinero. La plataforma no vende ni despacha productos.</p>
          <h3 style={{ marginTop: 20 }}>2. Pagos</h3>
          <p>Los aportes se pagan a través de Mercado Pago. Te hice un regalo no almacena datos de tarjetas. Los aportes son voluntarios y no reembolsables, salvo error del sistema o lo que exija la ley.</p>
          <h3 style={{ marginTop: 20 }}>3. Entrega del dinero al festejado</h3>
          <p>Lo reunido se transfiere a la cuenta bancaria indicada por el festejado, cada 7 días desde el primer aporte recibido, y el saldo final a más tardar 24 horas después del día de la celebración, descontando una comisión de servicio de [COMISIÓN]%. El festejado recibe todo lo reunido aunque un regalo no alcance su meta. El festejado es responsable de que los datos bancarios sean correctos.</p>
          <h3 style={{ marginTop: 20 }}>4. Uso del dinero</h3>
          <p>Los regalos y metas son referenciales. El festejado puede usar el dinero libremente; Te hice un regalo no garantiza la compra de ningún producto.</p>
          <h3 style={{ marginTop: 20 }}>5. Datos personales</h3>
          <p>Usamos el correo y los datos bancarios del festejado solo para operar el servicio y hacer la transferencia. Los datos bancarios se guardan cifrados. El nombre y mensaje de cada invitado se muestran en la página de la celebración. Puedes pedir la eliminación de tus datos escribiendo a [CORREO DE CONTACTO].</p>
          <h3 style={{ marginTop: 20 }}>6. Contenido prohibido</h3>
          <p>No se permite publicar contenido ilegal, ofensivo o engañoso, ni usar la plataforma para fines distintos a celebraciones personales. Podemos cerrar celebraciones que incumplan estas reglas.</p>
          <h3 style={{ marginTop: 20 }}>7. Contacto</h3>
          <p>[CORREO DE CONTACTO]</p>
        </div>
      </div>
    </main>
  );
}

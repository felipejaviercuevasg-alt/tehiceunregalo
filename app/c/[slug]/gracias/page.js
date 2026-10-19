import Link from "next/link";
import { conciliarPago } from "@/lib/datos";
import Confeti from "./Confeti";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gracias · Te hice un regalo", robots: { index: false } };

export default async function Gracias({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const paymentId = sp.payment_id || sp.collection_id;
  let estado = null;
  // Confirmamos con Mercado Pago por si el aviso automático aún no llega.
  if (paymentId && /^\d+$/.test(String(paymentId))) {
    try { estado = await conciliarPago(String(paymentId)); } catch {}
  }
  if (!estado) estado = sp.status === "approved" ? "aprobado" : sp.status === "pending" || sp.status === "in_process" ? "pendiente" : "rechazado";

  const textos = {
    aprobado: ["Gracias por tu regalo", "Tu pago fue aprobado y ya aparece en la celebración."],
    pendiente: ["Tu pago está en proceso", "Mercado Pago lo está confirmando. Aparecerá en la celebración apenas se apruebe."],
    rechazado: ["El pago no se completó", "No se realizó ningún cargo. Puedes intentarlo de nuevo con otro medio de pago."],
  };
  const [t, d] = textos[estado] || textos.rechazado;
  return (
    <main className="pagina">
      {estado === "aprobado" && <Confeti />}
      <div className="contenedor" style={{ maxWidth: 620 }}>
        <div className="tarjeta" style={{ textAlign: "center", padding: "48px 28px" }}>
          <img src="/thur-isotipo-color.svg" alt="" style={{ width: 100, margin: "0 auto 20px" }} />
          <h1 style={{ fontSize: "1.9rem" }}>{t}</h1>
          <p className="gris" style={{ margin: "12px 0 26px" }}>{d}</p>
          <Link className="btn btn-oscuro" href={`/c/${encodeURIComponent(slug)}`}>Volver a la celebración</Link>
        </div>
      </div>
    </main>
  );
}

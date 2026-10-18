import Link from "next/link";

export default function NoEncontrado() {
  return (
    <main className="pagina">
      <div className="contenedor vacio">
        <img src="/thur-isotipo-color.svg" alt="" style={{ width: 100, margin: "0 auto 20px" }} />
        <h1 style={{ fontSize: "2rem" }}>No encontramos esta página</h1>
        <p className="gris" style={{ margin: "12px 0 24px" }}>Si te enviaron un enlace a una celebración, revisa que esté completo.</p>
        <Link className="btn btn-primario" href="/">Ir al inicio</Link>
      </div>
    </main>
  );
}

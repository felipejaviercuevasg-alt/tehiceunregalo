import "./globals.css";
import Link from "next/link";
import { usuarioActual } from "@/lib/supabase";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tehiceunregalo.cl";

export const metadata = {
  metadataBase: new URL(SITE),
  title: "Te hice un regalo · Regala lo que de verdad quieren",
  description: "Crea tu lista de regalos soñados con una meta, comparte el enlace y deja que tus invitados aporten desde el 1% hasta el 100%. O pide buenos deseos.",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon-192.png", sizes: "192x192" }], apple: "/favicon-192.png" },
  openGraph: { title: "Te hice un regalo", description: "Tu lista de regalos soñados, financiada entre todos los que te quieren.", images: ["/og-image.png"], locale: "es_CL", type: "website" },
};
export const viewport = { themeColor: "#17324D" };

export default async function RootLayout({ children }) {
  let user = null;
  try { user = await usuarioActual(); } catch {}
  return (
    <html lang="es-CL">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header className="sitio">
          <div className="contenedor barra">
            <Link href="/" aria-label="Te hice un regalo, inicio"><img src="/thur-horizontal-color.svg" alt="Te hice un regalo" /></Link>
            <nav aria-label="Principal">
              {user ? (
                <>
                  <Link className="btn btn-secundario btn-chico" href="/mis-celebraciones">Mis celebraciones</Link>
                  <Link className="btn btn-primario btn-chico" href="/crear">Nueva celebración</Link>
                </>
              ) : (
                <>
                  <Link className="btn btn-secundario btn-chico" href="/entrar">Entrar</Link>
                  <Link className="btn btn-primario btn-chico" href="/crear">Soy el festejado</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        {children}
        <footer className="sitio">
          <div className="contenedor pie">
            <img src="/thur-horizontal-fondo-oscuro.svg" alt="Te hice un regalo" />
            <span>
              © {new Date().getFullYear()} tehiceunregalo.cl · <Link href="/terminos">Términos y condiciones</Link> · Hecho con cariño en Chile
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

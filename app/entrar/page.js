"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { browserClient } from "@/lib/supabase-browser";

function Formulario() {
  const params = useSearchParams();
  const siguiente = params.get("next") || "/mis-celebraciones";
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState("inicio"); // inicio | enviando | enviado | error
  const [error, setError] = useState("");

  async function enviar(e) {
    e.preventDefault();
    setEstado("enviando");
    const sb = browserClient();
    const destino = `${window.location.origin}/auth/callback?next=${encodeURIComponent(siguiente.startsWith("/") ? siguiente : "/")}`;
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: destino } });
    if (error) { setError("No pudimos enviar el correo. Revisa la dirección e inténtalo de nuevo en un minuto."); setEstado("error"); }
    else setEstado("enviado");
  }

  if (estado === "enviado") {
    return (
      <div className="tarjeta" style={{ textAlign: "center", padding: "44px 28px" }}>
        <img src="/thur-isotipo-color.svg" alt="" style={{ width: 90, margin: "0 auto 18px" }} />
        <h1 style={{ fontSize: "1.8rem" }}>Revisa tu correo</h1>
        <p className="gris" style={{ marginTop: 10 }}>Te enviamos un enlace a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo para entrar. Si no lo ves, revisa la carpeta de spam.</p>
      </div>
    );
  }
  return (
    <form className="tarjeta" onSubmit={enviar}>
      <span className="etiqueta">Soy el festejado</span>
      <h1 style={{ fontSize: "1.8rem", margin: "10px 0 8px" }}>Entra con tu correo</h1>
      <p className="gris" style={{ marginBottom: 22 }}>Te enviaremos un enlace para entrar, sin contraseñas. Con él podrás crear tus celebraciones y ver quién te ha regalado.</p>
      <div className="campo">
        <label htmlFor="email">Tu correo</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@correo.cl" />
      </div>
      <button className="btn btn-oscuro" disabled={estado === "enviando"}>{estado === "enviando" ? "Enviando…" : "Enviarme el enlace"}</button>
      {estado === "error" && <p className="error" role="alert">{error}</p>}
    </form>
  );
}

export default function Entrar() {
  return (
    <main className="pagina">
      <div className="contenedor" style={{ maxWidth: 560 }}>
        <Suspense><Formulario /></Suspense>
      </div>
    </main>
  );
}

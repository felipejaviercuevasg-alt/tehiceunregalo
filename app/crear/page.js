import { redirect } from "next/navigation";
import { usuarioActual } from "@/lib/supabase";
import Asistente from "./Asistente";

export const metadata = { title: "Crea tu celebración · Te hice un regalo" };

export default async function Crear() {
  const user = await usuarioActual();
  if (!user) redirect("/entrar?next=/crear");
  return (
    <main className="pagina">
      <div className="contenedor angosto">
        <span className="etiqueta">Soy el festejado</span>
        <h1 style={{ fontSize: "clamp(1.9rem,4vw,2.8rem)", marginTop: 10 }}>Crea tu celebración</h1>
        <Asistente email={user.email} />
      </div>
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";

const COLORES = ["#E9A93B", "#17324D", "#E07A4F", "#F2C14E", "#FBF6EC"];

// Lluvia de confeti breve. No se muestra si la persona prefiere menos movimiento.
export default function Confeti() {
  const [piezas, setPiezas] = useState([]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPiezas(Array.from({ length: 90 }, (_, i) => ({
      left: Math.random() * 100, delay: Math.random() * 0.8, dur: 2.4 + Math.random() * 1.8,
      color: COLORES[i % COLORES.length], rot: Math.random() * 360,
    })));
    const t = setTimeout(() => setPiezas([]), 5000);
    return () => clearTimeout(t);
  }, []);
  if (!piezas.length) return null;
  return (
    <div className="confeti" aria-hidden="true">
      {piezas.map((p, i) => (
        <i key={i} style={{ left: p.left + "%", background: p.color, animationDelay: p.delay + "s", animationDuration: p.dur + "s", transform: `rotate(${p.rot}deg)` }} />
      ))}
    </div>
  );
}

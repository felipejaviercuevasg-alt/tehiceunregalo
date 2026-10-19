// Íconos simples de redes sociales (trazo, heredan el color del texto).
export default function IconoRed({ red }) {
  const p = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  switch (red) {
    case "instagram": return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg>;
    case "tiktok": return <svg {...p}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 2.6 2.3 4.3 5 4.5" /></svg>;
    case "facebook": return <svg {...p}><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V21" /><path d="M6 11h8" /></svg>;
    case "x": return <svg {...p}><path d="M4 4l16 16M20 4L4 20" /></svg>;
    case "youtube": return <svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" /></svg>;
    case "linkedin": return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></svg>;
    default: return null;
  }
}

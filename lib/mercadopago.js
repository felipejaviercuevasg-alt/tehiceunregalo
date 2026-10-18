// Integración con Mercado Pago Checkout Pro mediante su API REST.
const API = "https://api.mercadopago.com";

function headers(extra = {}) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN no configurado");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...extra };
}

export async function crearPreferencia({ aporteId, titulo, monto, slug }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const vuelta = `${site}/c/${slug}/gracias`;
  const res = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: headers({ "X-Idempotency-Key": aporteId }),
    body: JSON.stringify({
      items: [{ id: aporteId, title: titulo.slice(0, 250), quantity: 1, unit_price: monto, currency_id: "CLP" }],
      external_reference: aporteId,
      back_urls: { success: vuelta, failure: vuelta, pending: vuelta },
      auto_return: "approved",
      notification_url: `${site}/api/mp/webhook`,
      statement_descriptor: "TEHICEUNREGALO",
      payment_methods: { installments: 1 },
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Mercado Pago respondió ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.init_point;
}

export async function obtenerPago(id) {
  const res = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

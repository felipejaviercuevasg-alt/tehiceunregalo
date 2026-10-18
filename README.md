# Te hice un regalo · tehiceunregalo.cl

Lista de regalos colaborativa: el festejado publica regalos con meta y buenos deseos; los invitados aportan del 1% al 100% (o regalan un deseo) pagando con Mercado Pago. Lo reunido se transfiere a la cuenta bancaria del festejado.

**Tecnología:** Next.js (Vercel) · Supabase (base de datos + inicio de sesión por correo) · Mercado Pago Checkout Pro.

## Páginas
| Ruta | Qué es |
|---|---|
| `/` | Portada |
| `/ejemplo` | Celebración de ejemplo (no cobra) |
| `/entrar` | Inicio de sesión con enlace al correo |
| `/crear` | Asistente del festejado (requiere sesión) |
| `/c/[slug]` | Página que ven los invitados |
| `/c/[slug]/gracias` | Vuelta desde Mercado Pago |
| `/mis-celebraciones` | Panel del festejado |
| `/admin` | Panel de administración (solo correos en `ADMIN_EMAILS`) |
| `/api/mp/webhook` | Avisos de pago de Mercado Pago |

## Puesta en marcha
1. **Supabase → SQL Editor:** ejecutar `supabase/schema.sql`.
2. **Supabase → Authentication → URL Configuration:**
   - Site URL: `https://www.tehiceunregalo.cl`
   - Redirect URLs: `https://www.tehiceunregalo.cl/auth/callback`, `https://*.vercel.app/auth/callback`
3. **Vercel:** importar este repositorio y cargar las variables de `.env.example` (Settings → Environment Variables).
4. **Mercado Pago:** usar el Access Token de prueba (`TEST-…` o el de usuario de prueba) para probar, y el de producción (`APP_USR-…`) para cobrar de verdad.
5. **Dominio:** Vercel → Settings → Domains → agregar `www.tehiceunregalo.cl` y `tehiceunregalo.cl`, y copiar en NIC.cl los registros DNS que indique Vercel.

## Cómo funciona un pago
1. El invitado elige un % o un monto → `/api/aportes` valida en el servidor, guarda el aporte como *pendiente* y crea una preferencia en Mercado Pago.
2. El invitado paga en Mercado Pago.
3. Mercado Pago avisa a `/api/mp/webhook` (y el invitado vuelve a `/gracias`). En ambos casos el servidor **consulta el pago directamente a Mercado Pago** y solo lo marca *aprobado* si el estado es `approved` y el monto coincide.
4. Solo los aportes aprobados suman en las barras y totales.

## Transferencias
En `/admin` → "Por transferir" aparecen las celebraciones cuya fecha ya pasó, con lo reunido, la comisión (`COMISION_PCT`) y los datos bancarios (guardados cifrados con `ENCRYPTION_KEY`). Después de transferir, presionar **Marcar transferido**.

## Pendientes antes de operar con dinero real
- Completar los campos entre corchetes en `app/terminos/page.js` y revisarlos con un abogado.
- Definir plazo de transferencia y comisión.
- Revisar con contador el tratamiento tributario de la comisión y del dinero de terceros.
- Configurar un SMTP propio en Supabase (el correo incluido envía pocos mensajes por hora).

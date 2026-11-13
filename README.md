# Miguel Ángel Jamonería · demo

Réplica funcional de https://miguel-angel-jamoneria.vercel.app/ con el mismo diseño,
pero servida por Next.js 16 y preparada para el stack gratuito: Vercel Hobby, Neon
Postgres, Upstash Redis y OpenRouter (`:free`).

- **Demo:** https://miguel-angel-jamoneria-demo.vercel.app
- **Repo:** https://github.com/dnkash/Miguel-angel-jamoneria-demo

Cada push a `main` despliega automáticamente en Vercel.

## Local

```bash
pnpm install
cp .env.example .env.local   # solo OPENROUTER_API_KEY es imprescindible
pnpm dev                     # http://localhost:3000
```

Sin `DATABASE_URL` la web usa el catálogo estático (`src/data/catalog.ts`) y el
rate limit cae a memoria. El asistente necesita `OPENROUTER_API_KEY`.

## Base de datos (Neon, gratis)

```bash
pnpm db:push
```

Crea `categorias`, `productos`, `demo_suscriptores`, `demo_preguntas`, `demo_pedidos`,
`demo_pedido_lineas` y `demo_mensajes`. Es idempotente y no necesita `psql`.
La demo solo lee el catálogo compartido: sus pedidos, altas y preguntas van a tablas
`demo_*` para no mezclarse con la web en producción.

## API

| Ruta | Qué hace |
|---|---|
| `GET /api/catalogo` | Productos desde Neon o catálogo estático. Cache 5 min. |
| `POST /api/chat` | Asistente IA con catálogo, alérgenos y presupuesto. Rate limit 10/min. |
| `POST /api/suscribir` | Guarda emails del club del ibérico en Neon. |
| `GET /api/estado` | Nº de productos y preguntas para el footer. |
| `POST /api/pedidos` | Crea un pedido demo, valida stock y precios en servidor. |
| `GET /api/pedidos/[token]` | Seguimiento público por token. |
| `POST /api/admin/login` | Login demo del panel interno. |
| `PATCH /api/admin/pedidos/[id]` | Cambia estado, guarda nota y genera mensaje simulado. |
| `POST /api/admin/reset-demo` | Borra pedidos demo y restaura stock. |

## Pedidos y panel interno

- Checkout en `/checkout`: datos de contacto, envío o recogida, tarjeta de prueba
  (`4242 4242 4242 4242`) y pago simulado. No se cobra nada.
- Seguimiento en `/pedido/[token]` con timeline de estados.
- Panel en `/admin` con dos usuarios demo:
  - **`empleado` / `empleado123`**: prepara pedidos y añade notas.
  - **`encargado` / `encargado123`**: además puede cancelar pedidos y resetear la demo.
  Los empleados pueden entrar desde `/login` o desde el enlace **Acceso empleados**
  del pie de la tienda. Las claves se cambian con `EMPLEADO_PASSWORD` y
  `ENCARGADO_PASSWORD`.
- Cada cambio de estado, nota o reset queda registrado en `demo_auditoria` con
  usuario, rol, pedido y fecha. Se ve en el detalle del pedido y en la actividad
  reciente del resumen.
- Desde el panel: resumen, pedidos, filtros, detalle, cambio de estado, nota interna,
  hoja imprimible, bandeja de mensajes simulados y reset de la demo.
- **Avisos de pedido nuevo** en la cabecera (campana, contador y sonido), con polling
  cada 20 s y acceso directo al pedido.
- **Stock editable** desde `/admin/stock`, con aviso de stock bajo y registro en auditoría.
- **Exportación CSV** y **informe imprimible/PDF** de pedidos desde `/admin/pedidos`.
- **Gráfica de ventas de los últimos 7 días** en el resumen.
- **Etiqueta de envío con QR** en `/admin/pedidos/[id]/etiqueta`; el QR abre el
  seguimiento público del pedido.
- Los emails no se envían: se guardan en `demo_mensajes` para poder enseñar la bandeja.

## Carrito desde el asistente

Cuando el cliente confirma (`sí`, `vale`, `añádelo`, `lo quiero`…), el asistente no
responde con texto libre: `/api/chat` devuelve `items: [{ slug, cantidad }]` con la
última recomendación, el cliente los añade a la cesta y abre el drawer automáticamente.
Desde la cesta, **Tramitar pedido** lleva al checkout demo. Si la conversación incluye
un presupuesto, no se añade ningún producto que lo supere.

## Optimización free tier

- Catálogo cacheado con `s-maxage=300` + `stale-while-revalidate`: Neon solo se
  consulta una vez cada 5 minutos por región.
- Imágenes locales comprimidas y `Cache-Control: immutable` para `/assets/*`.
- Rate limit por IP en Upstash (o memoria en local) para no gastar cuota de OpenRouter.
- Modelo `baidu/ernie-5.5-flash-preview:free`: responde en ~2 s (los Nemotron free
  tardan 30-90 s y consumen tokens en razonamiento).
- Sin dependencias de UI: cero JS de framework en el cliente salvo Next y el
  `app.js` original (≈22 KB).

## Estructura

- `src/app/page.tsx` — landing completa (mismo HTML/estructura que la original).
- `src/app/site.css` — sistema visual original + checkout, seguimiento y panel.
- `public/assets/js/app.js` — interacción de la tienda (cesta, chat, filtros, precintos).
- `public/assets/img/` — imágenes originales.
- `src/data/catalog.ts` — 50 productos tipados y 4 categorías.
- `src/data/company.ts` — empresa, envío y estados ficticios de la demo.
- `src/app/checkout/page.tsx` — checkout demo.
- `src/app/pedido/[token]/page.tsx` — seguimiento público.
- `src/app/admin/` — panel interno, pedidos, mensajes y login.
- `src/app/login/page.tsx` — acceso de empleados desde la tienda.
- `src/db/schema.sql` — esquema + seed para Neon.
- `scripts/init-db.mjs` — crea tablas y siembra el catálogo sin `psql`.

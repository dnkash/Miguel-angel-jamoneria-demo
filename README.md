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
psql "$DATABASE_URL" -f src/db/schema.sql
```

Crea `categorias`, `productos` y las tablas propias de la demo
(`demo_suscriptores`, `demo_preguntas`). Es idempotente (`ON CONFLICT DO NOTHING`).
La demo solo lee el catálogo compartido: sus altas y preguntas van a tablas `demo_*`
para no mezclarse con la web en producción.

## API

| Ruta | Qué hace |
|---|---|
| `GET /api/catalogo` | Productos desde Neon o catálogo estático. Cache 5 min. |
| `POST /api/chat` | Asistente IA con catálogo, alérgenos y presupuesto. Rate limit 10/min. |
| `POST /api/suscribir` | Guarda emails del club del ibérico en Neon. |
| `GET /api/estado` | Nº de productos y preguntas para el footer. |

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
- `src/app/site.css` — sistema visual original copiado tal cual.
- `public/assets/js/app.js` — interacción original (cesta, chat, filtros, precintos).
- `public/assets/img/` — imágenes originales.
- `src/data/catalog.ts` — 50 productos tipados y 4 categorías.
- `src/db/schema.sql` — esquema + seed para Neon.

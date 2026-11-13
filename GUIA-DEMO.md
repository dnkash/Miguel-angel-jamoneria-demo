# Guía de uso y demo · Miguel Ángel Jamonería

Guía para probar la demo y exponerla el martes.

---

## 1. URLs y accesos

| Qué | Dónde |
|---|---|
| Tienda | https://miguel-angel-jamoneria-demo.vercel.app |
| Acceso empleados | https://miguel-angel-jamoneria-demo.vercel.app/login |
| Panel interno | https://miguel-angel-jamoneria-demo.vercel.app/admin |
| Local | http://localhost:3001 |
| Repo | https://github.com/dnkash/Miguel-angel-jamoneria-demo |

### Usuarios demo

| Usuario | Contraseña | Rol |
|---|---|---|
| `empleado` | `empleado123` | Prepara pedidos, cambia estados y añade notas |
| `encargado` | `encargado123` | Todo lo anterior + cancelar pedidos + reset demo |

> Cambia estas claves con `EMPLEADO_PASSWORD` y `ENCARGADO_PASSWORD` si publicas la demo fuera del aula.

---

## 2. Qué hay implementado

### Tienda cliente

- Landing con diseño original de la jamonería.
- 50 productos en 4 categorías, con desplegables y descripciones.
- Buscador y filtros.
- Chatbot con IA que recomienda según presupuesto, alérgenos, número de personas y tipo de producto.
- El chatbot añade productos al carrito cuando el cliente confirma.
- Carrito persistente en `localStorage`.
- Checkout demo con envío o recogida, tarjeta de prueba y pago simulado.
- Seguimiento público del pedido por token.
- El carrito recuerda el último pedido y muestra su estado.

### Panel interno

- Resumen con pedidos de hoy, pendientes, ventas, ticket medio y gráfica de 7 días.
- Avisos de pedido nuevo: campana, contador y sonido.
- Lista de pedidos con filtros y búsqueda.
- Detalle con cliente, entrega, pago, líneas, totales y notas.
- Cambio de estado con mensaje simulado.
- Nota interna.
- Historial de quién tocó el pedido.
- Hoja de preparación imprimible.
- Etiqueta de envío con QR.
- Stock editable con avisos de stock bajo.
- Bandeja de mensajes simulados.
- Exportación CSV e informe imprimible/PDF.
- Reset demo solo para encargado.

---

## 3. Pruebas que puedes hacer

### 3.1 Cliente: compra completa

1. Abre la tienda.
2. Pulsa una categoría y despliega productos.
3. Añade 2 o 3 productos al carrito.
4. Abre el asistente y escribe, por ejemplo:
   - “Quiero un pack para 4 personas, sin frutos secos, máximo 80 €”.
   - “Añádelo al carrito”.
5. Comprueba que el chat añade los productos y abre la cesta.
6. Pulsa **Tramitar pedido**.
7. Rellena nombre, email, teléfono y dirección.
8. Elige envío o recogida.
9. Paga con la tarjeta de prueba:
   - Número: `4242 4242 4242 4242`
   - Caducidad: `12/30`
   - CVC: `123`
10. Confirma y revisa la página de seguimiento.

**Qué demuestra:** catálogo, IA, carrito, checkout, validación de stock, creación de pedido y seguimiento.

### 3.2 Cliente: seguimiento

1. Guarda la URL `/pedido/[token]` que aparece al confirmar.
2. Cambia el estado desde el panel.
3. Recarga el seguimiento.
4. Verás el timeline actualizado con fechas.

### 3.3 Empleado: preparar pedidos

1. Entra en `/login` con `empleado` / `empleado123`.
2. Abre **Pedidos**.
3. Abre un pedido pendiente.
4. Pulsa **En preparación**, luego **Listo**, **Enviado** y **Entregado**.
5. Comprueba:
   - El badge cambia.
   - Se genera un mensaje en **Mensajes**.
   - El historial muestra `empleado cambió ...`.
6. Añade una nota interna y comprueba que queda registrada.
7. Pulsa **Imprimir hoja**.
8. Pulsa **Etiqueta QR** y escanea el QR con el móvil.

**Qué demuestra:** flujo operativo, auditoría, mensajes, impresión y QR.

### 3.4 Encargado: permisos y reset

1. Cierra sesión y entra con `encargado` / `encargado123`.
2. Abre un pedido pendiente.
3. Verás el botón **Cancelado**, que el empleado no tiene.
4. Cancela un pedido de prueba y comprueba que el stock vuelve.
5. En **Resumen**, pulsa **Reset demo**.
6. Confirma que se borran los pedidos y se restaura el stock.

**Qué demuestra:** roles, permisos en servidor, devolución de stock y reset.

### 3.5 Aviso de pedido nuevo

1. Abre el panel en una ventana.
2. En una ventana incógnito, haz un pedido desde la tienda.
3. Espera hasta 20 segundos.
4. La campana mostrará el contador y sonará el aviso.
5. Pulsa la campana y abre el pedido.

**Qué demuestra:** polling, contador, sonido y acceso rápido.

### 3.6 Stock

1. Entra en **Stock**.
2. Busca un producto.
3. Cambia sus unidades y pulsa **Guardar**.
4. Crea un pedido con ese producto y comprueba que baja.
5. Cancela el pedido y comprueba que vuelve.
6. Mira la actividad reciente: aparece el ajuste.

### 3.7 Exportación

1. Entra en **Pedidos**.
2. Pulsa **Exportar CSV**.
3. Abre el archivo en Excel o LibreOffice.
4. Pulsa **Informe PDF** y luego **Guardar como PDF**.

**Qué demuestra:** exportación para contabilidad y documento imprimible.

---

## 4. Guion para el martes (10–12 minutos)

### Minuto 0–1 · Presentación

> “Es una réplica funcional de la jamonería con Next.js, Neon, Vercel y OpenRouter, todo en planes gratuitos. Tiene tienda, asistente IA, checkout demo, seguimiento y panel interno.”

### Minuto 1–3 · Cliente

- Enseña la landing y las categorías.
- Abre un producto y explica el desplegable.
- Añade un producto al carrito.

### Minuto 3–5 · Asistente IA

- Pregunta por un pack para 4 personas con presupuesto.
- Enseña cómo recomienda y cómo añade al carrito al confirmar.
- Explica que la IA solo sugiere slugs; el servidor valida precios y stock.

### Minuto 5–7 · Checkout y seguimiento

- Tramita el pedido con la tarjeta de prueba.
- Enseña la página de seguimiento.
- Aclara: “El pago es simulado; no se cobra nada”.

### Minuto 7–10 · Panel interno

- Entra como empleado.
- Cambia el estado del pedido.
- Enseña el mensaje generado y el historial de auditoría.
- Enseña la etiqueta QR y escanéala.
- Entra como encargado y enseña cancelar/reset.
- Enseña stock, gráfica, CSV y PDF.

### Minuto 10–12 · Cierre

- Explica límites: Neon gratis, Vercel Hobby, OpenRouter free, Resend opcional.
- Explica siguientes pasos: Stripe test, emails reales, cuentas de cliente.
- Deja la URL y el repo.

---

## 5. Preguntas que te puede hacer la tutora

**¿Se cobra algo?**  
No. El pago es simulado. Stripe se puede añadir después en modo test.

**¿Los emails se envían?**  
Ahora no: se guardan en `demo_mensajes`. Resend se puede activar en modo gratuito.

**¿Dónde están los datos?**  
En Neon Postgres, plan gratuito. La demo usa tablas `demo_*` para no mezclar con la web original.

**¿Qué pasa si se llena la base de datos?**  
Neon Free tiene 1 GB por proyecto. Los pedidos ocupan pocos KB; habría espacio para decenas de miles. Si se llena, fallan las escrituras, no se borran datos.

**¿Es seguro?**  
Para demo: contraseña compartida, cookie firmada HMAC y roles. Para producción habría que usar cuentas individuales, HTTPS obligatorio y contraseñas fuertes.

**¿La IA puede equivocarse?**  
Sí. Por eso el carrito no lo modifica el modelo: la IA devuelve slugs, el servidor valida precios y stock, y el cliente confirma.

**¿Qué pasa con los datos legales?**  
La demo usa datos ficticios. En una tienda real, facturas y documentación contable se conservan 6 años en España; los datos de marketing se borran antes.

**¿Por qué no hay Stripe?**  
Porque la fase 1 era demostrar el flujo sin cobros reales. La arquitectura ya separa `PAYMENT_MODE=demo` para añadirlo después.

---

## 6. Resend: cómo activarlo

### Qué necesitas

1. Cuenta gratuita en https://resend.com (sin tarjeta).
2. Una API key.
3. Un remitente:
   - **Sin dominio:** `onboarding@resend.dev`, solo puedes enviar a tu propio email.
   - **Con dominio:** verificar el dominio y usar, por ejemplo, `pedidos@tudominio.com`.

### Plan Free

- 3.000 emails/mes.
- 100 emails/día.
- 3 dominios.
- Sin cobro automático: al llegar al límite, se detienen los envíos.

### Cómo lo implementaría

- Añadir `RESEND_API_KEY` y `EMAIL_MODE=resend`.
- Instalar `resend`.
- Enviar email al crear pedido y al cambiar estado.
- Guardar siempre copia en `demo_mensajes`.
- Si falla Resend, no romper el pedido: dejar el mensaje como “fallido” y seguir.

### Modo prueba sin dominio

- Remitente: `onboarding@resend.dev`.
- Destinatario: el email de tu cuenta de Resend.
- Sirve para enseñar que el correo llega de verdad, pero no para clientes reales.

---

## 7. Antes de exponer: checklist

- [ ] `pnpm dev --port 3001` funciona.
- [ ] La tienda carga.
- [ ] El chat responde.
- [ ] El checkout crea pedido.
- [ ] El seguimiento muestra el timeline.
- [ ] `/login` funciona con empleado y encargado.
- [ ] La campana avisa de un pedido nuevo.
- [ ] Se puede cambiar estado y ver auditoría.
- [ ] La etiqueta QR se imprime.
- [ ] El CSV se abre en Excel.
- [ ] El informe se guarda como PDF.
- [ ] El reset funciona (solo encargado).
- [ ] Tienes una copia del repo y de la base de datos.
- [ ] Sabes qué decir si falla internet: enseña el repo y el código.

---

## 8. Problemas frecuentes

**No carga la web local**  
Comprueba que el servidor está en `http://localhost:3001`. Si no, ejecuta `pnpm dev --port 3001`.

**No puedo entrar**  
Usuario `empleado` o `encargado`, con sus claves. Si cambiaste variables, reinicia el servidor.

**El chat no responde**  
Revisa `OPENROUTER_API_KEY` y el modelo `:free`. Si OpenRouter limita, espera o cambia de modelo.

**No aparece el aviso**  
El polling tarda hasta 20 segundos. Recarga el panel si acabas de entrar.

**El QR abre localhost**  
En producción usa el dominio de Vercel. En local es normal que abra `localhost:3001`.

**He borrado los pedidos de demo**  
El encargado puede volver a crearlos desde la tienda o ejecutar el reset. Para una demo con datos, crea 3–4 pedidos antes de exponer.

---

## 9. Limitaciones que debes decir

- Pago simulado, sin Stripe.
- Emails simulados hasta activar Resend.
- Datos de empresa ficticios.
- Contraseñas de demo compartidas.
- Sin facturación real ni obligaciones fiscales.
- Sin cuentas de cliente ni historial de compras.
- Sin gestión de transportistas.

---

## 10. Siguientes pasos posibles

1. Stripe en modo test.
2. Resend con dominio verificado.
3. Cuentas de cliente.
4. Gestión de transportistas y etiquetas reales.
5. Gráficas de ventas por producto.
6. Backup/exportación automática.
7. Tests automáticos del flujo de pedido.

---

**Consejo para el martes:** no intentes enseñarlo todo. Elige el recorrido cliente → pedido → panel → auditoría → QR. Es el que mejor cuenta la historia y el que menos depende de la IA en directo.

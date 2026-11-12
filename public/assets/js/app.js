/* ═══════════════════════════════════════════════════════════
   Miguel Ángel Jamonería — interacción
   ═══════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = (c) =>
    (c / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ───────── estado ───────── */
  const state = { productos: [], categorias: [], filtro: null };
  const WA_NUMERO = "34600000000"; // ← sustituir por el número real del puesto

  /* ───────── reveal al hacer scroll ───────── */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  const observar = () => $$(".reveal:not(.is-in)").forEach((el) => io.observe(el));
  observar();

  /* ───────── header, progreso, menú ───────── */
  const header = $("#header");
  const bar = $("#progressBar");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-stuck", y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = h > 0 ? Math.min(100, (y / h) * 100) + "%" : "0%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $("#burger");
  const nav = $("#nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#nav a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ───────── precintos ───────── */
  const PRECINTOS = {
    negro: {
      tag: "Precinto negro",
      t: "100 % ibérico de bellota",
      d: "El jamón más exclusivo. Cerdo 100 % ibérico criado en libertad y alimentado únicamente de bellota durante la montanera. Sabor profundo, grasa infiltrada y un aroma que llena la cocina.",
      l: ["Raza: 100 % ibérica", "Alimentación: solo bellota y pastos", "Curación: 36-48 meses"],
    },
    rojo: {
      tag: "Precinto rojo",
      t: "100 % ibérico de cebo",
      d: "Cerdo 100 % ibérico alimentado con piensos naturales en explotaciones controladas. Un ibérico muy equilibrado, con menos grasa infiltrada que el de bellota y un precio más contenido.",
      l: ["Raza: 100 % ibérica", "Alimentación: pienso natural", "Curación: 24-36 meses"],
    },
    verde: {
      tag: "Precinto verde",
      t: "50-75 % ibérico de bellota",
      d: "Cruces de ibérico con Duroc que sí pasan la montanera comiendo bellota. La grasa es más suave y el sabor menos intenso: perfecto para mesas grandes y paladares que empiezan.",
      l: ["Raza: 50-75 % ibérica", "Alimentación: bellota y pastos", "Curación: 24-30 meses"],
    },
    blanco: {
      tag: "Precinto blanco",
      t: "50-75 % ibérico de cebo",
      d: "La opción más accesible del ibérico. Cerdo de cruce alimentado con pienso y curado con mimo. Ideal para el día a día, tapas y bocadillos de categoría.",
      l: ["Raza: 50-75 % ibérica", "Alimentación: pienso natural", "Curación: 18-24 meses"],
    },
  };
  const panel = $("#precintoPanel");
  $$(".sello").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".sello").forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      const p = PRECINTOS[btn.dataset.sello];
      panel.innerHTML = `
        <p class="precinto-panel__tag">${esc(p.tag)}</p>
        <h3>${esc(p.t)}</h3>
        <p>${esc(p.d)}</p>
        <ul>${p.l.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
      panel.classList.remove("is-swap");
      void panel.offsetWidth;
      panel.classList.add("is-swap");
    });
  });

  /* ───────── cesta ───────── */
  const CART_KEY = "maj_cart_v1";
  let cart = {};
  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}") || {};
  } catch (_) {
    cart = {};
  }
  const guardar = () => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (_) {}
  };
  const porSlug = (slug) => state.productos.find((p) => p.slug === slug);
  const totalUnidades = () =>
    Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = () =>
    Object.entries(cart).reduce((a, [slug, q]) => {
      const p = porSlug(slug);
      return a + (p ? p.precio_cent * q : 0);
    }, 0);

  const cartCount = $("#cartCount");
  const drawer = $("#cartDrawer");
  const veil = $("#veil");

  function pintarContador(pop) {
    const n = totalUnidades();
    cartCount.textContent = String(n);
    $("#drawerCount").textContent = `(${n})`;
    if (pop) {
      cartCount.classList.add("is-pop");
      setTimeout(() => cartCount.classList.remove("is-pop"), 320);
    }
  }

  function pintarCesta() {
    const box = $("#cartItems");
    const items = Object.entries(cart).filter(([s]) => porSlug(s));
    if (!items.length) {
      box.innerHTML =
        '<p class="drawer__empty">Tu cesta está vacía.<br><span>El jamón te está esperando.</span></p>';
    } else {
      box.innerHTML = items
        .map(([slug, q]) => {
          const p = porSlug(slug);
          return `<div class="cart-item">
            <img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy">
            <div>
              <h4>${esc(p.nombre)}</h4>
              <span class="cart-item__price">${money(p.precio_cent)} · ${esc(p.formato || "")}</span>
              <div class="qty">
                <button data-q="-1" data-slug="${esc(slug)}" aria-label="Quitar una unidad">−</button>
                <span>${q}</span>
                <button data-q="1" data-slug="${esc(slug)}" aria-label="Añadir una unidad">+</button>
              </div>
            </div>
            <button class="cart-item__del" data-del="${esc(slug)}">Quitar</button>
          </div>`;
        })
        .join("");
    }
    const st = subtotal();
    $("#cartSubtotal").textContent = money(st);
    $("#cartEnvio").textContent =
      st >= 9000 || st === 0
        ? "Envío gratuito · 24-48 h a la península"
        : `Te faltan ${money(9000 - st)} para el envío gratis`;
    $("#checkout").disabled = items.length === 0;
    $("#checkout").style.opacity = items.length === 0 ? ".45" : "1";
    pintarContador(false);
    guardar();
  }

  function aplicarPedido(items) {
    let added = 0;
    items.forEach((item) => {
      if (!porSlug(item.slug)) return;
      const q = Math.max(1, Number(item.cantidad) || 1);
      cart[item.slug] = (cart[item.slug] || 0) + q;
      added += q;
    });
    if (!added) return false;
    pintarCesta();
    pintarContador(true);
    cerrarChat();
    abrirCesta(true);
    return true;
  }

  function abrirCesta(open) {
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    veil.hidden = !open;
    requestAnimationFrame(() => veil.classList.toggle("is-open", open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  $("#openCart").addEventListener("click", () => abrirCesta(true));
  $("#closeCart").addEventListener("click", () => abrirCesta(false));
  veil.addEventListener("click", () => {
    abrirCesta(false);
    cerrarChat();
  });

  $("#cartItems").addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]");
    const del = e.target.closest("[data-del]");
    if (q) {
      const slug = q.dataset.slug;
      cart[slug] = (cart[slug] || 0) + Number(q.dataset.q);
      if (cart[slug] <= 0) delete cart[slug];
      pintarCesta();
    }
    if (del) {
      delete cart[del.dataset.del];
      pintarCesta();
    }
  });

  function anadir(slug) {
    if (!porSlug(slug)) return;
    cart[slug] = (cart[slug] || 0) + 1;
    pintarCesta();
    pintarContador(true);
  }

  $("#checkout").addEventListener("click", () => {
    const lineas = Object.entries(cart)
      .map(([slug, q]) => {
        const p = porSlug(slug);
        return p ? `• ${q} × ${p.nombre} — ${money(p.precio_cent * q)}` : "";
      })
      .filter(Boolean);
    if (!lineas.length) return;
    const texto =
      `Hola, quiero hacer este pedido en Miguel Ángel Jamonería:\n\n` +
      lineas.join("\n") +
      `\n\nTotal: ${money(subtotal())}\nEnvío a península 24-48 h.`;
    window.open(`https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  });

  /* ───────── render catálogo ───────── */
  function tarjetaEstrella(p) {
    return `<article class="prod-card reveal">
      <div class="prod-card__media">
        <img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy">
        ${p.temporada ? '<span class="prod-card__temporada">Temporada</span>' : ""}
      </div>
      <div class="prod-card__body">
        <span class="prod-card__cat">${esc(p.categoria || "")}</span>
        <h3>${esc(p.nombre)}</h3>
        <span class="estrellas-mini">★★★★★ <span style="color:#8b8272">${Number(p.valoracion).toFixed(1)} (${p.votos})</span></span>
        <div class="prod-card__foot">
          <span class="precio">${money(p.precio_cent)}</span>
          <button class="add-btn" data-add="${esc(p.slug)}" aria-label="Añadir ${esc(p.nombre)} a la cesta">
            <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
    </article>`;
  }

  function pintarEstrella() {
    const grid = $("#prodGrid");
    let lista = state.filtro
      ? state.productos.filter((p) => p.categoria_slug === state.filtro)
      : state.productos.filter((p) => p.destacado).slice(0, 8);
    if (!lista.length) lista = state.productos.slice(0, 8);
    const cat = state.categorias.find((c) => c.slug === state.filtro);
    const titulo = $("#estrella");
    titulo.innerHTML = state.filtro
      ? esc(cat ? cat.nombre : "Productos")
      : "Nuestros productos estrella";
    const barra = $("#filtroActivo");
    if (barra)
      barra.innerHTML = state.filtro
        ? `<span>Mostrando ${lista.length} productos de ${esc(cat ? cat.nombre : "")}</span>
           <button class="link-btn" id="quitarFiltro">Ver todos los destacados</button>`
        : "";
    grid.innerHTML = lista.map(tarjetaEstrella).join("");
    observar();
    const q = $("#quitarFiltro");
    if (q)
      q.addEventListener("click", () => {
        state.filtro = null;
        pintarEstrella();
      });
  }

  function pintarTemporada() {
    const grid = $("#seasonGrid");
    const lista = state.productos.filter((p) => p.temporada).slice(0, 4);
    if (!lista.length) {
      grid.innerHTML = '<p class="cargando">Ahora mismo no hay productos de temporada.</p>';
      return;
    }
    grid.innerHTML = lista
      .map(
        (p) => `<article class="season-card reveal">
        <span class="season-card__badge">Temporada</span>
        <img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy">
        <h3>${esc(p.nombre)}</h3>
        <p class="season-card__nota">${esc(p.nota_temporada || "Disponible por tiempo limitado")}</p>
        <div class="season-card__foot">
          <span class="precio">${money(p.precio_cent)}<small>${esc(p.formato || "")}</small></span>
          <button class="add-btn" data-add="${esc(p.slug)}" aria-label="Añadir ${esc(p.nombre)} a la cesta">
            <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </article>`
      )
      .join("");
    observar();
  }

  function pintarOfertas() {
    const grid = $("#ofertasGrid");
    const lista = state.productos.filter((p) => p.oferta && p.precio_antes_cent);
    if (!lista.length) {
      grid.innerHTML = '<p class="cargando">No hay ofertas activas en este momento.</p>';
      $("#contador").style.display = "none";
      return;
    }
    grid.innerHTML = lista
      .map((p) => {
        const dto = Math.round((1 - p.precio_cent / p.precio_antes_cent) * 100);
        return `<article class="oferta-card reveal">
        <div class="oferta-card__media">
          <img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy">
          <span class="oferta-card__desc">−${dto} %</span>
        </div>
        <div class="oferta-card__body">
          <div>
            <h3>${esc(p.nombre)}</h3>
            <p>${esc(p.formato || "")}${p.stock ? ` · quedan ${p.stock} uds.` : ""}</p>
          </div>
          <div class="oferta-card__foot">
            <span class="precio-oferta">
              <b>${money(p.precio_cent)}</b>
              <s>${money(p.precio_antes_cent)}</s>
            </span>
            <button class="add-btn" data-add="${esc(p.slug)}" aria-label="Añadir ${esc(p.nombre)} a la cesta">
              <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </button>
          </div>
        </div>
      </article>`;
      })
      .join("");
    observar();
    iniciarContador(lista);
  }

  /* ───────── cuenta atrás ───────── */
  let cdTimer = null;
  function iniciarContador(lista) {
    const fechas = lista
      .map((p) => (p.oferta_fin ? new Date(p.oferta_fin).getTime() : null))
      .filter((t) => t && !isNaN(t));
    if (!fechas.length) {
      $("#contador").style.display = "none";
      return;
    }
    const fin = Math.min(...fechas);
    const tick = () => {
      let d = fin - Date.now();
      if (d < 0) d = 0;
      const s = Math.floor(d / 1000);
      const p2 = (n) => String(n).padStart(2, "0");
      $("#cdD").textContent = p2(Math.floor(s / 86400));
      $("#cdH").textContent = p2(Math.floor((s % 86400) / 3600));
      $("#cdM").textContent = p2(Math.floor((s % 3600) / 60));
      $("#cdS").textContent = p2(s % 60);
      if (d === 0 && cdTimer) clearInterval(cdTimer);
    };
    tick();
    if (cdTimer) clearInterval(cdTimer);
    cdTimer = setInterval(tick, 1000);
  }

  /* ───────── carga del catálogo ───────── */
  async function cargarCatalogo() {
    const err = $("#errorCarga");
    try {
      const r = await fetch("/api/catalogo", { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      if (!data.productos || !data.productos.length) throw new Error("catálogo vacío");
      state.productos = data.productos;
      state.categorias = data.categorias || [];
      err.hidden = true;
      pintarEstrella();
      pintarTemporada();
      pintarOfertas();
      pintarCesta();
    } catch (e) {
      console.error("catálogo:", e);
      err.hidden = false;
      ["#seasonGrid", "#ofertasGrid", "#prodGrid"].forEach((s) => {
        const el = $(s);
        if (el) el.innerHTML = "";
      });
      $("#prodGrid").innerHTML =
        '<p class="cargando">El catálogo no está disponible. Revisa la conexión y reintenta.</p>';
    }
  }
  $("#retryCarga").addEventListener("click", cargarCatalogo);

  /* ───────── añadir a la cesta (delegado) ───────── */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    anadir(btn.dataset.add);
    const old = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>';
    btn.style.borderColor = "var(--gold)";
    btn.style.color = "var(--gold)";
    setTimeout(() => {
      btn.innerHTML = old;
      btn.style.borderColor = "";
      btn.style.color = "";
    }, 1100);
  });

  /* ───────── filtros de categoría ───────── */
  $$("[data-cat]").forEach((a) => {
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      state.filtro = a.dataset.cat;
      pintarEstrella();
      const y = $("#estrella").getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ───────── newsletter ───────── */
  $("#newsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("#newsMsg");
    const email = $("#email").value.trim();
    msg.classList.remove("is-err");
    msg.textContent = "Guardando…";
    try {
      const r = await fetch("/api/suscribir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "No se pudo guardar");
      msg.textContent = "¡Hecho! Te avisaremos de la próxima montanera.";
      $("#email").value = "";
    } catch (err) {
      msg.classList.add("is-err");
      msg.textContent = err.message.includes("fetch")
        ? "No hay conexión con el servidor."
        : err.message;
    }
  });

  /* ───────── estado (contadores reales) ───────── */
  fetch("/api/estado")
    .then((r) => r.json())
    .then((d) => {
      if (!d || d.preguntas === null) return;
      const n = Number(d.preguntas) || 0;
      const txtPreg = n === 1 ? "1 pregunta respondida por la IA" : `${n} preguntas respondidas por la IA`;
      $("#footerMeta").textContent = `${d.productos} productos ibéricos · ${txtPreg}`;
    })
    .catch(() => {});

  /* ───────── asistente IA ───────── */
  const chat = $("#chat");
  const log = $("#chatLog");
  const fab = $("#chatFab");
  let historial = [];
  let sugerencias = [];
  let ocupado = false;

  function abrirChat(open, pregunta) {
    chat.classList.toggle("is-open", open);
    chat.setAttribute("aria-hidden", String(!open));
    fab.classList.toggle("is-hidden", open);
    if (open) {
      setTimeout(() => $("#chatInput").focus(), 300);
      if (pregunta) enviar(pregunta);
    }
  }
  const cerrarChat = () => abrirChat(false);
  $("#closeChat").addEventListener("click", cerrarChat);
  fab.addEventListener("click", () => abrirChat(true));
  $("#openChat").addEventListener("click", () => abrirChat(true));
  $$("[data-open-chat]").forEach((b) =>
    b.addEventListener("click", () => abrirChat(true, b.dataset.openChat))
  );

  function burbuja(texto, quien, extra = "") {
    const div = document.createElement("div");
    div.className = `msg msg--${quien}${extra ? " " + extra : ""}`;
    div.innerHTML = `<p>${esc(texto).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")}</p>`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function escribiendo(on) {
    let el = $("#typing");
    if (on) {
      if (el) return;
      el = document.createElement("div");
      el.id = "typing";
      el.className = "msg msg--bot typing";
      el.innerHTML = "<i></i><i></i><i></i>";
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    } else if (el) el.remove();
  }

  async function enviar(texto) {
    texto = String(texto || "").trim().slice(0, 400);
    if (!texto || ocupado) return;
    if (location.protocol === "file:") {
      burbuja(
        "El asistente necesita el servidor del sitio (funciona en la versión publicada o con `npm run dev`), no puede funcionar abriendo el archivo directamente.",
        "bot",
        "msg--err"
      );
      return;
    }
    ocupado = true;
    $("#chatChips")?.remove();
    burbuja(texto, "user");
    historial.push({ role: "user", content: texto });
    escribiendo(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historial.slice(-8), sugerencias }),
      });
      const d = await r.json().catch(() => ({}));
      escribiendo(false);
      if (!r.ok || !d.respuesta) {
        burbuja(d.error || "No he podido responder ahora mismo. Prueba otra vez.", "bot", "msg--err");
      } else {
        if (Array.isArray(d.sugerencias)) sugerencias = d.sugerencias;
        burbuja(d.respuesta, "bot");
        historial.push({ role: "assistant", content: d.respuesta });
        if (historial.length > 8) historial = historial.slice(-8);
        if (Array.isArray(d.items) && d.items.length) {
          aplicarPedido(d.items);
          sugerencias = [];
        }
      }
    } catch (e) {
      escribiendo(false);
      burbuja("No hay conexión con el asistente. Revisa tu red e inténtalo de nuevo.", "bot", "msg--err");
    } finally {
      ocupado = false;
    }
  }

  $("#chatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#chatInput").value;
    $("#chatInput").value = "";
    enviar(v);
  });
  $("#chatLog").addEventListener("click", (e) => {
    const c = e.target.closest("[data-q]");
    if (c) enviar(c.dataset.q);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (chat.classList.contains("is-open")) cerrarChat();
      if (drawer.classList.contains("is-open")) abrirCesta(false);
    }
  });

  /* ───────── arranque ───────── */
  $("#year").textContent = String(new Date().getFullYear());
  pintarContador(false);
  cargarCatalogo();
})();

import type { CSSProperties } from "react";
import Script from "next/script";

const delay = (value: string) => ({ "--d": value }) as CSSProperties;

export default function Home() {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="progress" aria-hidden="true">
        <span id="progressBar" />
      </div>

      <header className="header" id="header">
        <div className="shell header__inner">
          <a href="#inicio" className="brand" aria-label="Miguel Ángel Jamonerías, inicio">
            <span className="brand__mono">MA</span>
            <span className="brand__txt">
              <b>MIGUEL ANGEL</b>
              <i>JAMONERÍAS</i>
            </span>
          </a>
          <nav className="nav" id="nav">
            <a href="#inicio">Inicio</a>
            <a href="#productos">Productos</a>
            <a href="#temporada">Temporada</a>
            <a href="#ofertas">Ofertas</a>
            <a href="#nosotros">Nosotros</a>
          </nav>
          <div className="header__actions">
            <button className="icon-btn" id="openChat" aria-label="Abrir asistente con IA">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.9L3 21l1.9-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z" />
                <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
              </svg>
              <span className="icon-btn__label">Asistente IA</span>
            </button>
            <button className="icon-btn cart-btn" id="openCart" aria-label="Abrir cesta">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="cart-count" id="cartCount">0</span>
            </button>
            <button className="burger" id="burger" aria-label="Abrir menú" aria-expanded="false">
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="assets/img/secadero.jpg"
              alt="Jamones ibéricos colgados en el secadero natural"
              fetchPriority="high"
            />
          </div>
          <div className="hero__veil" />
          <div className="shell hero__inner">
            <div className="hero__copy">
              <p className="eyebrow reveal">Jamones ibéricos y productos ibéricos</p>
              <h1 className="hero__title">
                <span className="line"><span>El auténtico sabor</span></span>
                <span className="line"><span>de la <em>tradición</em> ibérica</span></span>
              </h1>
              <p className="hero__sub reveal" style={delay(".35s")}>
                En Miguel Ángel Jamonería ofrecemos una selección exclusiva de jamones y
                productos ibéricos de la más alta calidad, con la garantía de un sabor único
                y auténtico. Desde 1988, en el Mercado de Abastos de Salamanca.
              </p>
              <div className="hero__cta reveal" style={delay(".5s")}>
                <a href="#productos" className="btn btn--gold">
                  <span>Descubre nuestros productos</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </a>
                <button
                  className="btn btn--ghost"
                  data-open-chat="¿Qué me recomiendas para 6 personas con 60 €?"
                >
                  <span>Pregunta al asistente</span>
                </button>
              </div>
            </div>
            <div className="hero__seal reveal" style={delay(".7s")} aria-hidden="true">
              <svg className="seal__ring" viewBox="0 0 120 120">
                <defs>
                  <path id="circlePath" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                </defs>
                <text>
                  <textPath href="#circlePath">PRODUCTOS IBÉRICOS · MÁXIMA CALIDAD ·</textPath>
                </text>
              </svg>
              <span className="seal__mark">✦</span>
            </div>
          </div>
          <a href="#valores" className="scroll-cue" aria-label="Bajar"><span /></a>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            <span>Desde 1988</span><i>✦</i><span>Mercado de Abastos · Salamanca</span><i>✦</i><span>Envío 24-48 h</span><i>✦</i><span>Cortado a cuchillo</span><i>✦</i><span>100 % ibérico</span><i>✦</i>
            <span>Desde 1988</span><i>✦</i><span>Mercado de Abastos · Salamanca</span><i>✦</i><span>Envío 24-48 h</span><i>✦</i><span>Cortado a cuchillo</span><i>✦</i><span>100 % ibérico</span><i>✦</i>
          </div>
        </div>

        <section className="valores" id="valores">
          <div className="shell valores__grid">
            <article className="valor reveal">
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M6 8c0 7 4 12 9 13.5V26M6 8c8-3 15 2 15 9 0 5-4 8-9 8" />
                <path d="M11 12c3 0 5 2 5 5" />
              </svg>
              <h3>Jamones 100 % ibéricos</h3>
              <p>Selección de las mejores denominaciones de origen.</p>
            </article>
            <article className="valor reveal" style={delay(".1s")}>
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M16 27c0-9 3-17 9-21-1 9-4 16-9 21Z" />
                <path d="M16 27C16 18 13 10 7 6c1 9 4 16 9 21Z" />
                <path d="M16 27v-8" />
              </svg>
              <h3>Productos ibéricos gourmet</h3>
              <p>Embutidos, lomos, paletas y mucho más.</p>
            </article>
            <article className="valor reveal" style={delay(".2s")}>
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M16 4l9 4v8c0 6-4 10-9 12-5-2-9-6-9-12V8Z" />
                <path d="M11.5 16l3 3 6-6.5" />
              </svg>
              <h3>Calidad garantizada</h3>
              <p>Solo trabajamos con los mejores proveedores y productores.</p>
            </article>
            <article className="valor reveal" style={delay(".3s")}>
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M16 28s9-8.5 9-15a9 9 0 1 0-18 0c0 6.5 9 15 9 15Z" />
                <circle cx="16" cy="13" r="3.4" />
              </svg>
              <h3>En el Mercado de Abastos</h3>
              <p>Tradición, calidad y cercanía en el corazón de la ciudad.</p>
            </article>
          </div>
        </section>

        <section className="seccion categorias" id="productos">
          <div className="shell">
            <header className="seccion__head reveal">
              <p className="eyebrow">Nuestra selección</p>
              <h2 className="titulo">Productos ibéricos</h2>
            </header>
            <div className="cat-grid" id="catGrid">
              <a className="cat-card reveal" href="#estrella" data-cat="jamones">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="assets/img/secadero.jpg" alt="Jamones curándose en un secadero natural de Guijuelo" loading="lazy" style={{ objectPosition: "center 38%" }} />
                <div className="cat-card__body">
                  <h3>Jamones ibéricos</h3>
                  <p>De bellota, cebo de campo y cebo.</p>
                  <span className="cat-card__go">Ver productos <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                </div>
              </a>
              <a className="cat-card reveal" style={delay(".08s")} href="#estrella" data-cat="embutidos">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="assets/img/embutidos.jpg" alt="Embutidos ibéricos colgados en la tienda" loading="lazy" style={{ objectPosition: "center 32%" }} />
                <div className="cat-card__body">
                  <h3>Embutidos ibéricos</h3>
                  <p>Chorizo, salchichón, lomo…</p>
                  <span className="cat-card__go">Ver productos <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                </div>
              </a>
              <a className="cat-card reveal" style={delay(".16s")} href="#estrella" data-cat="loncheados">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="assets/img/loncheado.jpg" alt="Loncheado de jamón ibérico" loading="lazy" style={{ objectPosition: "center 82%" }} />
                <div className="cat-card__body">
                  <h3>Loncheados</h3>
                  <p>Calidad y sabor en cada loncha.</p>
                  <span className="cat-card__go">Ver productos <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                </div>
              </a>
              <a className="cat-card reveal" style={delay(".24s")} href="#estrella" data-cat="conservas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="assets/img/tabla.jpg" alt="Tabla de ibéricos y queso" loading="lazy" style={{ objectPosition: "center 45%" }} />
                <div className="cat-card__body">
                  <h3>Conservas y otros</h3>
                  <p>Mantecas, patés, aceites y quesos.</p>
                  <span className="cat-card__go">Ver productos <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                </div>
              </a>
            </div>
            <div className="cat-accordion" id="catAccordion" aria-live="polite" />
          </div>
        </section>

        <section className="precintos" id="precintos">
          <div className="shell precintos__grid">
            <div className="precintos__copy reveal">
              <p className="eyebrow">Cómo leer una etiqueta</p>
              <h2 className="titulo titulo--left">El color del precinto<br /><em>lo dice todo</em></h2>
              <p className="lead">
                Cada jamón ibérico lleva un precinto de color que indica su pureza de raza
                y su alimentación. Aprende a leerlo y sabrás exactamente qué te llevas a casa.
              </p>
              <div className="sellos" role="tablist" aria-label="Tipos de precinto">
                <button className="sello is-active" role="tab" aria-selected="true" data-sello="negro" style={{ "--c": "#1b1b1b" } as CSSProperties}>
                  <i /><span>Negro</span>
                </button>
                <button className="sello" role="tab" aria-selected="false" data-sello="rojo" style={{ "--c": "#9e2b25" } as CSSProperties}>
                  <i /><span>Rojo</span>
                </button>
                <button className="sello" role="tab" aria-selected="false" data-sello="verde" style={{ "--c": "#3d6b4a" } as CSSProperties}>
                  <i /><span>Verde</span>
                </button>
                <button className="sello" role="tab" aria-selected="false" data-sello="blanco" style={{ "--c": "#e6ddcb" } as CSSProperties}>
                  <i /><span>Blanco</span>
                </button>
              </div>
            </div>
            <div className="precinto-panel reveal" style={delay(".15s")} id="precintoPanel">
              <p className="precinto-panel__tag">Precinto negro</p>
              <h3>100 % ibérico de bellota</h3>
              <p>
                El jamón más exclusivo. Cerdo 100 % ibérico criado en libertad y alimentado
                únicamente de bellota durante la montanera. Sabor profundo, grasa infiltrada y
                un aroma que llena la cocina.
              </p>
              <ul>
                <li>Raza: 100 % ibérica</li>
                <li>Alimentación: solo bellota y pastos</li>
                <li>Curación: 36-48 meses</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="seccion temporada" id="temporada">
          <div className="shell">
            <header className="seccion__head seccion__head--row reveal">
              <div>
                <p className="eyebrow">Destacados de temporada</p>
                <h2 className="titulo titulo--left">Montanera <em>2025/26</em></h2>
              </div>
              <p className="temporada__nota">
                La bellota marca el calendario. Estas son las piezas que tenemos en su mejor
                momento —y solo hasta que se acaben.
              </p>
            </header>
            <div className="season-grid" id="seasonGrid" aria-live="polite">
              <p className="cargando">Cargando la temporada…</p>
            </div>
          </div>
        </section>

        <section className="ofertas" id="ofertas">
          <div className="shell">
            <header className="ofertas__head reveal">
              <div>
                <p className="eyebrow eyebrow--dark">Ofertas de la semana</p>
                <h2 className="titulo titulo--left">Precio de puesto,<br /><em>directo a tu mesa</em></h2>
              </div>
              <div className="contador" id="contador" aria-live="off">
                <span className="contador__lbl">Terminan en</span>
                <div className="contador__nums">
                  <b id="cdD">00</b><i>d</i><b id="cdH">00</b><i>h</i><b id="cdM">00</b><i>m</i><b id="cdS">00</b><i>s</i>
                </div>
              </div>
            </header>
            <div className="ofertas-grid" id="ofertasGrid" aria-live="polite">
              <p className="cargando">Cargando las ofertas…</p>
            </div>
            <p className="ofertas__pie reveal">Envío gratuito en pedidos superiores a 90 € · Precios con IVA incluido</p>
          </div>
        </section>

        <section className="historia" id="nosotros">
          <div className="shell historia__grid">
            <figure className="historia__media reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="assets/img/mercado-puerta.jpg" alt="Puerta del Mercado de Abastos de Salamanca" loading="lazy" />
              <figcaption>Mercado Central de Abastos · Salamanca</figcaption>
            </figure>
            <div className="historia__copy reveal" style={delay(".12s")}>
              <p className="eyebrow">Nuestra historia</p>
              <h2 className="titulo titulo--left">Tradición familiar<br />en el corazón de Salamanca</h2>
              <p className="lead">
                Miguel Ángel Jamonería nace con la pasión por el buen jamón y el compromiso de
                ofrecerte productos ibéricos de la más alta calidad. Estamos en el emblemático
                Mercado de Abastos, en pleno centro de la ciudad, donde la tradición y el buen
                hacer se viven cada día desde 1988.
              </p>
              <div className="historia__foot">
                <a href="#contacto" className="btn btn--gold btn--sm">
                  <span>Conoce sobre nosotros</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </a>
                <address className="direccion">
                  <svg viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M16 28s9-8.5 9-15a9 9 0 1 0-18 0c0 6.5 9 15 9 15Z" />
                    <circle cx="16" cy="13" r="3.4" />
                  </svg>
                  <span><b>Mercado de Abastos</b><br />C/ Correhuela, s/n · 37001 Salamanca<br /><i>En pleno centro</i></span>
                </address>
              </div>
            </div>
          </div>
        </section>

        <section className="seccion estrella">
          <div className="shell">
            <header className="seccion__head reveal">
              <p className="eyebrow">Los más valorados</p>
              <h2 className="titulo" id="estrella">Nuestros productos estrella</h2>
            </header>
            <div className="filtro-activo" id="filtroActivo" />
            <div className="prod-grid" id="prodGrid" aria-live="polite">
              <p className="cargando">Cargando productos…</p>
            </div>
            <p className="error-carga" id="errorCarga" hidden>
              No hemos podido cargar el catálogo ahora mismo.
              <button className="link-btn" id="retryCarga">Reintentar</button>
            </p>
          </div>
        </section>

        <section className="testimonios">
          <div className="shell">
            <div className="testi-track" id="testiTrack">
              <article className="testi reveal">
                <div className="estrellas" aria-label="5 de 5">★★★★★</div>
                <p>«El jamón de bellota es otra liga. Se nota el cariño en el corte y en cómo te explican cada pieza.»</p>
                <footer>Lucía M. · Salamanca</footer>
              </article>
              <article className="testi reveal" style={delay(".1s")}>
                <div className="estrellas" aria-label="5 de 5">★★★★★</div>
                <p>«Pedí una paleta para una cena de 12 y llegó en 24 horas, perfecta de embalaje. Repetiré seguro.»</p>
                <footer>Javier R. · Madrid</footer>
              </article>
              <article className="testi reveal" style={delay(".2s")}>
                <div className="estrellas" aria-label="5 de 5">★★★★★</div>
                <p>«Trato cercano de verdad. Me aconsejaron qué llevar para una mesa con niños y no fallaron.»</p>
                <footer>Marta G. · Valladolid</footer>
              </article>
            </div>
          </div>
        </section>

        <section className="newsletter" id="contacto">
          <div className="shell newsletter__grid">
            <div className="reveal">
              <p className="eyebrow">Club del ibérico</p>
              <h2 className="titulo titulo--left">Recibe la temporada<br /><em>antes que nadie</em></h2>
              <p className="lead">Avisos de montanera, ofertas del puesto y recetas de nuestro maestro cortador. Sin spam.</p>
            </div>
            <form className="news-form reveal" style={delay(".12s")} id="newsForm" noValidate>
              <label htmlFor="email" className="sr-only">Tu correo electrónico</label>
              <input id="email" name="email" type="email" placeholder="Tu email" autoComplete="email" required />
              <button type="submit" aria-label="Suscribirme">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
              <p className="news-form__msg" id="newsMsg" role="status" />
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell footer__top">
          <div className="footer__brand">
            <span className="brand__mono">MA</span>
            <span className="brand__txt"><b>MIGUEL ANGEL</b><i>JAMONERÍAS</i></span>
            <p>Sabor, tradición y calidad</p>
          </div>
          <nav className="footer__nav">
            <a href="#inicio">Inicio</a><a href="#productos">Productos</a><a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a>
          </nav>
          <div className="footer__social">
            <span>Síguenos</span>
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24"><path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5v4h3v7h4v-7h3l1-4h-4V7.5A1.5 1.5 0 0 1 13.5 6H15Z" /></svg>
            </a>
            <a href="#" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24"><path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.5-4.5a8.4 8.4 0 1 1 15.5-4.4Z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5" /></svg>
            </a>
          </div>
        </div>
        <div className="shell footer__bottom">
          <p>© <span id="year">2026</span> Miguel Ángel Jamonerías. Todos los derechos reservados.</p>
          <p className="footer__meta" id="footerMeta">Productos ibéricos desde 1988</p>
          <nav className="footer__legal">
            <a href="#">Aviso legal</a><a href="#">Política de privacidad</a><a href="#">Política de cookies</a><a href="/login">Acceso empleados</a>
          </nav>
        </div>
      </footer>

      <div className="drawer-veil" id="veil" hidden />
      <aside className="drawer" id="cartDrawer" aria-hidden="true" aria-label="Tu cesta">
        <header className="drawer__head">
          <h2>Tu cesta <span id="drawerCount">(0)</span></h2>
          <button className="x-btn" id="closeCart" aria-label="Cerrar cesta">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>
        <div className="drawer__body" id="cartItems">
          <p className="drawer__empty">Tu cesta está vacía.<br /><span>El jamón te está esperando.</span></p>
        </div>
        <footer className="drawer__foot">
          <div className="drawer__row"><span>Subtotal</span><b id="cartSubtotal">0,00 €</b></div>
          <p className="drawer__nota" id="cartEnvio">Envío gratis a partir de 90 €</p>
          <div className="drawer__last" id="lastOrder" hidden />
          <button className="btn btn--gold btn--full" id="checkout"><span>Tramitar pedido</span></button>
          <p className="drawer__fine">Pago simulado en la demo: no se cobra nada.</p>
        </footer>
      </aside>

      <button className="chat-fab" id="chatFab" aria-label="Abrir el asistente de la tienda">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.9L3 21l1.9-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z" /></svg>
        <span>Asistente</span>
      </button>

      <section className="chat" id="chat" aria-hidden="true" aria-label="Asistente Miguel Ángel Jamonería">
        <header className="chat__head">
          <div className="chat__id">
            <span className="chat__avatar">MA</span>
            <div>
              <b>Asistente Miguel Ángel</b>
              <i><span className="dot" /> En línea · solo productos de la tienda</i>
            </div>
          </div>
          <button className="x-btn" id="closeChat" aria-label="Cerrar asistente">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>
        <div className="chat__log" id="chatLog" role="log" aria-live="polite">
          <div className="msg msg--bot">
            <p>
              Hola 👋 Soy el asistente de Miguel Ángel Jamonería. Puedo recomendarte productos
              según cuántos seáis, vuestros gustos o el presupuesto, y avisarte de los alérgenos
              de cada pieza. ¿Qué necesitas?
            </p>
          </div>
          <div className="chips" id="chatChips">
            <button data-q="¿Qué jamón me recomiendas para 6 personas?">Para 6 personas</button>
            <button data-q="Tengo 60 € de presupuesto, ¿qué me llevo para una cena?">Presupuesto 60 €</button>
            <button data-q="¿Qué alérgenos tienen el chorizo y el queso?">Alérgenos</button>
            <button data-q="Quiero un regalo ibérico para alguien que no entiende de jamón">Idea para regalo</button>
          </div>
        </div>
        <form className="chat__form" id="chatForm">
          <label htmlFor="chatInput" className="sr-only">Escribe tu pregunta</label>
          <input id="chatInput" type="text" placeholder="Pregunta sobre productos, alérgenos, envíos…" autoComplete="off" maxLength={400} />
          <button type="submit" aria-label="Enviar">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" /></svg>
          </button>
        </form>
        <p className="chat__legal">Respuestas generadas por IA a partir de nuestro catálogo. Para alérgenos, prevalece el etiquetado del envase.</p>
      </section>

      <Script src="/assets/js/app.js?v=5" strategy="afterInteractive" />
    </>
  );
}

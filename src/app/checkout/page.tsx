'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { COMPANY, ENVIO } from '@/data/company'

interface Producto {
  slug: string
  nombre: string
  precio_cent: number
  formato: string
  stock: number
}

type Carrito = Record<string, number>

function euros(cent: number) {
  return `${(cent / 100).toFixed(2).replace('.', ',')} €`
}

export default function CheckoutPage() {
  const [carrito, setCarrito] = useState<Carrito>({})
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [entrega, setEntrega] = useState<'envio' | 'recogida'>('envio')
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    notas: '',
    tarjeta: '4242 4242 4242 4242',
    caducidad: '12/30',
    cvc: '123',
  })

  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem('maj_cart_v1') || '{}')
      setCarrito(guardado && typeof guardado === 'object' ? guardado : {})
    } catch {
      setCarrito({})
    }

    fetch('/api/catalogo')
      .then((r) => r.json())
      .then((d) => setProductos(d.productos || []))
      .catch(() => setProductos([]))
      .finally(() => setCargando(false))
  }, [])

  const lineas = useMemo(() => {
    return Object.entries(carrito)
      .map(([slug, cantidad]) => {
        const p = productos.find((x) => x.slug === slug)
        return p ? { producto: p, cantidad } : null
      })
      .filter((x): x is { producto: Producto; cantidad: number } => x !== null)
  }, [carrito, productos])

  const subtotal = lineas.reduce((sum, l) => sum + l.producto.precio_cent * l.cantidad, 0)
  const envio = entrega === 'recogida' || subtotal >= ENVIO.gratisDesdeCent ? 0 : ENVIO.costeCent
  const total = subtotal + envio

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (lineas.length === 0) {
      setError('Tu cesta está vacía.')
      return
    }
    if (entrega === 'envio' && (!form.direccion || !form.ciudad || !form.codigoPostal)) {
      setError('Completa la dirección de envío.')
      return
    }

    setEnviando(true)
    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lineas.map((l) => ({ slug: l.producto.slug, cantidad: l.cantidad })),
          cliente: {
            nombre: form.nombre,
            email: form.email,
            telefono: form.telefono,
          },
          entrega,
          direccion: form.direccion,
          ciudad: form.ciudad,
          codigoPostal: form.codigoPostal,
          notas: form.notas,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'No se pudo crear el pedido')

      localStorage.removeItem('maj_cart_v1')
      localStorage.setItem(
        'maj_last_order',
        JSON.stringify({ numero: data.numero, token: data.token, estado: data.estado })
      )
      window.location.href = `/pedido/${data.token}?nuevo=1`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el pedido')
      setEnviando(false)
    }
  }

  if (cargando) {
    return <div className="checkout"><p className="cargando">Cargando tu cesta…</p></div>
  }

  if (lineas.length === 0) {
    return (
      <div className="checkout">
        <div className="checkout__empty">
          <p className="eyebrow">Tu cesta</p>
          <h1>No hay productos todavía</h1>
          <p>Vuelve al catálogo, elige tu selección y la preparamos.</p>
          <Link href="/#productos" className="btn btn--gold"><span>Ver productos</span></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout">
      <div className="checkout__head">
        <p className="eyebrow">Pedido demo</p>
        <h1>Tramitar pedido</h1>
        <p>Pago simulado. No se cobra nada y no se envían datos reales.</p>
      </div>

      <form className="checkout__grid" onSubmit={enviar}>
        <div className="checkout__form">
          <section className="checkout__card">
            <h2>Datos de contacto</h2>
            <div className="field">
              <label htmlFor="nombre">Nombre y apellidos</label>
              <input id="nombre" required value={form.nombre} onChange={(e) => update('nombre', e.target.value)} placeholder="Ana García" />
            </div>
            <div className="field--row">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="ana@example.com" />
              </div>
              <div className="field">
                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" value={form.telefono} onChange={(e) => update('telefono', e.target.value)} placeholder="600 000 000" />
              </div>
            </div>
          </section>

          <section className="checkout__card">
            <h2>Entrega</h2>
            <div className="checkout__options">
              <label className={entrega === 'envio' ? 'is-active' : ''}>
                <input type="radio" name="entrega" checked={entrega === 'envio'} onChange={() => setEntrega('envio')} />
                Envío · {ENVIO.plazo}
              </label>
              <label className={entrega === 'recogida' ? 'is-active' : ''}>
                <input type="radio" name="entrega" checked={entrega === 'recogida'} onChange={() => setEntrega('recogida')} />
                Recogida en el mercado
              </label>
            </div>

            {entrega === 'envio' ? (
              <>
                <div className="field">
                  <label htmlFor="direccion">Dirección</label>
                  <input id="direccion" required value={form.direccion} onChange={(e) => update('direccion', e.target.value)} placeholder="Calle, número, piso" />
                </div>
                <div className="field--row">
                  <div className="field">
                    <label htmlFor="ciudad">Ciudad</label>
                    <input id="ciudad" required value={form.ciudad} onChange={(e) => update('ciudad', e.target.value)} placeholder="Salamanca" />
                  </div>
                  <div className="field">
                    <label htmlFor="cp">Código postal</label>
                    <input id="cp" required value={form.codigoPostal} onChange={(e) => update('codigoPostal', e.target.value)} placeholder="37001" />
                  </div>
                </div>
              </>
            ) : (
              <p className="checkout__nota">
                Recogida en {COMPANY.direccion}, {COMPANY.ciudad}. {COMPANY.horario}.
              </p>
            )}

            <div className="field">
              <label htmlFor="notas">Notas para el pedido</label>
              <textarea id="notas" rows={3} value={form.notas} onChange={(e) => update('notas', e.target.value)} placeholder="Sin lonchear, regalo, alergias…" />
            </div>
          </section>

          <section className="checkout__card checkout__demo">
            <h2>Pago demo</h2>
            <p>Tarjeta de prueba precargada. No se procesa ningún cobro.</p>
            <div className="field">
              <label htmlFor="tarjeta">Número de tarjeta</label>
              <input id="tarjeta" value={form.tarjeta} onChange={(e) => update('tarjeta', e.target.value)} inputMode="numeric" />
            </div>
            <div className="field--row">
              <div className="field">
                <label htmlFor="caducidad">Caducidad</label>
                <input id="caducidad" value={form.caducidad} onChange={(e) => update('caducidad', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="cvc">CVC</label>
                <input id="cvc" value={form.cvc} onChange={(e) => update('cvc', e.target.value)} />
              </div>
            </div>
            <p className="checkout__legal">Al continuar aceptas las condiciones de la demo. Datos ficticios, sin validez fiscal.</p>
          </section>
        </div>

        <aside className="checkout__summary">
          <h2>Tu pedido</h2>
          {lineas.map(({ producto, cantidad }) => (
            <div className="checkout__line" key={producto.slug}>
              <span>{cantidad} × {producto.nombre}</span>
              <b>{euros(producto.precio_cent * cantidad)}</b>
            </div>
          ))}
          <div className="checkout__line"><span>Subtotal</span><b>{euros(subtotal)}</b></div>
          <div className="checkout__line"><span>Envío</span><b>{envio === 0 ? 'Gratis' : euros(envio)}</b></div>
          <div className="checkout__total"><span>Total</span><b>{euros(total)}</b></div>
          {error && <p className="checkout__error">{error}</p>}
          <button type="submit" className="btn btn--gold btn--full" disabled={enviando}>
            <span>{enviando ? 'Creando pedido…' : 'Pagar y confirmar (demo)'}</span>
          </button>
          <p className="checkout__fine">Pedido sin compromiso real. Podrás seguirlo desde el carrito.</p>
        </aside>
      </form>
    </div>
  )
}

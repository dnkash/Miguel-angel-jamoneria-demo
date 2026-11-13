'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type NuevoPedido = {
  id: number
  numero: string
  clienteNombre: string
  totalCent: number
  creadoEn: string
}

function euros(cent: number) {
  return `${(cent / 100).toFixed(2).replace('.', ',')} €`
}

export function AdminNotifications() {
  const [nuevos, setNuevos] = useState<NuevoPedido[]>([])
  const [pendientes, setPendientes] = useState(0)
  const [open, setOpen] = useState(false)
  const [sound, setSound] = useState(true)
  const sinceRef = useRef<number | null>(null)
  const soundRef = useRef(true)
  const audioRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    soundRef.current = sound
  }, [sound])

  const beep = () => {
    if (!soundRef.current) return
    try {
      const ctx = audioRef.current ?? new AudioContext()
      audioRef.current = ctx
      if (ctx.state === 'suspended') void ctx.resume()

      const tone = (frequency: number, start: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = frequency
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + 0.18)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + start)
        osc.stop(ctx.currentTime + start + 0.2)
      }

      tone(880, 0)
      tone(1180, 0.18)
    } catch {
      // El navegador puede bloquear el audio hasta que haya interacción.
    }
  }

  useEffect(() => {
    let activo = true

    const cargar = async (inicial = false) => {
      try {
        const since = sinceRef.current
        const url = since ? `/api/admin/notificaciones?since=${since}` : '/api/admin/notificaciones'
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        if (!activo) return

        setPendientes(data.pendientes ?? 0)

        if (inicial || sinceRef.current === null) {
          sinceRef.current = data.ultimoId ?? 0
          return
        }

        if (Array.isArray(data.nuevos) && data.nuevos.length > 0) {
          setNuevos((prev) => {
            const ids = new Set(prev.map((p) => p.id))
            return [...data.nuevos.filter((p: NuevoPedido) => !ids.has(p.id)), ...prev].slice(0, 5)
          })
          sinceRef.current = Math.max(sinceRef.current ?? 0, ...data.nuevos.map((p: NuevoPedido) => p.id))
          beep()
        }
      } catch {
        // Sin conexión: se reintenta en el siguiente ciclo.
      }
    }

    void cargar(true)
    const intervalo = window.setInterval(() => void cargar(), 20000)
    return () => {
      activo = false
      window.clearInterval(intervalo)
    }
  }, [])

  const badge = nuevos.length > 0 ? nuevos.length : pendientes

  return (
    <div className="notif">
      <button
        type="button"
        className="notif__bell"
        aria-label="Pedidos nuevos"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {badge > 0 && <span className="notif__badge">{badge > 9 ? '9+' : badge}</span>}
      </button>

      <button
        type="button"
        className="notif__sound"
        aria-label={sound ? 'Silenciar avisos' : 'Activar sonido'}
        onClick={() => setSound((v) => !v)}
      >
        {sound ? '🔔' : '🔕'}
      </button>

      {open && (
        <div className="notif__panel">
          <div className="notif__head">
            <b>Pedidos nuevos</b>
            <Link href="/admin/pedidos?estado=pagado" onClick={() => setOpen(false)}>
              Ver todos
            </Link>
          </div>

          {nuevos.length === 0 ? (
            <p className="notif__empty">
              {pendientes > 0
                ? `Hay ${pendientes} pedido${pendientes === 1 ? '' : 's'} pendiente${pendientes === 1 ? '' : 's'} de preparar.`
                : 'No hay pedidos nuevos.'}
            </p>
          ) : (
            <ul>
              {nuevos.map((pedido) => (
                <li key={pedido.id}>
                  <Link href={`/admin/pedidos/${pedido.id}`} onClick={() => setOpen(false)}>
                    <span>
                      <b>{pedido.numero}</b>
                      <small>{pedido.clienteNombre}</small>
                    </span>
                    <span>
                      <b>{euros(pedido.totalCent)}</b>
                      <small>{new Date(pedido.creadoEn).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

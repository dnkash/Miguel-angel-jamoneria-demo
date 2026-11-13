'use client'

import Link from 'next/link'
import { useState } from 'react'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const entrar = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'No se pudo entrar')
      window.location.href = '/admin'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar')
      setLoading(false)
    }
  }

  const rellenar = (usuario: string, clave: string) => {
    setUsername(usuario)
    setPassword(clave)
    setError('')
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={entrar}>
        <p className="eyebrow">Panel interno · demo</p>
        <h1>Entrar</h1>
        <p>Acceso de empleados. No hay datos reales.</p>

        <div className="field">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="empleado"
            autoComplete="username"
            autoCapitalize="none"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="checkout__error">{error}</p>}

        <button type="submit" className="btn btn--gold btn--full" disabled={loading}>
          <span>{loading ? 'Entrando…' : 'Entrar'}</span>
        </button>

        <div className="admin-login__accounts">
          <button type="button" onClick={() => rellenar('empleado', 'empleado123')}>
            <b>Empleado</b>
            <span>empleado123</span>
          </button>
          <button type="button" onClick={() => rellenar('encargado', 'encargado123')}>
            <b>Encargado</b>
            <span>encargado123</span>
          </button>
        </div>

        <p className="admin-login__hint"><Link href="/">← Volver a la tienda</Link></p>
      </form>
    </div>
  )
}

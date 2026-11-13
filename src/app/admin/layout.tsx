import Link from 'next/link'
import { isAdmin } from '@/lib/admin-auth'
import { COMPANY } from '@/data/company'
import { LogoutButton } from './logout-button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin()

  return (
    <div className="admin">
      <aside className="admin__side">
        <Link href="/admin" className="admin__brand">
          <span className="brand__mono">MA</span>
          <span>
            Panel interno
            <small>Demo</small>
          </span>
        </Link>

        {admin && (
          <nav className="admin__nav">
            <Link href="/admin">Resumen</Link>
            <Link href="/admin/pedidos">Pedidos</Link>
            <Link href="/admin/mensajes">Mensajes</Link>
          </nav>
        )}

        <div className="admin__side-foot">
          <Link href="/">← Ver tienda</Link>
          <span>{COMPANY.nombreFiscal}</span>
        </div>
      </aside>

      <div className="admin__main">
        <header className="admin__top">
          <p>MODO DEMO · datos ficticios · sin cobros reales</p>
          {admin ? <LogoutButton /> : <Link href="/admin/login" className="admin__link">Entrar</Link>}
        </header>
        {children}
      </div>
    </div>
  )
}

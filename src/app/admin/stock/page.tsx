import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-auth'
import { getProductos } from '@/lib/admin-data'
import { StockTable } from './stock-table'

export const dynamic = 'force-dynamic'

export default async function StockPage() {
  if (!(await getAdminSession())) redirect('/admin/login')

  let productos
  try {
    productos = await getProductos()
  } catch (error) {
    console.error('[admin] Error cargando stock:', error)
    return (
      <div className="admin__content">
        <h1>Stock</h1>
        <p className="admin-muted">No se pudo conectar con la base de datos.</p>
      </div>
    )
  }

  return (
    <div className="admin__content">
      <div className="admin__head">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Stock</h1>
        </div>
        <span className="admin-muted">{productos.length} productos</span>
      </div>
      <p className="admin-muted">
        Ajusta las unidades disponibles. Los pedidos descuentan stock automáticamente
        y las cancelaciones lo devuelven.
      </p>
      <StockTable productos={productos} />
    </div>
  )
}

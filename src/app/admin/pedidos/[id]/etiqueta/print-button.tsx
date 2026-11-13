'use client'

export function EtiquetaPrintButton() {
  return (
    <button type="button" className="btn btn--gold btn--sm" onClick={() => window.print()}>
      <span>Imprimir etiqueta</span>
    </button>
  )
}

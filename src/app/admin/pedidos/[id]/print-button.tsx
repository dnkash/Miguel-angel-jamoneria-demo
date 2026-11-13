'use client'

export function PrintButton() {
  return (
    <button type="button" className="btn btn--outline btn--sm" onClick={() => window.print()}>
      <span>Imprimir hoja</span>
    </button>
  )
}

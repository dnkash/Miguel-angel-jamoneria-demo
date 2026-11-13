'use client'

export function InformePrintButton() {
  return (
    <button type="button" className="btn btn--outline btn--sm" onClick={() => window.print()}>
      <span>Guardar como PDF</span>
    </button>
  )
}

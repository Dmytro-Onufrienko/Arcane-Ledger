import { HashRouter, Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<div className="parchment-bg" style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--color-on-surface)' }}>Arcane Ledger — Phase 0 ✓</p>
        </div>} />
      </Routes>
    </HashRouter>
  )
}

import { HashRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard/Dashboard'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/character/:id" element={<div className="parchment-bg" style={{ width: '100vw', height: '100vh' }} />} />
      </Routes>
    </HashRouter>
  )
}

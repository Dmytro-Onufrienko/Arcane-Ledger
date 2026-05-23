import { HashRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard/Dashboard'
import Character from '@/pages/Character/Character'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/character/:id" element={<Character />} />
      </Routes>
    </HashRouter>
  )
}

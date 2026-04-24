import { useState } from 'react'
import './styles/app.css'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Suministro from './pages/Suministro'
import DashboardGeneral from './pages/DashboardGeneral'
import Incidencias from './pages/Incidencias'
import Personal from './pages/Personal'

const PAGES = {
  suministro: { label: 'Suministro', component: Suministro, eyebrow: 'Módulo 01 · Compras + Almacén' },
  dashboard:  { label: 'Dashboard General', component: DashboardGeneral, eyebrow: 'Módulo 02 · Vista Operativa' },
  incidencias:{ label: 'Reportes de Incidencias', component: Incidencias, eyebrow: 'Módulo 03 · Campo + Operación' },
  personal:   { label: 'Módulo de Personal', component: Personal, eyebrow: 'Módulo 04 · Recursos Humanos' },
}

export default function App() {
  const [page, setPage] = useState('suministro')
  const Active = PAGES[page].component

  return (
    <div className="app-shell">
      <Sidebar active={page} onChange={setPage} />
      <main className="app-main">
        <Topbar pageLabel={PAGES[page].label} pageEyebrow={PAGES[page].eyebrow} onNavigate={setPage} />
        <div className="app-content fade-in" key={page}>
          <Active />
        </div>
      </main>
    </div>
  )
}

import { useState } from 'react'
import { Icon } from '../components/Icons'
import '../styles/dashboard.css'
import TabClientes from '../components/dashboard/TabClientes'
import TabCobrar from '../components/dashboard/TabCobrar'
import TabKPIs from '../components/dashboard/TabKPIs'
import '../styles/dashboard.css'

const TABS = [
  { id: 'clientes', label: 'Clientes',          icon: 'building' },
  { id: 'cobrar',   label: 'Cuentas por cobrar', icon: 'cash'    },
  { id: 'kpis',     label: "KPI's",              icon: 'chart'   },
]

export default function DashboardGeneral() {
  const [tab, setTab] = useState('clientes')

  return (
    <div>
      <div className="tabs">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-num">2.{i + 1}</span>
            <Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="fade-in" key={tab}>
        {tab === 'clientes' && <TabClientes />}
        {tab === 'cobrar'   && <TabCobrar />}
        {tab === 'kpis'     && <TabKPIs />}
      </div>
    </div>
  )
}

import { Icon } from './Icons'
import { useToast } from './ui.jsx'

const NAV = [
  { id: 'dashboard',   num: '01', label: 'Dashboard General',   icon: 'dashboard' },
  { id: 'suministro',  num: '02', label: 'Suministro',          icon: 'package'   },
  { id: 'incidencias', num: '03', label: 'Incidencias',         icon: 'alert'     },
  { id: 'personal',    num: '04', label: 'Personal',            icon: 'users'     },
]

const SECONDARY = [
  { id: 'calendar',  label: 'Calendario',    icon: 'calendar', sub: 'Turnos · rotaciones · pagos' },
  { id: 'docs',      label: 'Documentos',    icon: 'file',     sub: 'Contratos · actas · policies' },
  { id: 'int',       label: 'Integraciones', icon: 'plug',     sub: 'SAE · NOI · WhatsApp' },
  { id: 'cfg',       label: 'Configuración', icon: 'settings', sub: 'Permisos · branding · env' },
]

export default function Sidebar({ active, onChange }) {
  const toast = useToast()
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark"><span>M</span></div>
        <div className="brand-text">
          <p className="brand-name">MARPLUS</p>
          <div className="brand-sub">Operations Hub</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Operación</div>
        {NAV.map(item => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            <span className="nav-num">{item.num}</span>
            <Icon name={item.icon} size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Sistema</div>
        {SECONDARY.map(item => (
          <button
            key={item.id}
            className="nav-item"
            type="button"
            onClick={() => toast.info(item.label, item.sub + ' · próximamente')}
          >
            <span className="nav-num"></span>
            <Icon name={item.icon} size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div
          className="connection-status"
          onClick={() => toast.success('Integraciones', 'SAE · NOI · WhatsApp · todo verde')}
          style={{ cursor: 'pointer' }}
        >
          <div className="conn-pulse"></div>
          <div className="conn-text">SAE · NOI · WhatsApp</div>
        </div>
        <div className="axon-tag">
          <span>Powered by Axon</span>
          <span className="axon-tag-dot"></span>
        </div>
      </div>
    </aside>
  )
}

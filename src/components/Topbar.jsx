import { useMemo, useRef, useState, useEffect } from 'react'
import { Icon } from './Icons'
import { DropdownMenu, Modal, Popover, useToast } from './ui.jsx'
import { CLIENTES, EMPLEADOS } from '../data.js'

// Global index of searchable entities across the demo
const SEARCH_INDEX = [
  ...CLIENTES.map(c => ({ type: 'Cliente', label: c.nombre, page: 'dashboard' })),
  { type: 'Solicitud', label: 'SOL-2847 · Hospital Ángeles',     page: 'suministro' },
  { type: 'Solicitud', label: 'SOL-2846 · Torre BBVA',           page: 'suministro' },
  { type: 'Solicitud', label: 'SOL-2845 · Plaza Antara',         page: 'suministro' },
  { type: 'Solicitud', label: 'SOL-2844 · Citibanamex',          page: 'suministro' },
  { type: 'Solicitud', label: 'SOL-2843 · WeWork (sobre presup.)', page: 'suministro' },
  { type: 'Solicitud', label: 'SOL-2842 · Anáhuac',              page: 'suministro' },
  ...EMPLEADOS.map(e => ({ type: 'Empleado', label: e.nombre, page: 'personal' })),
  { type: 'Equipo',   label: 'EQ-1184 · Aspiradora Karcher T 12/1', page: 'incidencias' },
  { type: 'Equipo',   label: 'EQ-1183 · Pulidora Tornado BR-1700',  page: 'incidencias' },
  { type: 'Equipo',   label: 'EQ-1182 · Hidrolavadora K5',          page: 'incidencias' },
  { type: 'Incidente', label: 'IN-2884 · Falta Luis Vázquez',       page: 'incidencias' },
  { type: 'Incidente', label: 'IN-2883 · Retardo Ana Solano',       page: 'incidencias' },
  { type: 'Incidente', label: 'IN-2882 · Accidente Pedro Núñez',    page: 'incidencias' },
  { type: 'Factura',  label: 'F-8821 · Hospital Ángeles · $264.5K', page: 'dashboard' },
  { type: 'Factura',  label: 'F-8801 · Plaza Antara · vencida 15d', page: 'dashboard' },
  { type: 'Factura',  label: 'F-8745 · WeWork · vencida 42d',       page: 'dashboard' },
  { type: 'Factura',  label: 'F-8702 · Anáhuac · vencida 64d',      page: 'dashboard' },
  { type: 'Sección', label: 'Cuentas por cobrar', page: 'dashboard' },
  { type: 'Sección', label: 'Suplencias del día', page: 'personal' },
  { type: 'Sección', label: 'Pre-nómina NOI · 134 recibos', page: 'personal' },
  { type: 'Sección', label: 'Alertas presupuestales', page: 'suministro' },
  { type: 'Sección', label: 'Reportes de equipo', page: 'incidencias' },
]

const NOTIFS_INITIAL = [
  { id: 1, title: 'Solicitud SOL-2843 superó presupuesto (102%)', time: 'hace 4 min', unread: true, page: 'suministro' },
  { id: 2, title: 'Luis Vázquez faltó hoy · cubrir WeWork', time: 'hace 18 min', unread: true, page: 'personal' },
  { id: 3, title: 'Plaza Antara · factura F-8801 vencida 15d', time: 'hace 42 min', unread: true, page: 'dashboard' },
  { id: 4, title: 'Reporte EQ-1184 pendiente de revisión', time: 'hace 1h', unread: false, page: 'incidencias' },
  { id: 5, title: 'NOI sincronizado · 6 empleados listos', time: 'hace 2h', unread: false, page: 'personal' },
]

export default function Topbar({ pageLabel, pageEyebrow, onNavigate }) {
  const toast = useToast()
  const [q, setQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchWrapRef = useRef(null)

  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef(null)
  const [notifs, setNotifs] = useState(NOTIFS_INITIAL)
  const unread = notifs.filter(n => n.unread).length

  const [helpOpen, setHelpOpen] = useState(false)

  const results = useMemo(() => {
    if (!q.trim()) return []
    const needle = q.toLowerCase()
    return SEARCH_INDEX.filter(i => i.label.toLowerCase().includes(needle)).slice(0, 10)
  }, [q])

  const grouped = useMemo(() => {
    const map = {}
    results.forEach(r => { (map[r.type] ||= []).push(r) })
    return map
  }, [results])

  useEffect(() => {
    const onDoc = e => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchWrapRef.current?.querySelector('input')?.focus()
        setSearchOpen(true)
      }
      if (e.key === '?' && !e.target.matches('input, textarea, select')) {
        setHelpOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const goto = (r) => {
    onNavigate?.(r.page)
    setQ('')
    setSearchOpen(false)
    toast.info('Navegación', `Abriendo ${r.label}`)
  }

  const openNotif = (n) => {
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))
    onNavigate?.(n.page)
    setBellOpen(false)
  }

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })))
    toast.success('Notificaciones', 'Marcadas como leídas')
  }

  return (
    <header className="topbar">
      <div className="topbar-page">
        <div className="topbar-eyebrow">{pageEyebrow}</div>
        <h1 className="topbar-title">{pageLabel}</h1>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search" ref={searchWrapRef}>
          <input
            className="input input-search"
            placeholder="Buscar cliente, solicitud, empleado…"
            value={q}
            onChange={e => { setQ(e.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
          />
          <kbd className="search-kbd mono">⌘K</kbd>
          {searchOpen && q.trim() && (
            <div className="search-results">
              {results.length === 0 ? (
                <div className="search-empty">Sin resultados para "{q}"</div>
              ) : (
                Object.entries(grouped).map(([type, list]) => (
                  <div key={type}>
                    <div className="search-group-label">{type}</div>
                    {list.map((r, i) => (
                      <div key={i} className="search-item" onClick={() => goto(r)}>
                        <span className="search-item-label">{r.label}</span>
                        <span className="search-item-type">{r.type}</span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="bell-wrap" ref={bellRef}>
          <button
            className={`btn-icon ${bellOpen ? 'active' : ''}`}
            aria-label="Notificaciones"
            onClick={() => setBellOpen(o => !o)}
          >
            <Icon name="bell" size={16} />
            {unread > 0 && <span className="bell-badge">{unread}</span>}
          </button>
          <Popover open={bellOpen} onClose={() => setBellOpen(false)} anchor={bellRef} width={340}>
            <div className="popover-head">
              <div className="popover-title">Notificaciones · {unread} nuevas</div>
              {unread > 0 && (
                <button className="toast-action" onClick={markAllRead}>Marcar leídas</button>
              )}
            </div>
            <div className="popover-list">
              {notifs.length === 0 ? (
                <div className="empty-state">Sin notificaciones</div>
              ) : (
                notifs.map(n => (
                  <div key={n.id} className="notif-item" onClick={() => openNotif(n)}>
                    <div className={`notif-dot ${n.unread ? 'unread' : 'read'}`}></div>
                    <div className="notif-body">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-meta">{n.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Popover>
        </div>

        <button className="btn-icon" aria-label="Ayuda" onClick={() => setHelpOpen(true)}>
          <Icon name="help" size={16} />
        </button>

        <DropdownMenu
          align="right"
          trigger={
            <div className="user-chip">
              <div className="user-avatar">MT</div>
              <span className="user-name">M. Trachtman</span>
            </div>
          }
          items={[
            { icon: 'user', label: 'Mi perfil', onClick: () => toast.info('Perfil', 'Próximamente · vista de perfil') },
            { icon: 'settings', label: 'Preferencias', onClick: () => toast.info('Preferencias', 'Abriendo configuración…') },
            { icon: 'refresh', label: 'Sincronizar todo', hint: '⌘R', onClick: () => toast.success('Sincronización', 'SAE · NOI · WhatsApp actualizados') },
            { divider: true },
            { icon: 'x', label: 'Cerrar sesión', danger: true, onClick: () => toast.warn('Sesión', 'Demo · no hay sesión real') },
          ]}
        />
      </div>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Atajos y ayuda" eyebrow="Marplus Ops Hub">
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <div className="card-eyebrow" style={{ marginBottom: 8 }}>Atajos de teclado</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {[
                ['⌘K / Ctrl+K', 'Búsqueda global'],
                ['?', 'Abrir esta ayuda'],
                ['Esc', 'Cerrar modales y popovers'],
                ['⌘R', 'Sincronizar integraciones'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--ink-100)' }}>
                  <span className="mono" style={{ fontSize: 11, padding: '3px 8px', background: 'var(--ink-100)', borderRadius: 4, fontWeight: 500 }}>{k}</span>
                  <span style={{ fontSize: 13, color: 'var(--ink-700)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="card-eyebrow" style={{ marginBottom: 6 }}>Integraciones activas</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="tag blue">SAE · Compras</span>
              <span className="tag blue">Aspel NOI · Nómina</span>
              <span className="tag blue">WhatsApp Business</span>
              <span className="tag muted">Axon AI Ops</span>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-600)', margin: 0, lineHeight: 1.5 }}>
            Demo interactivo · todos los cambios viven en memoria de sesión.
          </p>
        </div>
      </Modal>
    </header>
  )
}

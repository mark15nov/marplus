import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icons'
import { Modal, DropdownMenu, useToast } from '../components/ui.jsx'
import { EmpleadoProfileModal } from '../components/EmpleadoProfile.jsx'
import { EMPLEADOS as EMPLEADOS_DATA, ZONAS, comodines as getComodines, nominaTotal, personalByCliente, CLIENTES } from '../data.js'
import '../styles/personal.css'

const FALTAS_INICIALES = [
  { id: 'f1', persona: 'Luis Vázquez Martínez',  cliente: 'WeWork Insurgentes',  zona: 'sur',     turno: 'Matutino',  tipo: 'falta', suplente: null },
  { id: 'f2', persona: 'Ana Solano Ibarra',      cliente: 'Plaza Antara',        zona: 'poniente', turno: 'Vespertino', tipo: 'incapacidad', suplente: null },
  { id: 'f3', persona: 'Pedro Núñez Ayala',      cliente: 'Hospital Ángeles',    zona: 'centro',  turno: 'Matutino',  tipo: 'permiso', suplente: null },
  { id: 'f4', persona: 'Brenda García Torres',   cliente: 'Hospital Ángeles',    zona: 'centro',  turno: 'Matutino',  tipo: 'falta', suplente: null },
  { id: 'f5', persona: 'Jorge Luna Ortega',      cliente: 'Plaza Antara',        zona: 'poniente', turno: 'Nocturno',  tipo: 'incapacidad', suplente: null },
]

export default function Personal() {
  const toast = useToast()
  const [view, setView] = useState('suplencias')
  const [faltas, setFaltas] = useState(FALTAS_INICIALES)
  const [empleados, setEmpleados] = useState(EMPLEADOS_DATA)
  const [draggedComodin, setDraggedComodin] = useState(null)
  const [dragOverFalta, setDragOverFalta] = useState(null)

  const comodinesList = useMemo(() => getComodines(), [])

  const handleAsignar = (faltaId, comodin) => {
    setFaltas(prev => prev.map(f => f.id === faltaId ? { ...f, suplente: comodin } : f))
    const falta = faltas.find(f => f.id === faltaId)
    if (falta) toast.success('Suplente asignado', `${comodin.nombre} cubre a ${falta.persona}`)
  }

  const handleQuitar = (faltaId) => {
    setFaltas(prev => prev.map(f => f.id === faltaId ? { ...f, suplente: null } : f))
    toast.info('Asignación removida', 'Suplente liberado')
  }

  const handleAsignarAuto = () => {
    const pendientes = faltas.filter(f => !f.suplente).length
    if (pendientes === 0) {
      toast.info('Todo cubierto', 'No hay faltas pendientes')
      return
    }
    setFaltas(prev => prev.map(f => {
      if (f.suplente) return f
      const candidato = comodinesList
        .filter(c => c.zona === f.zona)
        .filter(c => !prev.find(p => p.suplente?.id === c.id))
        .sort((a, b) => b.rating - a.rating)[0] || null
      return { ...f, suplente: candidato }
    }))
    toast.success('Asignación automática', `${pendientes} ${pendientes === 1 ? 'suplente asignado' : 'suplentes asignados'} por zona y rating`)
  }

  return (
    <div>
      <div className="tabs">
        <button className={`tab ${view === 'suplencias' ? 'active' : ''}`} onClick={() => setView('suplencias')}>
          <Icon name="refresh" size={14} /> Suplencias
        </button>
        <button className={`tab ${view === 'plantilla' ? 'active' : ''}`} onClick={() => setView('plantilla')}>
          <Icon name="users" size={14} /> Plantilla
        </button>
        <button className={`tab ${view === 'nomina' ? 'active' : ''}`} onClick={() => setView('nomina')}>
          <Icon name="cash" size={14} /> Nómina · NOI
        </button>
      </div>

      <div className="fade-in" key={view}>
        {view === 'suplencias' && (
          <SuplenciasView
            faltas={faltas}
            comodines={comodinesList}
            zonas={ZONAS}
            draggedComodin={draggedComodin}
            setDraggedComodin={setDraggedComodin}
            dragOverFalta={dragOverFalta}
            setDragOverFalta={setDragOverFalta}
            onAsignar={handleAsignar}
            onQuitar={handleQuitar}
            onAuto={handleAsignarAuto}
          />
        )}
        {view === 'plantilla' && <PlantillaView empleados={empleados} setEmpleados={setEmpleados} />}
        {view === 'nomina' && <NominaView empleados={empleados} />}
      </div>
    </div>
  )
}

function SuplenciasView({ faltas, comodines, zonas, draggedComodin, setDraggedComodin, dragOverFalta, setDragOverFalta, onAsignar, onQuitar, onAuto }) {
  const [search, setSearch] = useState('')
  const cubiertas = faltas.filter(f => f.suplente).length

  return (
    <div className="page-grid" style={{ gap: 16 }}>
      <div className="suplencia-header">
        <div className="page-grid grid-3" style={{ flex: 1 }}>
          <div className="kpi">
            <div className="kpi-label">Faltas hoy</div>
            <div className="kpi-value">{faltas.length}</div>
            <div className="kpi-meta"><span className="kpi-trend down">↓ 2</span> vs promedio</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Cubiertas</div>
            <div className="kpi-value">{cubiertas}<span className="kpi-unit">/{faltas.length}</span></div>
            <div className="kpi-meta">{Math.round((cubiertas / faltas.length) * 100)}% asignación</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Comodines disponibles</div>
            <div className="kpi-value">{comodines.length - cubiertas}</div>
            <div className="kpi-meta">en {zonas.length} zonas</div>
          </div>
        </div>
        <button className="btn btn-primary" style={{ height: 'auto', padding: '14px 22px' }} onClick={onAuto}>
          <Icon name="sparkles" size={14} /> Asignar automático por zona
        </button>
      </div>

      <div className="suplencia-board">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Hoy · 23 Abril</div>
              <h3 className="card-title">Faltas a cubrir</h3>
            </div>
            <span className="tag mono blue">Arrastra comodines aquí →</span>
          </div>
          <div className="faltas-stack">
            {faltas.map(f => (
              <div
                key={f.id}
                className={`falta-card ${dragOverFalta === f.id ? 'drag-over' : ''} ${f.suplente ? 'covered' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverFalta(f.id) }}
                onDragLeave={() => setDragOverFalta(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  if (draggedComodin) onAsignar(f.id, draggedComodin)
                  setDragOverFalta(null)
                  setDraggedComodin(null)
                }}
              >
                <div className="falta-main">
                  <div className="falta-persona">
                    <div className="falta-avatar">{f.persona.split(' ').map(w => w[0]).slice(0,2).join('')}</div>
                    <div>
                      <div className="falta-nombre">{f.persona}</div>
                      <div className="falta-meta mono">
                        <span><Icon name="pin" size={10} /> {f.cliente}</span>
                        <span>· Zona {f.zona}</span>
                        <span>· {f.turno}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`tag ${f.tipo === 'falta' ? 'bad' : f.tipo === 'incapacidad' ? 'warn' : 'info'}`}>
                    {f.tipo}
                  </span>
                </div>

                <div className="falta-arrow">
                  <Icon name="arrow_right" size={14} />
                </div>

                <div className="falta-slot">
                  {f.suplente ? (
                    <div className="suplente-chip">
                      <div className="comodin-avatar small">{f.suplente.nombre.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="suplente-nombre">{f.suplente.nombre}</div>
                        <div className="suplente-meta mono">★ {f.suplente.rating} · {f.suplente.dispo}</div>
                      </div>
                      <button className="btn-icon" onClick={() => onQuitar(f.id)}>
                        <Icon name="x" size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="suplente-empty">
                      <Icon name="plus" size={14} color="var(--ink-400)" />
                      <span>Soltar comodín aquí</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Banco</div>
              <h3 className="card-title">Comodines disponibles · {comodines.length}</h3>
            </div>
            <input
              className="input"
              placeholder="Buscar..."
              style={{ width: 140, height: 30 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="comodines-list">
            {zonas.map(z => {
              const lista = comodines.filter(c => c.zona === z.id && c.nombre.toLowerCase().includes(search.toLowerCase()))
              if (!lista.length) return null
              return (
                <div key={z.id} className="comodin-zona">
                  <div className="comodin-zona-header mono">
                    <span>{z.nombre}</span>
                    <span className="zona-count">{lista.length}</span>
                  </div>
                  {lista.map(c => {
                    const asignado = faltas.find(f => f.suplente?.id === c.id)
                    return (
                      <div
                        key={c.id}
                        draggable={!asignado}
                        onDragStart={() => setDraggedComodin(c)}
                        onDragEnd={() => setDraggedComodin(null)}
                        className={`comodin-card ${asignado ? 'assigned' : 'draggable'} ${draggedComodin?.id === c.id ? 'dragging' : ''}`}
                      >
                        <div className="drag-handle">
                          <span></span><span></span><span></span>
                          <span></span><span></span><span></span>
                        </div>
                        <div className="comodin-avatar">{c.nombre.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="comodin-nombre">{c.nombre}</div>
                          <div className="comodin-meta mono">★ {c.rating} · {c.dispo}</div>
                        </div>
                        {asignado && <span className="tag ok" style={{ fontSize: 9 }}>Asig.</span>}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlantillaView({ empleados, setEmpleados }) {
  const toast = useToast()
  const [newOpen, setNewOpen] = useState(false)
  const [empleadoOpen, setEmpleadoOpen] = useState(null)
  const [filter, setFilter] = useState({ zona: 'todas', puesto: 'todos', cliente: 'todos' })
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 25

  const filtered = empleados.filter(e =>
    (filter.zona === 'todas' || e.zona === filter.zona) &&
    (filter.puesto === 'todos' || e.puesto === filter.puesto) &&
    (filter.cliente === 'todos' || e.cliente === filter.cliente || (filter.cliente === 'sin-cliente' && !e.cliente)) &&
    (!search || e.nombre.toLowerCase().includes(search.toLowerCase()))
  )

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const create = (data) => {
    setEmpleados(prev => [{ ...data, antiguedad: '0.0 años', rating: 4.0 }, ...prev])
    setPage(1)
    toast.success('Empleado agregado', `${data.nombre} · ${data.puesto} · Zona ${data.zona}`)
  }

  const exportCSV = () => {
    const header = 'Nombre,Puesto,Cliente,Zona,Turno,Antigüedad,Sueldo\n'
    const rows = filtered.map(e => `${e.nombre},${e.puesto},${e.cliente || '—'},${e.zona},${e.turno},${e.antiguedad},${e.sueldo}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plantilla-marplus-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Plantilla exportada', `${filtered.length} empleados · CSV`)
  }

  const removeEmpleado = (nombre) => {
    setEmpleados(prev => prev.filter(e => e.nombre !== nombre))
    toast.warn('Empleado removido', nombre)
  }

  const getClienteNombre = (cid) => CLIENTES.find(c => c.id === cid)?.nombre || '—'

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-eyebrow">Recursos humanos</div>
          <h3 className="card-title">{filtered.length} mostrados · {empleados.length} empleados totales</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, position: 'relative', alignItems: 'center' }}>
          <input
            className="input input-search"
            placeholder="Buscar nombre…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: 200 }}
          />
          <button
            className={`btn btn-ghost ${(filter.zona !== 'todas' || filter.puesto !== 'todos' || filter.cliente !== 'todos') ? 'active' : ''}`}
            onClick={() => setFilterOpen(o => !o)}
          >
            <Icon name="filter" size={14} /> Filtrar
          </button>
          {filterOpen && (
            <div className="filter-panel">
              <div className="filter-panel-title">Cliente</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {[['todos', 'Todos'], ...CLIENTES.map(c => [c.id, c.nombre.split(' ').slice(0, 2).join(' ')]), ['sin-cliente', 'Sin cliente']].map(([k, l]) => (
                  <button key={k} onClick={() => { setFilter(f => ({ ...f, cliente: k })); setPage(1) }}
                    className={`tag ${filter.cliente === k ? 'blue' : 'muted'}`}
                    style={{ cursor: 'pointer' }}
                  >{l}</button>
                ))}
              </div>
              <div className="filter-panel-title">Zona</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {['todas', ...ZONAS.map(z => z.id)].map(z => (
                  <button key={z} onClick={() => { setFilter(f => ({ ...f, zona: z })); setPage(1) }}
                    className={`tag ${filter.zona === z ? 'blue' : 'muted'}`}
                    style={{ cursor: 'pointer', textTransform: 'capitalize' }}
                  >{z}</button>
                ))}
              </div>
              <div className="filter-panel-title">Puesto</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['todos', 'Supervisor', 'Supervisora', 'Operativo', 'Operativa', 'Comodín', 'Dirección'].map(p => (
                  <button key={p} onClick={() => { setFilter(f => ({ ...f, puesto: p })); setPage(1) }}
                    className={`tag ${filter.puesto === p ? 'blue' : 'muted'}`}
                    style={{ cursor: 'pointer' }}
                  >{p}</button>
                ))}
              </div>
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: 12 }}
                onClick={() => { setFilter({ zona: 'todas', puesto: 'todos', cliente: 'todos' }); setFilterOpen(false); setPage(1) }}
              >Limpiar</button>
            </div>
          )}
          <button className="btn btn-ghost" onClick={exportCSV}><Icon name="download" size={14} /></button>
          <button className="btn btn-primary" onClick={() => setNewOpen(true)}>
            <Icon name="plus" size={14} /> Empleado
          </button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">Sin empleados con estos filtros</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Puesto</th>
                <th>Cliente</th>
                <th>Zona</th>
                <th>Turno</th>
                <th>Antigüedad</th>
                <th>Sueldo MXN</th>
                <th>NOI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paged.map(e => (
                <tr
                  key={e.nombre}
                  onClick={() => setEmpleadoOpen(e)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="comodin-avatar small">{e.nombre.split(' ').map(w => w[0]).slice(0,2).join('')}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{e.nombre}</div>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 2 }}>★ {e.rating}</div>
                      </div>
                    </div>
                  </td>
                  <td>{e.puesto}</td>
                  <td style={{ fontSize: 12 }}>{getClienteNombre(e.cliente)}</td>
                  <td><span className="tag muted" style={{ textTransform: 'capitalize' }}>{e.zona}</span></td>
                  <td className="mono" style={{ fontSize: 12 }}>{e.turno}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{e.antiguedad}</td>
                  <td className="mono">${e.sueldo.toLocaleString()}</td>
                  <td><span className="dot" style={{ background: 'var(--ok)' }} title="Sincronizado con NOI"></span></td>
                  <td onClick={(ev) => ev.stopPropagation()}>
                    <DropdownMenu
                      trigger={<button className="btn-icon"><Icon name="more" size={14} /></button>}
                      items={[
                        { icon: 'user', label: 'Ver perfil', onClick: () => setEmpleadoOpen(e) },
                        { icon: 'cash', label: 'Detalle de nómina', onClick: () => toast.info('Nómina', `${e.nombre} · $${e.sueldo.toLocaleString()} MXN base`) },
                        { icon: 'refresh', label: 'Sincronizar con NOI', onClick: () => toast.success('NOI', `${e.nombre} re-sincronizado`) },
                        { divider: true },
                        { icon: 'x', label: 'Dar de baja', danger: true, onClick: () => removeEmpleado(e.nombre) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--ink-100)' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ height: 28, padding: '0 10px' }}>← Anterior</button>
                <div className="mono" style={{ fontSize: 12, padding: '0 12px', display: 'flex', alignItems: 'center', color: 'var(--ink-700)' }}>{page} / {totalPages}</div>
                <button className="btn btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ height: 28, padding: '0 10px' }}>Siguiente →</button>
              </div>
            </div>
          )}
        </>
      )}

      <NewEmpleadoModal open={newOpen} onClose={() => setNewOpen(false)} onCreate={create} />
      <EmpleadoProfileModal empleado={empleadoOpen} open={!!empleadoOpen} onClose={() => setEmpleadoOpen(null)} />
    </div>
  )
}

function NewEmpleadoModal({ open, onClose, onCreate }) {
  const [data, setData] = useState({ nombre: '', puesto: 'Operativo', zona: 'centro', cliente: '', turno: 'Matutino', sueldo: 8200, desde: String(new Date().getFullYear()) })
  useEffect(() => { if (open) setData({ nombre: '', puesto: 'Operativo', zona: 'centro', cliente: '', turno: 'Matutino', sueldo: 8200, desde: String(new Date().getFullYear()) }) }, [open])
  const valid = data.nombre.trim().length >= 3

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo empleado"
      eyebrow="Plantilla"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn btn-primary"
            disabled={!valid}
            onClick={() => { onCreate({ ...data, sueldo: parseInt(data.sueldo) || 0, cliente: data.cliente || null }); onClose() }}
          >
            <Icon name="check" size={14} /> Alta + NOI
          </button>
        </>
      }
    >
      <div className="form-row">
        <label>Nombre completo</label>
        <input
          className="input"
          placeholder="Ej. Juan Pérez López"
          value={data.nombre}
          onChange={e => setData(d => ({ ...d, nombre: e.target.value }))}
        />
      </div>
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label>Puesto</label>
          <select className="input" value={data.puesto} onChange={e => setData(d => ({ ...d, puesto: e.target.value }))}>
            {['Supervisor', 'Supervisora', 'Operativo', 'Operativa', 'Comodín'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label>Zona</label>
          <select className="input" value={data.zona} onChange={e => setData(d => ({ ...d, zona: e.target.value }))}>
            {ZONAS.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <label>Cliente asignado (vacío = comodín / sin asignar)</label>
        <select className="input" value={data.cliente} onChange={e => setData(d => ({ ...d, cliente: e.target.value }))}>
          <option value="">— Sin cliente —</option>
          {CLIENTES.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label>Turno</label>
          <select className="input" value={data.turno} onChange={e => setData(d => ({ ...d, turno: e.target.value }))}>
            {['Matutino', 'Vespertino', 'Nocturno', 'Variable'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label>Sueldo base MXN</label>
          <input className="input" type="number" value={data.sueldo} onChange={e => setData(d => ({ ...d, sueldo: e.target.value }))} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 8 }}>
        Se creará el alta y se enviará automáticamente a <strong>Aspel NOI</strong>.
      </div>
    </Modal>
  )
}

function NominaView({ empleados }) {
  const toast = useToast()
  const [syncing, setSyncing] = useState(false)
  const [sending, setSending] = useState(false)
  const [lastSync, setLastSync] = useState('hace 12 min')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clienteFilter, setClienteFilter] = useState('todos')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const filtered = clienteFilter === 'todos'
    ? empleados
    : clienteFilter === 'sin-cliente'
      ? empleados.filter(e => !e.cliente)
      : empleados.filter(e => e.cliente === clienteFilter)

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // Deterministic pseudo-random per employee, so numbers are stable across renders
  const hash = (str) => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h }

  const stats = useMemo(() => {
    let bruto = 0, dedTot = 0, bonTot = 0, descTot = 0, neto = 0
    for (const e of empleados) {
      const h = hash(e.nombre)
      const faltas = (h % 37 === 0) ? 1 : 0
      const bonos = (h % 17 === 0) ? 800 : 0
      const ded = Math.round(e.sueldo * 0.12)
      const desc = Math.round((e.sueldo / 30) * faltas)
      const n = e.sueldo - ded - desc + bonos
      bruto += e.sueldo; dedTot += ded; bonTot += bonos; descTot += desc; neto += n
    }
    return { bruto, dedTot, bonTot, descTot, neto }
  }, [empleados])

  const sync = async () => {
    setSyncing(true)
    await new Promise(r => setTimeout(r, 1200))
    setSyncing(false)
    setLastSync('hace un momento')
    toast.success('Sincronización completa', `${empleados.length} empleados actualizados desde NOI`)
  }

  const sendToNOI = async () => {
    setSending(true)
    await new Promise(r => setTimeout(r, 1400))
    setSending(false)
    setConfirmOpen(false)
    toast.success('Pre-nómina enviada', `${empleados.length} recibos a Aspel NOI`, {
      duration: 5000,
      action: { label: 'Ver NOI', onClick: () => toast.info('NOI', 'Integración demo · ver logs') }
    })
  }

  const getClienteNombre = (cid) => CLIENTES.find(c => c.id === cid)?.nombre || '—'

  return (
    <div className="page-grid" style={{ gap: 16 }}>
      <div className="page-grid grid-4">
        <div className="kpi">
          <div className="kpi-label">Nómina bruta</div>
          <div className="kpi-value">${(stats.bruto / 1000).toFixed(1)}<span className="kpi-unit">K</span></div>
          <div className="kpi-meta">{empleados.length} empleados</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Neto a pagar</div>
          <div className="kpi-value">${(stats.neto / 1000).toFixed(1)}<span className="kpi-unit">K</span></div>
          <div className="kpi-meta">después de deducciones</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Próximo pago</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>30 Abril</div>
          <div className="kpi-meta">en 7 días</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Estado NOI</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <div className="conn-pulse"></div>
            <span style={{ fontSize: 18, fontWeight: 500 }}>Sincronizado</span>
          </div>
          <div className="kpi-meta mono">Última: {lastSync}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-eyebrow">Integración Aspel NOI</div>
            <h3 className="card-title">Pre-nómina del periodo · {filtered.length} empleados</h3>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              className="input"
              style={{ width: 200, height: 32, fontSize: 12 }}
              value={clienteFilter}
              onChange={e => { setClienteFilter(e.target.value); setPage(1) }}
            >
              <option value="todos">Todos los clientes</option>
              {CLIENTES.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              <option value="sin-cliente">Admin / Comodines</option>
            </select>
            <button
              className={`btn btn-ghost ${syncing ? 'loading' : ''}`}
              onClick={sync}
              disabled={syncing}
            >
              <Icon name="refresh" size={14} /> Sincronizar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setConfirmOpen(true)}
            >
              <Icon name="upload" size={14} /> Enviar a NOI
            </button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Cliente</th>
              <th>Sueldo base</th>
              <th>Faltas</th>
              <th>Bonos</th>
              <th>Deducciones</th>
              <th>Neto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(e => {
              const h = hash(e.nombre)
              const faltas = (h % 37 === 0) ? 1 : 0
              const bonos = (h % 17 === 0) ? 800 : 0
              const ded = Math.round(e.sueldo * 0.12)
              const desc = Math.round((e.sueldo / 30) * faltas)
              const neto = e.sueldo - ded - desc + bonos
              return (
                <tr key={e.nombre}>
                  <td style={{ fontWeight: 500 }}>{e.nombre}</td>
                  <td style={{ fontSize: 12 }}>{getClienteNombre(e.cliente)}</td>
                  <td className="mono">${e.sueldo.toLocaleString()}</td>
                  <td className="mono">{faltas > 0 ? <span style={{color: 'var(--bad)'}}>−${desc.toFixed(0)}</span> : '—'}</td>
                  <td className="mono">{bonos > 0 ? <span style={{color: 'var(--ok)'}}>+${bonos}</span> : '—'}</td>
                  <td className="mono">−${ded.toFixed(0)}</td>
                  <td className="mono" style={{ fontWeight: 600 }}>${neto.toLocaleString()}</td>
                  <td><span className="tag ok">Listo</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--ink-100)' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ height: 28, padding: '0 10px' }}>← Anterior</button>
              <div className="mono" style={{ fontSize: 12, padding: '0 12px', display: 'flex', alignItems: 'center', color: 'var(--ink-700)' }}>{page} / {totalPages}</div>
              <button className="btn btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ height: 28, padding: '0 10px' }}>Siguiente →</button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Enviar pre-nómina a Aspel NOI"
        eyebrow="Integración"
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirmOpen(false)} disabled={sending}>Cancelar</button>
            <button className={`btn btn-primary ${sending ? 'loading' : ''}`} onClick={sendToNOI} disabled={sending}>
              <Icon name="upload" size={14} /> Enviar {empleados.length} recibos
            </button>
          </>
        }
      >
        <p style={{ margin: '0 0 12px', fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.55 }}>
          Se enviarán <strong>{empleados.length} recibos</strong> al sistema Aspel NOI por un total neto de
          <strong> ${stats.neto.toLocaleString()} MXN</strong>.
        </p>
        <div style={{ padding: 10, background: 'var(--warn-soft)', color: '#92400e', borderRadius: 8, fontSize: 12 }}>
          <Icon name="alert" size={12} /> Este proceso no se puede deshacer una vez que NOI confirma recepción.
        </div>
      </Modal>
    </div>
  )
}

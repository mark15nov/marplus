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
  const [nominaFocus, setNominaFocus] = useState(null)

  const verNomina = (emp) => {
    setNominaFocus(emp)
    setView('nomina')
  }

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
        {view === 'plantilla' && <PlantillaView empleados={empleados} setEmpleados={setEmpleados} onVerNomina={verNomina} />}
        {view === 'nomina' && <NominaView empleados={empleados} focus={nominaFocus} setFocus={setNominaFocus} />}
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

function PlantillaView({ empleados, setEmpleados, onVerNomina }) {
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
                        { icon: 'cash', label: 'Detalle de nómina', onClick: () => onVerNomina(e) },
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

// Tarifa ISR semanal · Art. 96 LISR (DOF 2024, vigente 2026)
const ISR_TARIFA_SEMANAL = [
  { lim: 171.78,    cf: 0,         tasa: 0.0192 },
  { lim: 1458.03,   cf: 3.29,      tasa: 0.0640 },
  { lim: 2562.35,   cf: 85.61,     tasa: 0.1088 },
  { lim: 2978.64,   cf: 205.80,    tasa: 0.1600 },
  { lim: 3566.18,   cf: 272.37,    tasa: 0.1792 },
  { lim: 7192.64,   cf: 377.65,    tasa: 0.2136 },
  { lim: 11336.57,  cf: 1152.20,   tasa: 0.2352 },
  { lim: 21628.83,  cf: 2127.58,   tasa: 0.3000 },
  { lim: 28838.45,  cf: 5215.27,   tasa: 0.3200 },
  { lim: 86515.39,  cf: 7522.34,   tasa: 0.3400 },
  { lim: Infinity,  cf: 27123.18,  tasa: 0.3500 },
]

// Subsidio para el empleo · semanal (aprox. tabla SAT)
const subsidioSemanal = (gravado) => {
  if (gravado <= 407.02)  return 93.66
  if (gravado <= 610.53)  return 93.66
  if (gravado <= 799.69)  return 93.66
  if (gravado <= 814.66)  return 93.66
  if (gravado <= 1023.75) return 90.44
  if (gravado <= 1086.85) return 88.06
  if (gravado <= 1228.50) return 81.55
  if (gravado <= 1633.04) return 74.83
  if (gravado <= 1771.74) return 67.83
  if (gravado <= 2018.83) return 58.38
  return 0
}

const calcISRSemanal = (gravado) => {
  const t = ISR_TARIFA_SEMANAL.find(b => gravado <= b.lim)
  if (!t) return 0
  const li = ISR_TARIFA_SEMANAL[ISR_TARIFA_SEMANAL.indexOf(t) - 1]?.lim ?? 0.01
  return t.cf + (gravado - li) * t.tasa
}

const UMA_DIARIA_2026 = 113.07 // proyección 2026 (UMA 2025: 113.07)

const calcNominaSemanal = (sueldoMensual) => {
  const sueldoDiario = sueldoMensual / 30
  // Factor integración: aguinaldo 15 días / 365 + prima vacacional 25% × 6 días / 365 = 0.04521 → 1.0452
  const factorIntegracion = 1.0452
  const sdi = sueldoDiario * factorIntegracion
  const diasSemana = 7

  // Percepciones
  const sueldoSemanal = sueldoDiario * diasSemana
  const totalPercepciones = sueldoSemanal

  // Cuotas IMSS empleado (semanal, sobre SDI tope 25 UMA)
  const sdiTopado = Math.min(sdi, UMA_DIARIA_2026 * 25)
  const baseSemanalSDI = sdiTopado * diasSemana
  const excedente3UMA = Math.max(0, sdiTopado - UMA_DIARIA_2026 * 3) * diasSemana
  const imssEspecieExc = excedente3UMA * 0.0040
  const imssDinero     = baseSemanalSDI * 0.0025
  const imssInvalidez  = baseSemanalSDI * 0.00625
  const imssCesantia   = baseSemanalSDI * 0.01125
  const imssTotal = imssEspecieExc + imssDinero + imssInvalidez + imssCesantia

  // ISR semanal sobre sueldo gravado
  const isr = calcISRSemanal(sueldoSemanal)
  const subsidio = subsidioSemanal(sueldoSemanal)
  const isrNeto = Math.max(0, isr - subsidio)
  const subsidioPagar = Math.max(0, subsidio - isr)

  const totalDeducciones = imssTotal + isrNeto
  const neto = totalPercepciones - totalDeducciones + subsidioPagar

  return {
    sueldoDiario, sdi, sueldoSemanal, totalPercepciones,
    imssEspecieExc, imssDinero, imssInvalidez, imssCesantia, imssTotal,
    isr, subsidio, isrNeto, subsidioPagar,
    totalDeducciones, neto,
  }
}

function NominaView({ empleados, focus, setFocus }) {
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

      {focus && <DetalleNominaSemanal empleado={focus} onClose={() => setFocus(null)} getClienteNombre={getClienteNombre} />}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-eyebrow">Histórico de pagos</div>
            <h3 className="card-title">Pagos semanales por empleado · {filtered.length}</h3>
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
        <div>
          {paged.map(e => (
            <EmpleadoHistorialRow
              key={e.nombre}
              empleado={e}
              getClienteNombre={getClienteNombre}
              onClick={() => { setFocus(e); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              hash={hash}
            />
          ))}
        </div>
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

function generarHistorialPagos(empleado, baseNeto, count, hashFn) {
  const h = hashFn(empleado.nombre)
  const today = new Date()
  // Domingo de la semana pasada como último periodo cerrado
  const dow = today.getDay() // 0 dom – 6 sáb
  const lastSunday = new Date(today)
  lastSunday.setDate(today.getDate() - (dow === 0 ? 7 : dow))
  const history = []
  for (let i = 0; i < count; i++) {
    const sunday = new Date(lastSunday)
    sunday.setDate(lastSunday.getDate() - i * 7)
    const monday = new Date(sunday)
    monday.setDate(sunday.getDate() - 6)
    const swing = (((h >> i) & 0xff) / 255) * 0.10 - 0.05  // ±5%
    const faltaProb = ((h >> (i + 3)) % 23 === 0)
    const bonoProb  = ((h >> (i + 5)) % 11 === 0)
    const faltaDesc = faltaProb ? Math.round(empleado.sueldo / 30) : 0
    const bono = bonoProb ? 800 : 0
    const neto = Math.round(baseNeto * (1 + swing) - faltaDesc + bono)
    history.push({ monday, sunday, neto, falta: faltaProb, bono: bonoProb })
  }
  return history.reverse()
}

function EmpleadoHistorialRow({ empleado, getClienteNombre, onClick, hash }) {
  const baseNomina = useMemo(() => calcNominaSemanal(empleado.sueldo), [empleado.sueldo])
  const historia = useMemo(() => generarHistorialPagos(empleado, baseNomina.neto, 8, hash), [empleado, baseNomina.neto, hash])
  const ultimo = historia[historia.length - 1]
  const max = Math.max(...historia.map(h => h.neto))
  const min = Math.min(...historia.map(h => h.neto))
  const range = Math.max(1, max - min)
  const initials = empleado.nombre.split(' ').slice(0, 2).map(w => w[0]).join('')
  const fmtMonto = (v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
  const fmtFecha = (d) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })

  return (
    <div className="empleado-historial-row" onClick={onClick}>
      <div className="empleado-historial-id">
        <div className="empleado-historial-avatar">{initials}</div>
        <div>
          <div className="empleado-historial-nombre">{empleado.nombre}</div>
          <div className="empleado-historial-sub mono">{getClienteNombre(empleado.cliente)} · {empleado.puesto}</div>
        </div>
      </div>

      <div className="historial-bars" title={`Últimas ${historia.length} semanas`}>
        {historia.map((p, i) => {
          const heightPct = 25 + ((p.neto - min) / range) * 75
          const isLatest = i === historia.length - 1
          return (
            <div key={i} className="historial-bar-wrap">
              <div
                className={`historial-bar ${p.falta ? 'has-falta' : ''} ${p.bono ? 'has-bono' : ''} ${isLatest ? 'latest' : ''}`}
                style={{ height: `${heightPct}%` }}
                title={`${fmtFecha(p.monday)}–${fmtFecha(p.sunday)} · $${p.neto.toLocaleString()}${p.falta ? ' · falta' : ''}${p.bono ? ' · bono' : ''}`}
              ></div>
              <div className="historial-bar-fecha mono">{fmtFecha(p.sunday)}</div>
            </div>
          )
        })}
      </div>

      <div className="empleado-historial-ultimo">
        <div className="card-eyebrow" style={{ fontSize: 9.5 }}>Último pago</div>
        <div className="mono" style={{ fontSize: 16, fontWeight: 600 }}>${ultimo.neto.toLocaleString()}</div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)' }}>
          {fmtFecha(ultimo.sunday)}
          {ultimo.falta && <span className="tag bad" style={{ marginLeft: 6, padding: '0 5px', fontSize: 9 }}>falta</span>}
          {ultimo.bono && <span className="tag ok" style={{ marginLeft: 6, padding: '0 5px', fontSize: 9 }}>bono</span>}
        </div>
      </div>

      <button
        className="btn btn-ghost"
        onClick={(ev) => { ev.stopPropagation(); onClick() }}
        style={{ flexShrink: 0 }}
      >
        <Icon name="cash" size={14} /> Ver detalle
      </button>
    </div>
  )
}

function generarHistorialDetallado(empleado, count, hashFn) {
  const h = hashFn(empleado.nombre)
  const today = new Date()
  const dow = today.getDay()
  const lastSunday = new Date(today)
  lastSunday.setDate(today.getDate() - (dow === 0 ? 7 : dow))
  const base = calcNominaSemanal(empleado.sueldo)
  const out = []
  for (let i = 0; i < count; i++) {
    const sunday = new Date(lastSunday)
    sunday.setDate(lastSunday.getDate() - i * 7)
    const monday = new Date(sunday)
    monday.setDate(sunday.getDate() - 6)
    const falta = ((h >> (i + 3)) % 23 === 0)
    const bono  = ((h >> (i + 5)) % 11 === 0) ? 800 : 0
    const faltaDesc = falta ? Math.round(empleado.sueldo / 30) : 0
    const neto = base.neto - faltaDesc + bono
    out.push({
      monday, sunday,
      bruto: base.sueldoSemanal,
      isr: base.isrNeto,
      imss: base.imssTotal,
      bono, falta, faltaDesc,
      neto,
    })
  }
  return out
}

function DetalleNominaSemanal({ empleado, onClose, getClienteNombre }) {
  const [tab, setTab] = useState('actual')
  const n = useMemo(() => calcNominaSemanal(empleado.sueldo), [empleado.sueldo])
  const hashFn = (str) => { let x = 0; for (let i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) >>> 0; return x }
  const historico = useMemo(() => generarHistorialDetallado(empleado, 12, hashFn), [empleado])
  const fmt = (v) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const today = new Date()
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
  const fmtDate = (d) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })

  const acumNeto = historico.reduce((s, w) => s + w.neto, 0)
  const acumBruto = historico.reduce((s, w) => s + w.bruto, 0)
  const acumDed = historico.reduce((s, w) => s + w.isr + w.imss + w.faltaDesc, 0)
  const acumBono = historico.reduce((s, w) => s + w.bono, 0)

  return (
    <div className="card nomina-detalle" style={{ borderColor: 'var(--mp-blue-500)', boxShadow: '0 0 0 4px var(--mp-blue-100), var(--shadow-sm)' }}>
      <div className="card-header">
        <div>
          <div className="card-eyebrow">Recibo de nómina semanal · LFT / LISR / LSS</div>
          <h3 className="card-title">{empleado.nombre} · {fmtDate(monday)} – {fmtDate(sunday)}</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="tag mono blue">CFDI 4.0 · Pago semanal</span>
          <button className="btn btn-ghost" onClick={onClose}>
            <Icon name="x" size={14} /> Cerrar
          </button>
        </div>
      </div>

      <div className="nomina-tabs">
        <button className={`nomina-tab ${tab === 'actual' ? 'active' : ''}`} onClick={() => setTab('actual')}>
          <Icon name="cash" size={13} /> Semana actual
        </button>
        <button className={`nomina-tab ${tab === 'historico' ? 'active' : ''}`} onClick={() => setTab('historico')}>
          <Icon name="clock" size={13} /> Histórico · {historico.length} semanas
        </button>
      </div>

      {tab === 'actual' && (
        <>
          <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, borderBottom: '1px solid var(--ink-100)' }}>
            <InfoCell label="Puesto" value={empleado.puesto} />
            <InfoCell label="Cliente" value={getClienteNombre(empleado.cliente)} />
            <InfoCell label="Antigüedad" value={empleado.antiguedad} />
            <InfoCell label="Sueldo mensual" value={fmt(empleado.sueldo)} mono />
            <InfoCell label="Sueldo diario" value={fmt(n.sueldoDiario)} mono />
            <InfoCell label="SDI (factor 1.0452)" value={fmt(n.sdi)} mono />
            <InfoCell label="Días laborados" value="7 / 7" mono />
            <InfoCell label="UMA 2026" value={`$${UMA_DIARIA_2026.toFixed(2)}`} mono />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--ink-100)' }}>
            <div style={{ padding: 18, borderRight: '1px solid var(--ink-100)' }}>
              <div className="card-eyebrow" style={{ marginBottom: 10, color: 'var(--ok)' }}>Percepciones</div>
              <NominaRow label="Sueldo semanal (7 días)" amount={n.sueldoSemanal} />
              {n.subsidioPagar > 0 && <NominaRow label="Subsidio para el empleo" amount={n.subsidioPagar} note="A favor del trabajador" />}
              <NominaRow label="Total percepciones" amount={n.totalPercepciones + n.subsidioPagar} bold />
            </div>
            <div style={{ padding: 18 }}>
              <div className="card-eyebrow" style={{ marginBottom: 10, color: 'var(--bad)' }}>Deducciones</div>
              <NominaRow label="ISR Art. 96 LISR" amount={-n.isrNeto} note={n.subsidio > 0 && n.isrNeto === 0 ? 'Cubierto por subsidio' : null} />
              <NominaRow label="IMSS · prest. dinero (0.25%)" amount={-n.imssDinero} small />
              <NominaRow label="IMSS · invalidez y vida (0.625%)" amount={-n.imssInvalidez} small />
              <NominaRow label="IMSS · cesantía y vejez (1.125%)" amount={-n.imssCesantia} small />
              {n.imssEspecieExc > 0 && <NominaRow label="IMSS · excedente 3 UMA (0.40%)" amount={-n.imssEspecieExc} small />}
              <NominaRow label="Total deducciones" amount={-n.totalDeducciones} bold />
            </div>
          </div>

          <div style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--mp-blue-50)' }}>
            <div>
              <div className="card-eyebrow">Neto a pagar · Semanal</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>
                Fundamento: Art. 25, 27, 96 LISR · Art. 25, 106, 107 LSS · Decreto Subsidio al Empleo (DOF 2024)
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--mp-blue-800)' }} className="mono">
              {fmt(n.neto)}
            </div>
          </div>
        </>
      )}

      {tab === 'historico' && (
        <>
          <table className="table nomina-historico">
            <thead>
              <tr>
                <th>Periodo</th>
                <th style={{ textAlign: 'right' }}>Bruto</th>
                <th style={{ textAlign: 'right' }}>ISR</th>
                <th style={{ textAlign: 'right' }}>IMSS</th>
                <th style={{ textAlign: 'right' }}>Faltas</th>
                <th style={{ textAlign: 'right' }}>Bonos</th>
                <th style={{ textAlign: 'right' }}>Neto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((w, i) => (
                <tr key={i}>
                  <td className="mono" style={{ fontSize: 12 }}>{fmtDate(w.monday)} – {fmtDate(w.sunday)}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{fmt(w.bruto)}</td>
                  <td className="mono" style={{ textAlign: 'right', color: 'var(--bad)' }}>−{fmt(w.isr)}</td>
                  <td className="mono" style={{ textAlign: 'right', color: 'var(--bad)' }}>−{fmt(w.imss)}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{w.falta ? <span style={{ color: 'var(--bad)' }}>−{fmt(w.faltaDesc)}</span> : '—'}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{w.bono ? <span style={{ color: 'var(--ok)' }}>+{fmt(w.bono)}</span> : '—'}</td>
                  <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(w.neto)}</td>
                  <td><span className="tag ok">Pagado</span></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--mp-blue-50)', fontWeight: 600 }}>
                <td className="mono" style={{ fontSize: 12 }}>Acumulado · {historico.length} semanas</td>
                <td className="mono" style={{ textAlign: 'right' }}>{fmt(acumBruto)}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--bad)' }}>−{fmt(acumDed - historico.reduce((s, w) => s + w.faltaDesc, 0))}</td>
                <td className="mono" style={{ textAlign: 'right' }}>—</td>
                <td className="mono" style={{ textAlign: 'right' }}>—</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--ok)' }}>+{fmt(acumBono)}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--mp-blue-800)' }}>{fmt(acumNeto)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--ink-100)', fontSize: 11, color: 'var(--ink-500)' }}>
            Histórico calculado con la misma fórmula del recibo actual · variaciones por faltas y bonos detectados en pre-nómina
          </div>
        </>
      )}
    </div>
  )
}

function InfoCell({ label, value, mono }) {
  return (
    <div>
      <div className="card-eyebrow" style={{ fontSize: 9.5 }}>{label}</div>
      <div className={mono ? 'mono' : ''} style={{ fontSize: 13, fontWeight: 500, marginTop: 3 }}>{value}</div>
    </div>
  )
}

function NominaRow({ label, amount, bold, small, note }) {
  const positive = amount >= 0
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '6px 0',
      borderTop: bold ? '1px solid var(--ink-200)' : 'none',
      marginTop: bold ? 6 : 0,
    }}>
      <div>
        <div style={{ fontSize: small ? 12 : 13, fontWeight: bold ? 600 : 400, color: 'var(--ink-800)' }}>{label}</div>
        {note && <div style={{ fontSize: 10.5, color: 'var(--ink-500)', marginTop: 1 }}>{note}</div>}
      </div>
      <div className="mono" style={{
        fontSize: bold ? 14 : 12.5,
        fontWeight: bold ? 700 : 500,
        color: positive ? 'var(--ink-900)' : 'var(--bad)',
      }}>
        {positive ? '' : '−'}${Math.abs(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  )
}

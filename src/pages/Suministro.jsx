import { useMemo, useState, useRef, useEffect } from 'react'
import { Icon } from '../components/Icons'
import { Modal, DropdownMenu, useToast } from '../components/ui.jsx'
import '../styles/suministro.css'

const SOLICITUDES_INIT = [
  { id: 'SOL-2847', cliente: 'Hospital Ángeles Pedregal', solicitante: 'C. Mendoza', items: 14, monto: 18420, estado: 'aprobada',     fecha: '23 Abr · 09:14', sae: true,  presupuesto: 92 },
  { id: 'SOL-2846', cliente: 'Torre BBVA Reforma',         solicitante: 'L. Vázquez', items: 8,  monto: 9870,  estado: 'pre-revision',fecha: '23 Abr · 08:52', sae: true,  presupuesto: 67 },
  { id: 'SOL-2845', cliente: 'Plaza Antara',               solicitante: 'J. Ramírez', items: 22, monto: 31250, estado: 'pendiente',   fecha: '23 Abr · 08:30', sae: false, presupuesto: 88 },
  { id: 'SOL-2844', cliente: 'Corporativo Citibanamex',    solicitante: 'A. Solano',  items: 6,  monto: 6420,  estado: 'aprobada',     fecha: '22 Abr · 17:11', sae: true,  presupuesto: 45 },
  { id: 'SOL-2843', cliente: 'WeWork Insurgentes',         solicitante: 'P. Núñez',   items: 11, monto: 14180, estado: 'rechazada',   fecha: '22 Abr · 16:02', sae: true,  presupuesto: 102 },
  { id: 'SOL-2842', cliente: 'Universidad Anáhuac Norte',  solicitante: 'F. Castro',  items: 19, monto: 24500, estado: 'pre-revision',fecha: '22 Abr · 14:45', sae: true,  presupuesto: 71 },
]

const CLIENTES_CATALOG = [
  'Hospital Ángeles Pedregal', 'Torre BBVA Reforma', 'Plaza Antara',
  'Corporativo Citibanamex', 'WeWork Insurgentes', 'Universidad Anáhuac Norte',
]

const ALERTAS_INIT = [
  { tipo: 'presupuesto', cliente: 'WeWork Insurgentes',       uso: 102, presupuesto: 14000, severity: 'critico' },
  { tipo: 'presupuesto', cliente: 'Plaza Antara',             uso: 108, presupuesto: 22000, severity: 'critico' },
  { tipo: 'presupuesto', cliente: 'Hospital Ángeles',         uso: 92,  presupuesto: 28000, severity: 'alto'    },
  { tipo: 'presupuesto', cliente: 'Corporativo Citibanamex',  uso: 96,  presupuesto: 19500, severity: 'alto'    },
  { tipo: 'presupuesto', cliente: 'Torre BBVA',               uso: 67,  presupuesto: 18000, severity: 'medio'   },
  { tipo: 'stock', cliente: 'Hospital Ángeles Pedregal', producto: 'Cloro concentrado 5%', disponible: 0,  requerido: 20, unidad: 'L',  severity: 'critico' },
  { tipo: 'stock', cliente: 'Universidad Anáhuac Norte', producto: 'Guantes nitrilo L',    disponible: 1,  requerido: 8,  unidad: 'cajas', severity: 'alto'  },
]

const DEFAULT_ITEMS = {
  'SOL-2847': [
    { nombre: 'Detergente líquido multiuso', cant: '12 L', stock: 'OK', precio: 1240 },
    { nombre: 'Microfibra azul 40×40', cant: '50 pz', stock: 'OK', precio: 850 },
    { nombre: 'Bolsas negras industriales', cant: '8 cajas', stock: 'BAJO', precio: 1680 },
  ],
  'SOL-2846': [
    { nombre: 'Detergente líquido multiuso', cant: '12 L', stock: 'OK', precio: 1240 },
    { nombre: 'Microfibra azul 40×40', cant: '50 pz', stock: 'OK', precio: 850 },
    { nombre: 'Bolsas negras industriales', cant: '8 cajas', stock: 'BAJO', precio: 1680 },
    { nombre: 'Cloro concentrado 5%', cant: '20 L', stock: 'OK', precio: 920 },
  ],
  'SOL-2845': [
    { nombre: 'Limpiador multisuperficies', cant: '30 L', stock: 'OK', precio: 2100 },
    { nombre: 'Guantes nitrilo L', cant: '5 cajas', stock: 'BAJO', precio: 1450 },
    { nombre: 'Papel higiénico industrial', cant: '12 cajas', stock: 'OK', precio: 3200 },
  ],
}

function itemsFor(id) {
  return DEFAULT_ITEMS[id] || [
    { nombre: 'Material genérico A', cant: '10 pz', stock: 'OK', precio: 600 },
    { nombre: 'Material genérico B', cant: '4 cajas', stock: 'OK', precio: 820 },
  ]
}

function EstadoTag({ estado }) {
  const map = {
    aprobada:      { cls: 'ok',   label: 'Aprobada' },
    'pre-revision':{ cls: 'info', label: 'Pre-revisión' },
    pendiente:     { cls: 'warn', label: 'Pendiente' },
    rechazada:     { cls: 'bad',  label: 'Rechazada' },
    liberada:      { cls: 'ok',   label: 'Liberada' },
  }
  const e = map[estado] || map.pendiente
  return <span className={`tag ${e.cls}`}>{e.label}</span>
}

export default function Suministro() {
  const toast = useToast()
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES_INIT)
  const [selected, setSelected] = useState('SOL-2846')
  const [alertas, setAlertas] = useState(ALERTAS_INIT)

  // Filters
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({ estado: 'todos', sae: 'todos' })
  const filterRef = useRef(null)

  // Modal nueva solicitud
  const [newOpen, setNewOpen] = useState(false)

  // Confirm reject
  const [rejectOpen, setRejectOpen] = useState(false)

  useEffect(() => {
    if (!filterOpen) return
    const onDoc = e => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [filterOpen])

  const filtered = useMemo(() => solicitudes.filter(s => {
    if (filters.estado !== 'todos' && s.estado !== filters.estado) return false
    if (filters.sae === 'si' && !s.sae) return false
    if (filters.sae === 'no' && s.sae) return false
    return true
  }), [solicitudes, filters])

  const sel = solicitudes.find(s => s.id === selected) || solicitudes[0]

  const approve = (id) => {
    setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: 'aprobada' } : s))
    toast.success('Solicitud aprobada', `${id} liberada al almacén · SAE sincronizado`, {
      action: { label: 'Deshacer', onClick: () => {
        setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: 'pre-revision' } : s))
      }}
    })
  }

  const reject = (id, motivo) => {
    setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: 'rechazada' } : s))
    toast.error('Solicitud rechazada', motivo ? `${id} · ${motivo}` : `${id} fue rechazada`)
  }

  const createSolicitud = (data) => {
    const nextNum = Math.max(...solicitudes.map(s => parseInt(s.id.slice(4)))) + 1
    const newSol = {
      id: `SOL-${nextNum}`,
      cliente: data.cliente,
      solicitante: data.solicitante,
      items: parseInt(data.items) || 1,
      monto: parseInt(data.monto) || 0,
      estado: 'pendiente',
      fecha: 'Hoy · ahora',
      sae: false,
      presupuesto: Math.floor(30 + Math.random() * 60),
    }
    setSolicitudes(prev => [newSol, ...prev])
    setSelected(newSol.id)
    toast.success('Nueva solicitud', `${newSol.id} creada para ${newSol.cliente}`)
  }

  return (
    <div className="page-grid" style={{ gap: 20 }}>

      {/* KPI Strip */}
      <div className="page-grid grid-4">
        <div className="kpi">
          <div className="kpi-label">Solicitudes hoy</div>
          <div className="kpi-value">{solicitudes.filter(s => s.fecha.startsWith('23') || s.fecha.startsWith('Hoy')).length}</div>
          <div className="kpi-meta"><span className="kpi-trend up">↑ 18%</span> vs ayer</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Pendientes aprobación</div>
          <div className="kpi-value">{solicitudes.filter(s => s.estado === 'pendiente' || s.estado === 'pre-revision').length}</div>
          <div className="kpi-meta">Tiempo prom · 2h 14m</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Monto en revisión</div>
          <div className="kpi-value">${(solicitudes.filter(s => s.estado !== 'aprobada' && s.estado !== 'rechazada').reduce((a, s) => a + s.monto, 0) / 1000).toFixed(1)}<span className="kpi-unit">K MXN</span></div>
          <div className="kpi-meta">{solicitudes.filter(s => s.presupuesto > 100).length} sobre presupuesto</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Alertas activas</div>
          <div className="kpi-value">{alertas.length}</div>
          <div className="kpi-meta">
            <span className="dot" style={{background: 'var(--bad)'}}></span>
            {alertas.filter(a => a.severity === 'critico').length} crítica · {alertas.filter(a => a.severity === 'medio').length} medias
          </div>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="card flow-card">
        <div className="card-header">
          <div>
            <div className="card-eyebrow">Flujo operativo</div>
            <h3 className="card-title">Pipeline de suministro · tiempo real</h3>
          </div>
          <div className="flow-legend">
            <span><span className="dot" style={{background: '#22c55e'}}></span> Activo</span>
            <span><span className="dot" style={{background: '#f59e0b'}}></span> En espera</span>
            <span><span className="dot" style={{background: 'var(--ink-300)'}}></span> Inactivo</span>
          </div>
        </div>

        <div className="flow-canvas">
          <FlowNode num="01" title="Solicitud y formato" sub="Compras · Servicio" status="active" count={solicitudes.length} icon="user" onClick={() => toast.info('Etapa 01', 'Solicitud y generación de formato')} />
          <FlowConnector active />
          <FlowSplit>
            <FlowNode num="02a" title="Corporativo" sub="Aprobación + alertas" status="active" count={solicitudes.filter(s => s.estado === 'pre-revision' || s.estado === 'pendiente').length} icon="building" alert alertCount={alertas.filter(a => a.severity === 'critico' || a.severity === 'alto').length} onClick={() => toast.warn('Corporativo', `${alertas.filter(a => a.severity === 'critico' || a.severity === 'alto').length} alertas activas · presupuesto y stock`)} />
            <FlowNode num="02b" title="Almacén" sub="Pre-solicitud" status="waiting" count={solicitudes.filter(s => s.estado === 'pre-revision').length} icon="package" alert alertCount={alertas.filter(a => a.tipo === 'stock').length} onClick={() => toast.warn('Almacén', `${alertas.filter(a => a.tipo === 'stock').length} alertas de stock · revisar reposición`)} />
          </FlowSplit>
          <FlowConnector active label="LIBERA" />
          <FlowNode num="03" title="Almacén" sub="Surtir" status="active" count={solicitudes.filter(s => s.estado === 'aprobada').length} icon="check" success alert alertCount={alertas.filter(a => a.tipo === 'stock').length} onClick={() => toast.warn('Surtido', `${alertas.filter(a => a.tipo === 'stock').length} productos sin stock para surtir`)} />
        </div>
      </div>

      {/* Alertas tempranas */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-eyebrow">Monitoreo presupuestal</div>
            <h3 className="card-title">Alertas tempranas · presupuesto y stock</h3>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="tag muted mono">Actualizado hace 4 min</span>
            <button className="btn btn-ghost" onClick={() => {
              setAlertas(prev => prev.map(a => a.tipo === 'stock' ? a : ({ ...a, uso: Math.max(40, Math.min(120, a.uso + Math.floor(Math.random() * 10) - 4)) })))
              toast.info('Monitoreo', 'Métricas actualizadas desde SAE')
            }}>
              <Icon name="refresh" size={14} /> Actualizar
            </button>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {alertas.map((a, i) => {
            if (a.tipo === 'stock') {
              const pct = a.requerido > 0 ? Math.round((a.disponible / a.requerido) * 100) : 0
              return (
                <div key={i} className={`alerta-row severity-${a.severity}`}>
                  <div className="alerta-bar">
                    <div className="alerta-bar-fill" style={{ width: Math.min(pct, 100) + '%' }}></div>
                  </div>
                  <div className="alerta-info">
                    <div className="alerta-cliente">
                      {a.cliente} · <span style={{ fontWeight: 400, color: 'var(--ink-600)' }}>{a.producto}</span>
                    </div>
                    <div className="alerta-meta mono">
                      Disponible {a.disponible} {a.unidad} de {a.requerido} {a.unidad} requeridos
                    </div>
                  </div>
                  <div className="alerta-pct mono" style={{ fontSize: a.disponible === 0 ? 13 : undefined }}>
                    {a.disponible === 0 ? 'Sin stock' : `${pct}%`}
                  </div>
                  <div className={`alerta-tag tag ${a.severity === 'critico' ? 'bad' : 'warn'}`}>
                    {a.severity === 'critico' ? 'Sin stock' : 'Stock bajo'}
                  </div>
                  <button
                    className="btn btn-ghost"
                    style={{ marginLeft: 8, height: 28, padding: '0 10px', fontSize: 12 }}
                    onClick={() => toast.success('Reposición solicitada', `Pedido a almacén central · ${a.producto}`)}
                  >
                    <Icon name="package" size={12} /> Reabastecer
                  </button>
                </div>
              )
            }
            return (
              <div key={i} className={`alerta-row severity-${a.severity}`}>
                <div className="alerta-bar">
                  <div className="alerta-bar-fill" style={{ width: Math.min(a.uso, 100) + '%' }}></div>
                </div>
                <div className="alerta-info">
                  <div className="alerta-cliente">{a.cliente}</div>
                  <div className="alerta-meta mono">
                    ${(a.presupuesto * a.uso / 100).toLocaleString()} de ${a.presupuesto.toLocaleString()} MXN
                  </div>
                </div>
                <div className="alerta-pct mono">{a.uso}%</div>
                <div className={`alerta-tag tag ${a.severity === 'critico' ? 'bad' : a.severity === 'alto' ? 'warn' : 'info'}`}>
                  {a.severity}
                </div>
                <button
                  className="btn btn-ghost"
                  style={{ marginLeft: 8, height: 28, padding: '0 10px', fontSize: 12 }}
                  onClick={() => toast.success('Contacto enviado', `Se notificó a ${a.cliente} vía WhatsApp + Email`)}
                >
                  <Icon name="bell" size={12} /> Notificar
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Solicitudes + Detalle */}
      <div className="suministro-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Bandeja</div>
              <h3 className="card-title">Solicitudes recientes · {filtered.length}</h3>
            </div>
            <div style={{ display: 'flex', gap: 8, position: 'relative' }} ref={filterRef}>
              <button
                className={`btn btn-ghost ${filterOpen ? 'active' : ''}`}
                onClick={() => setFilterOpen(o => !o)}
              >
                <Icon name="filter" size={14} /> Filtrar
                {(filters.estado !== 'todos' || filters.sae !== 'todos') && (
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 3, background: 'var(--mp-blue-600)', marginLeft: 4 }}></span>
                )}
              </button>
              <button className="btn btn-primary" onClick={() => setNewOpen(true)}>
                <Icon name="plus" size={14} /> Nueva
              </button>
              {filterOpen && (
                <div className="filter-panel">
                  <div className="filter-panel-title">Estado</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {['todos', 'pre-revision', 'pendiente', 'aprobada', 'rechazada'].map(e => (
                      <button
                        key={e}
                        onClick={() => setFilters(f => ({ ...f, estado: e }))}
                        className={`tag ${filters.estado === e ? 'blue' : 'muted'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {e === 'todos' ? 'Todos' : e.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="filter-panel-title">SAE</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[['todos', 'Todos'], ['si', 'Sincronizado'], ['no', 'No sync.']].map(([k, l]) => (
                      <button
                        key={k}
                        onClick={() => setFilters(f => ({ ...f, sae: k }))}
                        className={`tag ${filters.sae === k ? 'blue' : 'muted'}`}
                        style={{ cursor: 'pointer' }}
                      >{l}</button>
                    ))}
                  </div>
                  <button
                    className="btn btn-ghost"
                    style={{ width: '100%', marginTop: 12 }}
                    onClick={() => { setFilters({ estado: 'todos', sae: 'todos' }); setFilterOpen(false) }}
                  >Limpiar filtros</button>
                </div>
              )}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">Sin resultados con los filtros actuales</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Cliente</th>
                  <th>Items</th>
                  <th>Monto MXN</th>
                  <th title="Porcentaje sobre presupuesto autorizado">% s/ presup. autorizado</th>
                  <th>SAE</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}
                      onClick={() => setSelected(s.id)}
                      style={{ cursor: 'pointer', background: selected === s.id ? 'var(--mp-blue-50)' : undefined }}>
                    <td><span className="mono" style={{ fontSize: 12, color: 'var(--mp-blue-700)', fontWeight: 500 }}>{s.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{s.cliente}</td>
                    <td><span className="mono">{s.items}</span></td>
                    <td><span className="mono">${s.monto.toLocaleString()}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="bar-mini">
                          <div className={`bar-mini-fill ${s.presupuesto > 100 ? 'over' : s.presupuesto > 85 ? 'warn' : ''}`}
                               style={{ width: Math.min(s.presupuesto, 100) + '%' }}></div>
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-600)' }}>{s.presupuesto}%</span>
                      </div>
                    </td>
                    <td>
                      {s.sae
                        ? <span className="dot" style={{ background: 'var(--ok)' }} title="Sincronizado"></span>
                        : <span className="dot" style={{ background: 'var(--ink-300)' }} title="No sincronizado"></span>}
                    </td>
                    <td><EstadoTag estado={s.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detalle Drawer */}
        <div className="card detail-card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow mono">{sel.id}</div>
              <h3 className="card-title">{sel.cliente}</h3>
            </div>
            <DropdownMenu
              trigger={<button className="btn-icon"><Icon name="more" size={16} /></button>}
              items={[
                { icon: 'download', label: 'Exportar PDF', onClick: () => toast.success('Exportado', `${sel.id} · PDF descargado`) },
                { icon: 'refresh', label: 'Re-sincronizar SAE', onClick: () => {
                  setSolicitudes(prev => prev.map(s => s.id === sel.id ? { ...s, sae: true } : s))
                  toast.success('SAE', 'Solicitud re-sincronizada')
                }},
                { icon: 'user', label: 'Asignar responsable', onClick: () => toast.info('Asignación', 'Próximamente · selector de responsable') },
                { divider: true },
                { icon: 'x', label: 'Cancelar solicitud', danger: true, onClick: () => setRejectOpen(true) },
              ]}
            />
          </div>
          <div className="card-body">
            <div className="detail-meta">
              <div>
                <div className="detail-meta-label">Solicitante</div>
                <div className="detail-meta-value">{sel.solicitante}</div>
              </div>
              <div>
                <div className="detail-meta-label">Fecha</div>
                <div className="detail-meta-value mono">{sel.fecha}</div>
              </div>
              <div>
                <div className="detail-meta-label">Monto</div>
                <div className="detail-meta-value mono">${sel.monto.toLocaleString()} MXN</div>
              </div>
              <div>
                <div className="detail-meta-label">Estado</div>
                <div className="detail-meta-value"><EstadoTag estado={sel.estado} /></div>
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Items solicitados</div>
              {itemsFor(sel.id).map((item, i) => (
                <div key={i} className="detail-item">
                  <div className="detail-item-main">
                    <div className="detail-item-name">{item.nombre}</div>
                    <div className="detail-item-cant mono">{item.cant}</div>
                  </div>
                  <div className="detail-item-side">
                    <span className={`tag ${item.stock === 'OK' ? 'ok' : 'warn'}`}>{item.stock}</span>
                    <span className="mono detail-item-precio">${item.precio.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {sel.estado !== 'aprobada' && sel.estado !== 'rechazada' ? (
              <div className="detail-actions">
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setRejectOpen(true)}
                >
                  <Icon name="x" size={14} /> Rechazar
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => approve(sel.id)}
                >
                  <Icon name="check" size={14} /> Aprobar y liberar
                </button>
              </div>
            ) : (
              <div className="detail-actions">
                <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-500)', textAlign: 'center', padding: '8px 0' }}>
                  Solicitud {sel.estado === 'aprobada' ? 'aprobada y liberada' : 'rechazada'} · sin acciones pendientes
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nueva Solicitud */}
      <NewSolicitudModal open={newOpen} onClose={() => setNewOpen(false)} onCreate={createSolicitud} />

      {/* Confirm Reject */}
      <RejectDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(motivo) => reject(sel.id, motivo)}
        solicitud={sel}
      />
    </div>
  )
}

function NewSolicitudModal({ open, onClose, onCreate }) {
  const [data, setData] = useState({ cliente: CLIENTES_CATALOG[0], solicitante: '', items: 1, monto: '' })
  const [submitting, setSubmitting] = useState(false)
  const valid = data.cliente && data.solicitante.trim().length >= 3 && data.monto

  useEffect(() => {
    if (open) setData({ cliente: CLIENTES_CATALOG[0], solicitante: '', items: 1, monto: '' })
  }, [open])

  const submit = async () => {
    if (!valid) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 650))
    onCreate(data)
    setSubmitting(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva solicitud de suministro"
      eyebrow="Módulo 01 · Bandeja"
      size="md"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className={`btn btn-primary ${submitting ? 'loading' : ''}`}
            disabled={!valid || submitting}
            onClick={submit}
          >
            <Icon name="check" size={14} /> Crear solicitud
          </button>
        </>
      }
    >
      <div className="form-row">
        <label>Cliente</label>
        <select className="input" value={data.cliente} onChange={e => setData(d => ({ ...d, cliente: e.target.value }))}>
          {CLIENTES_CATALOG.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Solicitante</label>
        <input
          className="input"
          placeholder="Nombre completo"
          value={data.solicitante}
          onChange={e => setData(d => ({ ...d, solicitante: e.target.value }))}
        />
      </div>
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label># Items</label>
          <input
            className="input"
            type="number"
            min={1}
            value={data.items}
            onChange={e => setData(d => ({ ...d, items: e.target.value }))}
          />
        </div>
        <div>
          <label>Monto estimado MXN</label>
          <input
            className="input"
            type="number"
            placeholder="12000"
            value={data.monto}
            onChange={e => setData(d => ({ ...d, monto: e.target.value }))}
          />
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 8 }}>
        Se creará con estado <strong>Pendiente</strong> y se sincronizará a SAE al aprobar.
      </div>
    </Modal>
  )
}

function RejectDialog({ open, onClose, onConfirm, solicitud }) {
  const [motivo, setMotivo] = useState('')
  useEffect(() => { if (open) setMotivo('') }, [open])
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rechazar solicitud"
      size="sm"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={() => { onConfirm(motivo); onClose() }}>
            <Icon name="x" size={14} /> Confirmar rechazo
          </button>
        </>
      }
    >
      <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink-700)' }}>
        Rechazar <strong>{solicitud.id}</strong> de <strong>{solicitud.cliente}</strong> por ${solicitud.monto.toLocaleString()} MXN.
      </p>
      <div className="form-row" style={{ marginBottom: 0 }}>
        <label>Motivo (opcional)</label>
        <textarea
          className="input"
          rows={3}
          style={{ height: 'auto', padding: '10px 12px' }}
          placeholder="Ej. Sobre presupuesto, duplicado, items no disponibles…"
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
        />
      </div>
    </Modal>
  )
}

function FlowNode({ num, title, sub, status, count, icon, alert, alertCount, success, external, onClick }) {
  return (
    <div
      className={`flow-node status-${status} ${alert ? 'has-alert' : ''} ${success ? 'is-success' : ''} ${external ? 'is-external' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flow-node-num mono">{num}</div>
      <div className="flow-node-icon"><Icon name={icon} size={18} /></div>
      <div className="flow-node-title">{title}</div>
      <div className="flow-node-sub">{sub}</div>
      <div className="flow-node-count mono">{count}</div>
      {alert && (
        <>
          <div className="flow-alert-badge">{alertCount ?? '!'}</div>
          {alertCount > 0 && (
            <div className="flow-alert-pill">
              <Icon name="bell" size={10} />
              {alertCount} {alertCount === 1 ? 'alerta' : 'alertas'}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FlowConnector({ active, label }) {
  return (
    <div className={`flow-connector ${active ? 'active' : ''}`}>
      <div className="flow-line">
        <div className="flow-pulse"></div>
      </div>
      {label && <div className="flow-connector-label mono">{label}</div>}
    </div>
  )
}

function FlowSplit({ children }) {
  return <div className="flow-split">{children}</div>
}

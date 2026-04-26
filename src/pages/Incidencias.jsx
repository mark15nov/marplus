import { useEffect, useState } from 'react'
import { Icon } from '../components/Icons'
import { Modal, useToast } from '../components/ui.jsx'
import '../styles/incidencias.css'

const ESTADO_FLOW = ['pendiente', 'recogido', 'en-reparacion', 'reparado', 'entregado']
const ESTADO_LABEL = {
  'pendiente':     'Por recoger',
  'recogido':      'Recogido',
  'en-reparacion': 'En reparación',
  'reparado':      'Reparado',
  'entregado':     'Entregado',
}
const ESTADO_TAG = {
  'pendiente':     'warn',
  'recogido':      'info',
  'en-reparacion': 'blue',
  'reparado':      'ok',
  'entregado':     'ok',
}
const ESTADO_ACTION = {
  'pendiente':     { label: 'Recoger',           icon: 'package' },
  'recogido':      { label: 'Iniciar reparación', icon: 'settings' },
  'en-reparacion': { label: 'Marcar reparado',    icon: 'check' },
  'reparado':      { label: 'Entregar',           icon: 'arrow_right' },
}
const nextEstado = (e) => {
  const i = ESTADO_FLOW.indexOf(e)
  return i >= 0 && i < ESTADO_FLOW.length - 1 ? ESTADO_FLOW[i + 1] : null
}

const REPORTES_INIT = [
  { id: 'EQ-1184', supervisor: 'Esmeralda Rodríguez', cliente: 'Hospital Ángeles', equipo: 'Aspiradora Karcher T 12/1', falla: 'No enciende',    fecha: 'Hoy · 11:42',  estado: 'pendiente',     fotos: 3 },
  { id: 'EQ-1183', supervisor: 'Carlos Pérez',         cliente: 'Torre BBVA',      equipo: 'Pulidora Tornado BR-1700',  falla: 'Cable dañado',   fecha: 'Hoy · 09:15',  estado: 'recogido',      fotos: 2 },
  { id: 'EQ-1182', supervisor: 'María Solís',          cliente: 'Plaza Antara',    equipo: 'Hidrolavadora K5',           falla: 'Pierde presión', fecha: 'Ayer · 17:33', estado: 'en-reparacion', fotos: 4 },
  { id: 'EQ-1181', supervisor: 'Rubén Estrada',        cliente: 'Citibanamex',     equipo: 'Carrito multifuncional',     falla: 'Llanta rota',    fecha: 'Ayer · 14:08', estado: 'reparado',      fotos: 1 },
]

const INCIDENTES_INIT = [
  { id: 'IN-2884', tipo: 'falta',     persona: 'Luis Vázquez',   cliente: 'WeWork',         severity: 'alta',  fecha: 'Hoy · 06:00' },
  { id: 'IN-2883', tipo: 'retardo',   persona: 'Ana Solano',     cliente: 'Plaza Antara',   severity: 'baja',  fecha: 'Hoy · 07:45' },
  { id: 'IN-2882', tipo: 'accidente', persona: 'Pedro Núñez',    cliente: 'Hospital Ángeles', severity: 'critica', fecha: 'Ayer · 13:20' },
  { id: 'IN-2881', tipo: 'queja',     persona: 'Felipe Castro',  cliente: 'Anáhuac',        severity: 'media', fecha: 'Ayer · 11:08' },
  { id: 'IN-2880', tipo: 'insumo',    persona: 'J. Ramírez',     cliente: 'Citibanamex',    severity: 'baja',  fecha: '21 Abr · 16:42' },
]

export default function Incidencias() {
  const [tab, setTab] = useState('equipos')
  const [reportes, setReportes] = useState(REPORTES_INIT)
  const [incidentes, setIncidentes] = useState(INCIDENTES_INIT)

  return (
    <div>
      <div className="tabs">
        <button className={`tab ${tab === 'equipos' ? 'active' : ''}`} onClick={() => setTab('equipos')}>
          <span className="tab-num">3.1</span>
          <Icon name="package" size={14} /> Equipos
        </button>
        <button className={`tab ${tab === 'incidentes' ? 'active' : ''}`} onClick={() => setTab('incidentes')}>
          <span className="tab-num">3.2</span>
          <Icon name="alert" size={14} /> Incidentes
        </button>
      </div>

      <div className="fade-in" key={tab}>
        {tab === 'equipos' && <EquiposTab reportes={reportes} setReportes={setReportes} />}
        {tab === 'incidentes' && <IncidentesTab incidentes={incidentes} setIncidentes={setIncidentes} />}
      </div>
    </div>
  )
}

const FALLA_OPTIONS = ['Eléctrica', 'Mecánica', 'Mantenimiento', 'Daño físico', 'Pérdida']
const EQUIPOS_CATALOG = [
  'Aspiradora Karcher T 12/1 · KR-8821',
  'Pulidora Tornado BR-1700 · TR-4412',
  'Hidrolavadora Karcher K5 · KR-1051',
  'Carrito multifuncional · RB-7720',
]
const CLIENTES_CATALOG = ['Hospital Ángeles Pedregal', 'Torre BBVA Reforma', 'Plaza Antara', 'Corporativo Citibanamex', 'WeWork Insurgentes']

function emptyForm() {
  return {
    supervisor: 'Esmeralda Rodríguez',
    cliente: CLIENTES_CATALOG[0],
    ubicacion: '',
    equipo: EQUIPOS_CATALOG[0],
    falla: 'Eléctrica',
    descripcion: '',
    fotos: [],
  }
}

function EquiposTab({ reportes, setReportes }) {
  const toast = useToast()
  const [filter, setFilter] = useState('todos')
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)

  const filteredReportes = reportes.filter(r => filter === 'todos' || r.estado === filter)

  const PHOTO_GRADIENTS = [
    'linear-gradient(135deg, #c1cad9, #95a0b3)',
    'linear-gradient(135deg, #95a0b3, #6b7689)',
    'linear-gradient(135deg, #fee2e2, #f87171)',
    'linear-gradient(135deg, #d0deff, #5b91f5)',
    'linear-gradient(135deg, #fef3c7, #d97706)',
  ]

  const addPhoto = () => {
    if (form.fotos.length >= 5) { toast.warn('Límite alcanzado', 'Máximo 5 fotos por reporte'); return }
    setForm(f => ({ ...f, fotos: [...f.fotos, PHOTO_GRADIENTS[f.fotos.length % PHOTO_GRADIENTS.length]] }))
  }

  const removePhoto = (i) => {
    setForm(f => ({ ...f, fotos: f.fotos.filter((_, idx) => idx !== i) }))
  }

  const submit = async () => {
    if (!form.descripcion.trim()) {
      toast.warn('Descripción faltante', 'Agrega detalles de la falla')
      return
    }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    const nextId = 'EQ-' + (Math.max(...reportes.map(r => parseInt(r.id.slice(3)))) + 1)
    const newReport = {
      id: nextId,
      supervisor: form.supervisor,
      cliente: form.cliente,
      equipo: form.equipo.split(' · ')[0],
      falla: form.descripcion.slice(0, 40) + (form.descripcion.length > 40 ? '…' : ''),
      fecha: 'Hoy · ahora',
      estado: 'pendiente',
      fotos: form.fotos.length,
    }
    setReportes(prev => [newReport, ...prev])
    setForm(emptyForm())
    setSubmitting(false)
    toast.success('Reporte enviado', `${nextId} · ${newReport.equipo}`)
  }

  const saveDraft = () => {
    try {
      localStorage.setItem('marplus.draft.equipo', JSON.stringify(form))
      toast.success('Borrador guardado', 'Puedes retomarlo más tarde')
    } catch {
      toast.info('Borrador', 'Formulario almacenado en memoria')
    }
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('marplus.draft.equipo')
      if (saved) setForm(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  const updateEstado = (id, nuevo) => {
    setReportes(prev => prev.map(r => r.id === id ? { ...r, estado: nuevo } : r))
    toast.success('Estado actualizado', `${id} → ${ESTADO_LABEL[nuevo] || nuevo}`)
  }

  return (
    <div className="page-grid" style={{ gap: 16 }}>
      <div className="page-grid grid-3">
        <div className="kpi">
          <div className="kpi-label">Reportes esta semana</div>
          <div className="kpi-value">{reportes.length}</div>
          <div className="kpi-meta"><span className="kpi-trend up">↑ 3</span> vs semana anterior</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Equipos en reparación</div>
          <div className="kpi-value">{reportes.filter(r => r.estado !== 'reparado').length}</div>
          <div className="kpi-meta">Tiempo prom · 3.2 días</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Costo de reparación</div>
          <div className="kpi-value">$8.4<span className="kpi-unit">K MXN</span></div>
          <div className="kpi-meta">mes en curso</div>
        </div>
      </div>

      <div className="incid-grid">
        {/* Lista */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Bandeja de campo</div>
              <h3 className="card-title">Reportes de equipo · {filteredReportes.length}</h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                className="input"
                style={{ height: 32, width: 'auto', fontSize: 12 }}
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                {ESTADO_FLOW.map(e => (
                  <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            {filteredReportes.length === 0 ? (
              <div className="empty-state">Sin reportes en este estado</div>
            ) : filteredReportes.map(r => {
              const next = nextEstado(r.estado)
              const action = ESTADO_ACTION[r.estado]
              const stepIdx = ESTADO_FLOW.indexOf(r.estado)
              return (
                <div
                  key={r.id}
                  className="reporte-row"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setDetail(r)}
                >
                  <div className="reporte-id mono">{r.id}</div>
                  <div style={{ flex: 1 }}>
                    <div className="reporte-equipo">{r.equipo}</div>
                    <div className="reporte-meta mono">
                      <span><Icon name="user" size={11} /> {r.supervisor}</span>
                      <span><Icon name="pin" size={11} /> {r.cliente}</span>
                      <span><Icon name="clock" size={11} /> {r.fecha}</span>
                    </div>
                    <div className="reporte-falla">
                      <Icon name="alert" size={11} color="var(--bad)" /> {r.falla}
                    </div>
                    <div className="reporte-steps">
                      {ESTADO_FLOW.map((e, i) => (
                        <div
                          key={e}
                          className={`reporte-step ${i < stepIdx ? 'done' : i === stepIdx ? 'current' : ''}`}
                          title={ESTADO_LABEL[e]}
                        >
                          <span className="reporte-step-dot">{i < stepIdx ? '✓' : i + 1}</span>
                          <span className="reporte-step-label">{ESTADO_LABEL[e]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="reporte-side">
                    <div className="reporte-fotos">
                      <Icon name="camera" size={12} /> <span className="mono">{r.fotos}</span>
                    </div>
                    <span className={`tag ${ESTADO_TAG[r.estado]}`}>
                      {ESTADO_LABEL[r.estado]}
                    </span>
                    {next && action && (
                      <button
                        className="btn btn-primary"
                        style={{ height: 30, padding: '0 12px', fontSize: 12, marginTop: 4 }}
                        onClick={(ev) => { ev.stopPropagation(); updateEstado(r.id, next) }}
                      >
                        <Icon name={action.icon} size={12} /> {action.label}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Formato */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Formato campo</div>
              <h3 className="card-title">Reporte de equipo nuevo</h3>
            </div>
            <span className="tag mono blue">PWA · Móvil</span>
          </div>
          <div className="card-body" style={{ padding: 18 }}>
            <div className="form-row">
              <label>Supervisor</label>
              <input className="input" value={form.supervisor} readOnly />
            </div>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label>Cliente</label>
                <select className="input" value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))}>
                  {CLIENTES_CATALOG.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Ubicación específica</label>
                <input
                  className="input"
                  placeholder="Ej. Piso 4, área cocina"
                  value={form.ubicacion}
                  onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-row">
              <label>Equipo</label>
              <select className="input" value={form.equipo} onChange={e => setForm(f => ({ ...f, equipo: e.target.value }))}>
                {EQUIPOS_CATALOG.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Tipo de falla</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {FALLA_OPTIONS.map(t => (
                  <label key={t} className="check-pill">
                    <input
                      type="radio"
                      name="falla"
                      checked={form.falla === t}
                      onChange={() => setForm(f => ({ ...f, falla: t }))}
                    /> {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label>Descripción</label>
              <textarea
                className="input"
                rows="3"
                style={{ height: 'auto', padding: '10px 12px' }}
                placeholder="Detalle qué pasó, cuándo se detectó y condiciones de uso…"
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <label>Subir evidencia · {form.fotos.length}/5</label>
              <div className="photo-uploads">
                {form.fotos.map((grad, i) => (
                  <div key={i} className="photo-slot has-photo">
                    <div className="photo-placeholder" style={{ background: grad }}></div>
                    <button className="photo-remove" onClick={() => removePhoto(i)}>
                      <Icon name="x" size={10} />
                    </button>
                  </div>
                ))}
                {form.fotos.length < 5 && (
                  <button className="photo-slot empty" onClick={addPhoto}>
                    <Icon name="camera" size={20} color="var(--ink-400)" />
                    <span style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 4 }}>Subir foto</span>
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={saveDraft}>
                Guardar borrador
              </button>
              <button
                className={`btn btn-primary ${submitting ? 'loading' : ''}`}
                style={{ flex: 1 }}
                disabled={submitting}
                onClick={submit}
              >
                <Icon name="upload" size={14} /> Enviar reporte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.equipo}
        eyebrow={detail?.id}
        footer={detail && (
          <>
            <button className="btn btn-ghost" onClick={() => setDetail(null)}>Cerrar</button>
            {nextEstado(detail.estado) && (
              <button className="btn btn-primary" onClick={() => { updateEstado(detail.id, nextEstado(detail.estado)); setDetail(null) }}>
                <Icon name={ESTADO_ACTION[detail.estado].icon} size={14} /> {ESTADO_ACTION[detail.estado].label}
              </button>
            )}
          </>
        )}
      >
        {detail && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <InfoBox label="Supervisor" value={detail.supervisor} />
              <InfoBox label="Cliente" value={detail.cliente} />
              <InfoBox label="Reportado" value={detail.fecha} />
              <InfoBox label="Estado" value={<span className={`tag ${ESTADO_TAG[detail.estado]}`}>{ESTADO_LABEL[detail.estado]}</span>} />
            </div>
            <div>
              <div className="card-eyebrow" style={{ marginBottom: 6 }}>Falla reportada</div>
              <div style={{ padding: 10, background: 'var(--bad-soft)', color: '#991b1b', borderRadius: 8, fontSize: 13 }}>
                <Icon name="alert" size={12} /> {detail.falla}
              </div>
            </div>
            <div>
              <div className="card-eyebrow" style={{ marginBottom: 6 }}>Evidencia · {detail.fotos} fotos</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {Array.from({ length: detail.fotos }).map((_, i) => (
                  <div key={i} style={{
                    width: 80, height: 80, borderRadius: 6,
                    background: `linear-gradient(135deg, hsl(${i * 60}, 40%, 75%), hsl(${i * 60 + 30}, 40%, 55%))`
                  }}></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function InfoBox({ label, value }) {
  return (
    <div style={{ padding: 10, background: 'var(--ink-50)', borderRadius: 8 }}>
      <div className="card-eyebrow">{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, marginTop: 3 }}>{value}</div>
    </div>
  )
}

function IncidentesTab({ incidentes, setIncidentes }) {
  const toast = useToast()
  const [newOpen, setNewOpen] = useState(false)

  const counts = incidentes.reduce((acc, i) => { acc[i.tipo] = (acc[i.tipo] || 0) + 1; return acc }, {})

  const create = (data) => {
    const n = Math.max(...incidentes.map(i => parseInt(i.id.slice(3)))) + 1
    const next = {
      id: `IN-${n}`,
      ...data,
      fecha: 'Hoy · ahora',
    }
    setIncidentes(prev => [next, ...prev])
    toast.success('Incidente registrado', `${next.id} · ${next.persona}`)
  }

  return (
    <div className="page-grid" style={{ gap: 16 }}>
      {/* Stats por tipo */}
      <div className="page-grid grid-4">
        <TipoCard tipo="Faltas"     count={counts.falta || 0}    icon="user"   color="warn" />
        <TipoCard tipo="Retardos"   count={counts.retardo || 0}  icon="clock"  color="info" />
        <TipoCard tipo="Accidentes" count={counts.accidente || 0} icon="alert" color="bad"  />
        <TipoCard tipo="Quejas"     count={counts.queja || 0}    icon="user"   color="warn" />
      </div>

      <div className="incid-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Bitácora</div>
              <h3 className="card-title">Incidentes reportados · {incidentes.length}</h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-ghost"
                onClick={() => toast.info('Filtros', 'Filtra por tipo desde las tarjetas arriba')}
              ><Icon name="filter" size={14} /> Filtrar</button>
              <button className="btn btn-primary" onClick={() => setNewOpen(true)}>
                <Icon name="plus" size={14} /> Incidente
              </button>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Persona</th>
                <th>Cliente</th>
                <th>Severidad</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {incidentes.map(i => (
                <tr key={i.id} onClick={() => toast.info(i.id, `${i.tipo} · ${i.persona} · ${i.cliente}`)} style={{ cursor: 'pointer' }}>
                  <td><span className="mono" style={{ fontSize: 11.5, color: 'var(--mp-blue-700)' }}>{i.id}</span></td>
                  <td>
                    <span className={`incid-tipo-badge tipo-${i.tipo}`}>
                      <Icon name={i.tipo === 'accidente' ? 'alert' : i.tipo === 'retardo' ? 'clock' : i.tipo === 'queja' ? 'user' : i.tipo === 'insumo' ? 'package' : 'user'} size={11} />
                      {i.tipo}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{i.persona}</td>
                  <td>{i.cliente}</td>
                  <td>
                    <span className={`tag ${i.severity === 'critica' ? 'bad' : i.severity === 'alta' ? 'warn' : i.severity === 'media' ? 'info' : 'muted'}`}>
                      {i.severity}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 11.5 }}>{i.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Heatmap por categoría */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Análisis</div>
              <h3 className="card-title">Mapa de calor · 30 días</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="heatmap-grid">
              {['Equipos','Insumos','Operación','Personal'].map(cat => (
                <div key={cat} className="heatmap-row">
                  <div className="heatmap-label">{cat}</div>
                  <div className="heatmap-cells">
                    {Array.from({ length: 30 }).map((_, i) => {
                      const intensity = Math.random()
                      const level = intensity > 0.85 ? 4 : intensity > 0.65 ? 3 : intensity > 0.4 ? 2 : intensity > 0.15 ? 1 : 0
                      return (
                        <div
                          key={i}
                          className={`heatmap-cell level-${level}`}
                          onClick={() => toast.info(cat, `Día ${i + 1} · nivel ${level}/4`)}
                          style={{ cursor: 'pointer' }}
                        ></div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="heatmap-legend mono">
              <span>Menos</span>
              <div className="heatmap-cell level-0"></div>
              <div className="heatmap-cell level-1"></div>
              <div className="heatmap-cell level-2"></div>
              <div className="heatmap-cell level-3"></div>
              <div className="heatmap-cell level-4"></div>
              <span>Más</span>
            </div>
          </div>
        </div>
      </div>

      <NewIncidenteModal open={newOpen} onClose={() => setNewOpen(false)} onCreate={create} />
    </div>
  )
}

function NewIncidenteModal({ open, onClose, onCreate }) {
  const [data, setData] = useState({ tipo: 'falta', persona: '', cliente: CLIENTES_CATALOG[0], severity: 'media' })
  useEffect(() => { if (open) setData({ tipo: 'falta', persona: '', cliente: CLIENTES_CATALOG[0], severity: 'media' }) }, [open])
  const valid = data.persona.trim().length >= 3

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo incidente"
      eyebrow="Módulo 03"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn btn-primary"
            disabled={!valid}
            onClick={() => { onCreate(data); onClose() }}
          >
            <Icon name="check" size={14} /> Registrar incidente
          </button>
        </>
      }
    >
      <div className="form-row">
        <label>Tipo</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['falta', 'retardo', 'accidente', 'queja', 'insumo'].map(t => (
            <label key={t} className="check-pill">
              <input type="radio" name="tipo" checked={data.tipo === t} onChange={() => setData(d => ({ ...d, tipo: t }))} /> {t}
            </label>
          ))}
        </div>
      </div>
      <div className="form-row">
        <label>Persona involucrada</label>
        <input
          className="input"
          placeholder="Nombre completo"
          value={data.persona}
          onChange={e => setData(d => ({ ...d, persona: e.target.value }))}
        />
      </div>
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
        <div>
          <label>Cliente</label>
          <select className="input" value={data.cliente} onChange={e => setData(d => ({ ...d, cliente: e.target.value }))}>
            {CLIENTES_CATALOG.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>Severidad</label>
          <select className="input" value={data.severity} onChange={e => setData(d => ({ ...d, severity: e.target.value }))}>
            {['baja', 'media', 'alta', 'critica'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}

function TipoCard({ tipo, count, icon, color }) {
  const colors = {
    warn: { bg: 'var(--warn-soft)', fg: '#92400e' },
    info: { bg: 'var(--info-soft)', fg: '#155e75' },
    bad:  { bg: 'var(--bad-soft)', fg: '#991b1b' },
    muted:{ bg: 'var(--ink-100)', fg: 'var(--ink-700)' },
  }
  const c = colors[color]

  return (
    <div className="kpi" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: c.bg, color: c.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon name={icon} size={20} />
      </div>
      <div>
        <div className="kpi-label" style={{ marginBottom: 4 }}>{tipo}</div>
        <div className="kpi-value" style={{ fontSize: 28 }}>{count}</div>
      </div>
    </div>
  )
}

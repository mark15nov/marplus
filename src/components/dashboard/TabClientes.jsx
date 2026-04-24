import { useMemo, useState } from 'react'
import { Icon } from '../Icons'
import { Modal, DropdownMenu, useToast } from '../ui.jsx'
import { EmpleadoProfileModal } from '../EmpleadoProfile.jsx'
import { CLIENTES as CLIENTES_MASTER, CLIENTE_META, MAQUINARIA, CONSUMO, ACTIVIDAD, personalByCliente, EMPLEADOS } from '../../data.js'

function buildClientes() {
  return CLIENTES_MASTER.map(c => {
    const meta = CLIENTE_META[c.id] || {}
    return {
      ...c,
      supervisor: meta.supervisor || '—',
      contacto: meta.contacto || { nombre: '—', puesto: '—', email: '', tel: '' },
      ubicaciones: meta.ubicaciones || [],
      personalList: personalByCliente(c.id),
      maquinaria: MAQUINARIA[c.id] || [],
      consumo: CONSUMO[c.id] || [],
      actividad: ACTIVIDAD[c.id] || [],
    }
  })
}

export default function TabClientes() {
  const toast = useToast()
  const [clientes, setClientes] = useState(() => buildClientes())
  const [selected, setSelected] = useState('c1')
  const [newOpen, setNewOpen] = useState(false)
  const [contratoOpen, setContratoOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [empleadoOpen, setEmpleadoOpen] = useState(null) // holds empleado object or null
  const [query, setQuery] = useState('')

  const cli = clientes.find(c => c.id === selected) || clientes[0]

  const filtered = useMemo(
    () => clientes.filter(c => c.nombre.toLowerCase().includes(query.toLowerCase())),
    [clientes, query]
  )

  const createCliente = (data) => {
    const id = 'c' + (clientes.length + 1) + Date.now().toString().slice(-3)
    const next = {
      id, ...data, estado: 'activo',
      desde: new Date().getFullYear(), mrr: 0, mrrDelta: 'nuevo', margen: 0, margenDelta: '—',
      tickets: 0, satisfaccion: 0, nps: 0, slaUptime: 100, slaResp: 0,
      supervisor: '—',
      ubicaciones: [],
      contacto: { nombre: '—', puesto: '—', email: '', tel: '' },
      personalList: [],
      maquinaria: [],
      consumo: Array(6).fill({ stock: 0, consumo: 0 }),
      actividad: [{ fecha: 'Hoy · ahora', tipo: 'contrato', texto: 'Cliente creado · onboarding pendiente' }],
    }
    setClientes(prev => [next, ...prev])
    setSelected(id)
    toast.success('Cliente creado', `${data.nombre} · Contrato ${data.contrato}`)
  }

  const updateCliente = (id, patch) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  return (
    <div className="dashboard-grid">
      {/* Lista de clientes */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-eyebrow">Cartera</div>
            <h3 className="card-title">{clientes.length} clientes · {clientes.filter(c => c.estado === 'activo').length} activos</h3>
          </div>
          <button className="btn btn-primary" onClick={() => setNewOpen(true)}>
            <Icon name="plus" size={14} /> Cliente
          </button>
        </div>
        <div style={{ padding: '10px 14px 6px' }}>
          <input
            className="input input-search"
            placeholder="Filtrar cliente…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="cliente-list">
          {filtered.length === 0 ? (
            <div className="empty-state">Sin clientes que coincidan</div>
          ) : filtered.map(c => (
            <button
              key={c.id}
              className={`cliente-item ${selected === c.id ? 'active' : ''}`}
              onClick={() => setSelected(c.id)}
            >
              <div className="cliente-avatar">{c.nombre.split(' ').slice(0, 2).map(w => w[0]).join('')}</div>
              <div className="cliente-info">
                <div className="cliente-nombre">{c.nombre}</div>
                <div className="cliente-meta">
                  <span>{c.sector}</span>
                  <span>·</span>
                  <span>{c.personal} pers.</span>
                  <span className="cliente-contract mono">{c.contrato}</span>
                </div>
              </div>
              <div className={`cliente-estado-dot ${c.estado}`}></div>
            </button>
          ))}
        </div>
      </div>

      {/* Ficha del cliente */}
      <div className="cliente-detail">
        <div className="cliente-header card">
          <div className="cliente-header-main">
            <div className="cliente-header-avatar">{cli.nombre.split(' ').slice(0, 2).map(w => w[0]).join('')}</div>
            <div>
              <div className="cliente-header-eyebrow mono">CLI-2024-{cli.id.toUpperCase()} · CLIENTE DESDE {cli.desde}</div>
              <h2 className="cliente-header-name">{cli.nombre}</h2>
              <div className="cliente-header-meta">
                <span><Icon name="building" size={12} /> {cli.sector}</span>
                <span><Icon name="user" size={12} /> {cli.personalList.length} asignados ({cli.personal} contratados)</span>
                <span><Icon name="pin" size={12} /> {cli.ubicaciones.length} ubicaciones</span>
                <span className={`tag ${cli.estado === 'activo' ? 'ok' : 'warn'}`}>{cli.estado === 'activo' ? 'Activo' : 'Revisión'}</span>
                <span className="tag blue">Contrato {cli.contrato}</span>
              </div>
            </div>
          </div>
          <div className="cliente-header-actions">
            <button className="btn btn-ghost" onClick={() => setContactOpen(true)}>
              <Icon name="user" size={14} /> Contacto
            </button>
            <button className="btn btn-ghost" onClick={() => setContratoOpen(true)}>
              <Icon name="file" size={14} /> Contrato
            </button>
            <DropdownMenu
              trigger={<button className="btn btn-ghost"><Icon name="more" size={14} /></button>}
              items={[
                { icon: 'bell', label: 'Enviar mensaje', onClick: () => toast.success('Mensaje enviado', `${cli.contacto.nombre} · WhatsApp Business`) },
                { icon: 'refresh', label: 'Re-sincronizar datos', onClick: () => toast.info('Sincronizando', `${cli.nombre} · SAE + NOI`) },
                { icon: 'download', label: 'Exportar ficha PDF', onClick: () => {
                  const content = `Ficha ${cli.nombre}\nSector: ${cli.sector}\nContrato: ${cli.contrato}\nMRR: $${cli.mrr}K\nMargen: ${cli.margen}%\nPersonal: ${cli.personalList.length}\n\nEquipo:\n${cli.personalList.map(p => `- ${p.nombre} (${p.rol})`).join('\n')}`
                  const blob = new Blob([content], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${cli.nombre.toLowerCase().replace(/\s/g, '-')}-ficha.txt`; a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Ficha exportada', cli.nombre)
                }},
                { icon: 'calendar', label: 'Agendar visita', onClick: () => toast.info('Visita agendada', `${cli.nombre} · próxima semana`) },
                { divider: true },
                cli.estado === 'activo'
                  ? { icon: 'alert', label: 'Poner en revisión', onClick: () => { updateCliente(cli.id, { estado: 'revision' }); toast.warn('Estado actualizado', `${cli.nombre} → revisión`) } }
                  : { icon: 'check', label: 'Reactivar', onClick: () => { updateCliente(cli.id, { estado: 'activo' }); toast.success('Estado actualizado', `${cli.nombre} → activo`) } },
                { icon: 'x', label: 'Dar de baja', danger: true, onClick: () => {
                  if (confirm(`¿Dar de baja a ${cli.nombre}?`)) {
                    setClientes(prev => prev.filter(c => c.id !== cli.id))
                    toast.warn('Cliente dado de baja', cli.nombre)
                  }
                }},
              ]}
            />
          </div>
        </div>

        {/* Stat row */}
        <div className="page-grid grid-4" style={{ marginTop: 20 }}>
          <MiniStat label="MRR" value={`$${cli.mrr}K`} sub={`${cli.mrrDelta} · este mes`} trendUp={cli.mrrDelta.startsWith('+')} trendDown={cli.mrrDelta.startsWith('-')} />
          <MiniStat label="Margen" value={`${cli.margen}%`} sub={`${cli.margenDelta} vs mes ant.`} trendUp={cli.margenDelta.startsWith('+')} trendDown={cli.margenDelta.startsWith('-')} />
          <MiniStat label="Tickets abiertos" value={cli.tickets} sub={cli.tickets === 0 ? 'todo en orden' : 'pendientes de resolver'} />
          <MiniStat label="Satisfacción" value={cli.satisfaccion} sub={`/10 · NPS ${cli.nps}`} />
        </div>

        {/* Supervisor + SLA combinados en un solo strip */}
        <div className="card supervisor-sla-card" style={{ marginTop: 20 }}>
          <div className="supervisor-strip">
            <div className="supervisor-avatar">
              {cli.supervisor === '—' ? '—' : cli.supervisor.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="card-eyebrow">Supervisor a cargo</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{cli.supervisor}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>
                Reporta semanal · última visita: hoy
              </div>
            </div>
            <button className="btn btn-ghost" onClick={() => toast.info('Supervisor', `Contactando a ${cli.supervisor}`)}>
              <Icon name="bell" size={14} /> Contactar
            </button>
          </div>
          <div className="sla-strip">
            <SLABar label="Uptime SLA" value={cli.slaUptime} target={95} unit="%" />
            <SLABar label="Respuesta" value={cli.slaResp} target={3} unit="h" invert />
          </div>
        </div>

        {/* Personal + Maquinaria */}
        <div className="cliente-grid-2 page-grid grid-2" style={{ marginTop: 20 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-eyebrow">Personal · {cli.personalList.length} en sitio</div>
                <h3 className="card-title">Equipo asignado</h3>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>
                Click para ver perfil
              </span>
            </div>
            <div className="scrollable-list">
              {cli.personalList.length === 0 ? (
                <div className="empty-state">Sin personal asignado aún</div>
              ) : cli.personalList.map((p, i) => (
                <PersonaRow key={i} p={p} onOpenProfile={() => setEmpleadoOpen(p)} />
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-eyebrow">Equipo asignado · {cli.maquinaria.length} unidades</div>
                <h3 className="card-title">Maquinaria · inventario en sitio</h3>
              </div>
              <button className="btn btn-ghost" onClick={() => toast.info('Mantenimientos', `${cli.maquinaria.filter(m => m.estado === 'Mantenimiento').length} en proceso`)}>
                <Icon name="refresh" size={14} />
              </button>
            </div>
            <div className="scrollable-list">
              {cli.maquinaria.length === 0 ? (
                <div className="empty-state">Sin maquinaria asignada</div>
              ) : cli.maquinaria.map((e, i) => (
                <div key={i} className="equipo-row">
                  <div className="equipo-icon"><Icon name="package" size={18} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="equipo-item">{e.item}</div>
                    <div className="equipo-meta mono">{e.marca} · {e.serie} · mant {e.mantPróx}</div>
                  </div>
                  <span className={`tag ${e.estado === 'Operativa' ? 'ok' : 'warn'}`}>{e.estado}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actividad */}
        <div style={{ marginTop: 20 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-eyebrow">Bitácora</div>
                <h3 className="card-title">Actividad reciente · {cli.ubicaciones.length} ubicaciones en sitio</h3>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>
                {cli.actividad.length} eventos
              </span>
            </div>
            <div className="scrollable-list">
              {cli.actividad.length === 0 ? (
                <div className="empty-state">Sin actividad registrada</div>
              ) : cli.actividad.map((a, i) => (
                <ActividadRow key={i} a={a} />
              ))}
            </div>
          </div>
        </div>

        {/* Materiales */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Materiales · histórico vs actual</div>
              <h3 className="card-title">Consumo y stock en sitio · {cli.nombre}</h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  const header = 'Mes,Stock,Consumo\n'
                  const months = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr']
                  const rows = cli.consumo.map((d, i) => `${months[i]},${d.stock},${d.consumo}`).join('\n')
                  const blob = new Blob([header + rows], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href = url; a.download = `consumo-${cli.nombre.toLowerCase().replace(/\s/g, '-')}.csv`; a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Exportado', `Consumo · ${cli.nombre}`)
                }}
              >
                <Icon name="download" size={14} /> Exportar CSV
              </button>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <ConsumoChart data={cli.consumo} />
          </div>
        </div>
      </div>

      <NewClienteModal open={newOpen} onClose={() => setNewOpen(false)} onCreate={createCliente} />
      <ContratoModal open={contratoOpen} onClose={() => setContratoOpen(false)} cliente={cli} />
      <ContactoModal open={contactOpen} onClose={() => setContactOpen(false)} cliente={cli} />
      <EmpleadoProfileModal empleado={empleadoOpen} open={!!empleadoOpen} onClose={() => setEmpleadoOpen(null)} />
    </div>
  )
}

/* ============= COMPONENTES ============= */

function PersonaRow({ p, onOpenProfile }) {
  return (
    <div className="persona-row persona-row-clickable" onClick={onOpenProfile}>
      <div className="persona-avatar">{p.nombre.split(' ').map(w => w[0]).slice(0,2).join('')}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="persona-nombre">{p.nombre}</div>
        <div className="persona-meta mono">{p.puesto} · {p.turno} · ★ {p.rating}</div>
      </div>
      <Icon name="arrow_right" size={14} color="var(--ink-400)" />
    </div>
  )
}

function ActividadRow({ a }) {
  const ICONS = {
    reporte: 'alert', solicitud: 'package', nomina: 'cash', sla: 'check',
    mensaje: 'bell', contrato: 'file', incidente: 'alert', alerta: 'alert', cxc: 'cash',
  }
  const COLORS = {
    reporte: { bg: 'var(--bad-soft)', fg: '#991b1b' },
    solicitud: { bg: 'var(--mp-blue-100)', fg: 'var(--mp-blue-800)' },
    nomina: { bg: 'var(--ok-soft)', fg: '#065f46' },
    sla: { bg: 'var(--ok-soft)', fg: '#065f46' },
    mensaje: { bg: 'var(--info-soft)', fg: '#155e75' },
    contrato: { bg: 'var(--ink-100)', fg: 'var(--ink-700)' },
    incidente: { bg: 'var(--bad-soft)', fg: '#991b1b' },
    alerta: { bg: 'var(--warn-soft)', fg: '#92400e' },
    cxc: { bg: 'var(--warn-soft)', fg: '#92400e' },
  }
  const c = COLORS[a.tipo] || COLORS.contrato
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--ink-100)' }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={ICONS[a.tipo] || 'bell'} size={13} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-800)', lineHeight: 1.45 }}>{a.texto}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)', marginTop: 2 }}>{a.fecha}</div>
      </div>
    </div>
  )
}

function SLABar({ label, value, target, unit, invert }) {
  const onTarget = invert ? value <= target : value >= target
  const pct = invert ? Math.max(0, 100 - (value / (target * 2)) * 100) : Math.min(100, (value / target) * 100)
  return (
    <div>
      <div className="card-eyebrow">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }} className="mono">{value}{unit}</div>
        <div className={`mono`} style={{ fontSize: 11, color: onTarget ? 'var(--ok)' : 'var(--bad)', fontWeight: 500 }}>
          {onTarget ? '✓' : '!'} meta {target}{unit}
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--ink-100)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: onTarget ? 'var(--ok)' : 'var(--warn)', transition: 'width 0.4s' }}></div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, sub, trendUp, trendDown }) {
  return (
    <div className="kpi" style={{ padding: '14px 16px' }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ fontSize: 26 }}>{value}</div>
      <div className="kpi-meta" style={{ marginTop: 6 }}>
        {trendUp && <span className="kpi-trend up">↑</span>}
        {trendDown && <span className="kpi-trend down">↓</span>}
        {sub}
      </div>
    </div>
  )
}

function ConsumoChart({ data }) {
  const months = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr']
  const max = Math.max(100, ...data.flatMap(d => [d.stock, d.consumo]))
  return (
    <div className="chart-wrap">
      <div className="chart-legend">
        <span><span className="dot" style={{ background: 'var(--mp-blue-600)' }}></span> Stock disponible</span>
        <span><span className="dot" style={{ background: 'var(--axon-yellow)' }}></span> Consumo real</span>
      </div>
      <div className="chart-bars">
        {data.map((d, i) => (
          <div key={i} className="chart-bar-group">
            <div className="chart-bar-pair">
              <div className="chart-bar stock" style={{ height: (d.stock / max) * 100 + '%' }}>
                <span className="chart-bar-val mono">{d.stock}</span>
              </div>
              <div className="chart-bar consumo" style={{ height: (d.consumo / max) * 100 + '%' }}>
                <span className="chart-bar-val mono">{d.consumo}</span>
              </div>
            </div>
            <div className="chart-bar-label">{months[i]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============= MODALES ============= */

function NewClienteModal({ open, onClose, onCreate }) {
  const [data, setData] = useState({ nombre: '', sector: 'Corporativo', personal: 10, contrato: 'A' })
  const [submitting, setSubmitting] = useState(false)
  const valid = data.nombre.trim().length >= 3

  const submit = async () => {
    if (!valid) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    onCreate({ ...data, personal: parseInt(data.personal) || 1 })
    setSubmitting(false)
    setData({ nombre: '', sector: 'Corporativo', personal: 10, contrato: 'A' })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo cliente"
      eyebrow="Cartera"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className={`btn btn-primary ${submitting ? 'loading' : ''}`} disabled={!valid || submitting} onClick={submit}>
            <Icon name="check" size={14} /> Crear cliente
          </button>
        </>
      }
    >
      <div className="form-row">
        <label>Razón social / Nombre comercial</label>
        <input className="input" placeholder="Ej. Hotel Intercontinental Presidente" value={data.nombre} onChange={e => setData(d => ({ ...d, nombre: e.target.value }))} />
      </div>
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
        <div>
          <label>Sector</label>
          <select className="input" value={data.sector} onChange={e => setData(d => ({ ...d, sector: e.target.value }))}>
            {['Salud', 'Corporativo', 'Retail', 'Coworking', 'Educación', 'Hospitalidad', 'Industria'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label>Personal est.</label>
          <input className="input" type="number" min={1} value={data.personal} onChange={e => setData(d => ({ ...d, personal: e.target.value }))} />
        </div>
        <div>
          <label>Contrato</label>
          <select className="input" value={data.contrato} onChange={e => setData(d => ({ ...d, contrato: e.target.value }))}>
            {['A+', 'A', 'B', 'C'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}

function ContratoModal({ open, onClose, cliente }) {
  const toast = useToast()
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Contrato · ${cliente.nombre}`}
      eyebrow={`CLI-2024-${cliente.id.toUpperCase()}`}
      size="lg"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={() => {
            toast.success('Contrato descargado', `${cliente.nombre} · PDF`)
            onClose()
          }}><Icon name="download" size={14} /> Descargar PDF</button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            ['Tipo', cliente.contrato === 'A+' ? 'Premium' : cliente.contrato === 'A' ? 'Estándar Plus' : cliente.contrato === 'B' ? 'Estándar' : 'Básico'],
            ['Vigencia', `01 Ene ${new Date().getFullYear()} – 31 Dic ${new Date().getFullYear()}`],
            ['Cliente desde', `${cliente.desde}`],
            ['Renovación', 'Automática 12 meses'],
            ['Servicios', 'Limpieza diaria + mantenimiento'],
            ['Turnos', 'Matutino + Vespertino'],
            ['Personal contratado', `${cliente.personal} personas`],
            ['SLA Uptime', `${cliente.slaUptime}%`],
            ['SLA Respuesta', `${cliente.slaResp}h`],
            ['Penalidad', '10% por incumplimiento SLA'],
            ['Facturación', 'Mensual · día 1'],
            ['Crédito', '30 días'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: 10, background: 'var(--ink-50)', borderRadius: 8 }}>
              <div className="card-eyebrow">{k}</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="card-eyebrow" style={{ marginBottom: 6 }}>Cláusulas clave</div>
          <ol style={{ fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
            <li>Cumplimiento mínimo de checklist diario: 92%</li>
            <li>Tiempo máximo de respuesta a incidencias: {cliente.slaResp}h hábiles</li>
            <li>Reportes mensuales de calidad y rotación de personal</li>
            <li>Reemplazo de equipo dañado en &lt; 72h por Marplus</li>
            <li>Penalización del 10% sobre factura mensual por incumplimiento de SLA</li>
          </ol>
        </div>
      </div>
    </Modal>
  )
}



function ContactoModal({ open, onClose, cliente }) {
  const toast = useToast()
  const c = cliente.contacto
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Contacto principal"
      eyebrow={cliente.nombre}
      size="sm"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={() => { toast.success('Mensaje enviado', `${c.nombre} · WhatsApp`); onClose() }}>
            <Icon name="bell" size={14} /> Enviar WhatsApp
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'var(--ink-50)', borderRadius: 10, marginBottom: 14 }}>
        <div className="persona-avatar" style={{ width: 48, height: 48, fontSize: 14 }}>
          {c.nombre === '—' ? '—' : c.nombre.split(' ').map(w => w[0]).slice(0, 2).join('')}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{c.nombre}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 2 }}>{c.puesto}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {c.email && (
          <a href={`mailto:${c.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--ink-50)', borderRadius: 8, fontSize: 13 }}>
            <Icon name="file" size={14} color="var(--mp-blue-700)" />
            <span style={{ color: 'var(--mp-blue-700)', fontWeight: 500 }}>{c.email}</span>
          </a>
        )}
        {c.tel && (
          <a href={`tel:${c.tel.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--ink-50)', borderRadius: 8, fontSize: 13 }}>
            <Icon name="bell" size={14} color="var(--mp-blue-700)" />
            <span className="mono" style={{ color: 'var(--mp-blue-700)', fontWeight: 500 }}>{c.tel}</span>
          </a>
        )}
      </div>
    </Modal>
  )
}

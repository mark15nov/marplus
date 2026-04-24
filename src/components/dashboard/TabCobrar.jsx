import { useState } from 'react'
import { Icon } from '../Icons'
import { Modal, useToast } from '../ui.jsx'

const PAGOS_INIT = [
  { cliente: 'Hospital Ángeles Pedregal', factura: 'F-8821', monto: 264500, vence: '15 May', dias: 22, estado: 'al-corriente' },
  { cliente: 'Torre BBVA Reforma',         factura: 'F-8819', monto: 232300, vence: '02 May', dias: 9,  estado: 'al-corriente' },
  { cliente: 'Plaza Antara',               factura: 'F-8801', monto: 308400, vence: '08 Abr', dias: -15, estado: 'vencido-30' },
  { cliente: 'WeWork Insurgentes',         factura: 'F-8745', monto: 72400,  vence: '12 Mar', dias: -42, estado: 'vencido-60' },
  { cliente: 'Universidad Anáhuac Norte',  factura: 'F-8702', monto: 304600, vence: '18 Feb', dias: -64, estado: 'vencido-90' },
  { cliente: 'Corporativo Citibanamex',    factura: 'F-8820', monto: 184800, vence: '10 May', dias: 17, estado: 'al-corriente' },
]

const RECORDATORIOS_INIT = [
  { id: 1, cliente: 'Plaza Antara',         tipo: 'Email + WhatsApp', cuando: 'En 2 días',  estado: 'programado' },
  { id: 2, cliente: 'WeWork Insurgentes',   tipo: 'Llamada + Email',  cuando: 'Mañana 10am',estado: 'programado' },
  { id: 3, cliente: 'Universidad Anáhuac',  tipo: 'Reunión presencial',cuando: '25 Abr',    estado: 'programado' },
]

export default function TabCobrar() {
  const toast = useToast()
  const [pagos, setPagos] = useState(PAGOS_INIT)
  const [recordatorios, setRecordatorios] = useState(RECORDATORIOS_INIT)
  const [sending, setSending] = useState(null)
  const [payOpen, setPayOpen] = useState(null) // holds row being paid
  const [form, setForm] = useState({
    cliente: 'Plaza Antara',
    disparador: 'X días antes del vencimiento',
    dias: 3,
    hora: '10:00',
    email: true, wa: true, sms: false, call: false,
  })
  const [exporting, setExporting] = useState(false)

  const totales = {
    al_corriente: pagos.filter(p => p.estado === 'al-corriente').reduce((a, b) => a + b.monto, 0),
    v30: pagos.filter(p => p.estado === 'vencido-30').reduce((a, b) => a + b.monto, 0),
    v60: pagos.filter(p => p.estado === 'vencido-60').reduce((a, b) => a + b.monto, 0),
    v90: pagos.filter(p => p.estado === 'vencido-90').reduce((a, b) => a + b.monto, 0),
  }

  const sendReminder = async (p) => {
    setSending(p.factura)
    await new Promise(r => setTimeout(r, 700))
    setSending(null)
    toast.success('Recordatorio enviado', `${p.cliente} · ${p.factura} · Email + WhatsApp`)
  }

  const markPaid = (p) => {
    setPagos(prev => prev.map(x => x.factura === p.factura ? { ...x, estado: 'al-corriente', dias: Math.max(0, x.dias) } : x))
    setPayOpen(null)
    toast.success('Pago registrado', `${p.factura} · ${p.cliente} · $${p.monto.toLocaleString()}`)
  }

  const scheduleReminder = () => {
    const canales = []
    if (form.email) canales.push('Email')
    if (form.wa) canales.push('WhatsApp')
    if (form.sms) canales.push('SMS')
    if (form.call) canales.push('Llamada')
    if (!canales.length) { toast.warn('Canal faltante', 'Selecciona al menos un canal'); return }
    const id = Math.max(0, ...recordatorios.map(r => r.id)) + 1
    setRecordatorios(prev => [{
      id,
      cliente: form.cliente,
      tipo: canales.join(' + '),
      cuando: form.disparador === 'Fecha específica' ? form.hora : `${form.dias} días ${form.disparador.includes('antes') ? 'antes' : 'después'}`,
      estado: 'programado',
    }, ...prev])
    toast.success('Recordatorio programado', `${form.cliente} · ${canales.join(' + ')}`)
  }

  const removeReminder = (id) => {
    setRecordatorios(prev => prev.filter(r => r.id !== id))
    toast.info('Recordatorio eliminado', 'Regla removida')
  }

  const exportStatement = async () => {
    setExporting(true)
    await new Promise(r => setTimeout(r, 900))
    // Generate CSV and trigger download
    const header = 'Cliente,Factura,Monto,Vence,Dias,Estado\n'
    const rows = pagos.map(p => `${p.cliente},${p.factura},${p.monto},${p.vence},${p.dias},${p.estado}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estado-cuenta-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
    toast.success('Estado de cuenta', `${pagos.length} facturas · CSV descargado`)
  }

  return (
    <div className="page-grid" style={{ gap: 16 }}>
      {/* Aging Buckets */}
      <div className="page-grid grid-4">
        <AgingCard label="Al corriente" value={totales.al_corriente} count={pagos.filter(p => p.estado === 'al-corriente').length} tone="ok"   />
        <AgingCard label="Vencido 1-30 días" value={totales.v30} count={pagos.filter(p => p.estado === 'vencido-30').length} tone="warn" />
        <AgingCard label="Vencido 31-60 días" value={totales.v60} count={pagos.filter(p => p.estado === 'vencido-60').length} tone="bad-soft" />
        <AgingCard label="Vencido 60+ días" value={totales.v90} count={pagos.filter(p => p.estado === 'vencido-90').length} tone="bad" />
      </div>

      {/* Tabla de pagos */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-eyebrow">Cartera</div>
            <h3 className="card-title">Facturas pendientes y próximos pagos</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-ghost"
              onClick={() => toast.info('Filtros', 'Usa los bloques de antigüedad para filtrar por estado')}
            >
              <Icon name="filter" size={14} /> Filtrar
            </button>
            <button
              className={`btn btn-ghost ${exporting ? 'loading' : ''}`}
              disabled={exporting}
              onClick={exportStatement}
            >
              <Icon name="download" size={14} /> Estado de cuenta
            </button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Factura</th>
              <th>Monto MXN</th>
              <th>Vence</th>
              <th>Días</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pagos.map(p => (
              <tr key={p.factura}>
                <td style={{ fontWeight: 500 }}>{p.cliente}</td>
                <td><span className="mono" style={{ color: 'var(--mp-blue-700)', fontSize: 12 }}>{p.factura}</span></td>
                <td><span className="mono">${p.monto.toLocaleString()}</span></td>
                <td className="mono" style={{ fontSize: 12 }}>{p.vence}</td>
                <td>
                  <span className={`mono ${p.dias < 0 ? 'overdue' : 'upcoming'}`}
                        style={{ fontSize: 12, fontWeight: 500, color: p.dias < 0 ? 'var(--bad)' : 'var(--ink-700)' }}>
                    {p.dias < 0 ? `${p.dias}` : `+${p.dias}`}
                  </span>
                </td>
                <td>
                  {p.estado === 'al-corriente' && <span className="tag ok">Al corriente</span>}
                  {p.estado === 'vencido-30'   && <span className="tag warn">Vencido 30</span>}
                  {p.estado === 'vencido-60'   && <span className="tag bad">Vencido 60</span>}
                  {p.estado === 'vencido-90'   && <span className="tag bad">Vencido 90+</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className={`btn-icon ${sending === p.factura ? 'loading' : ''}`}
                      title="Enviar recordatorio"
                      onClick={() => sendReminder(p)}
                      disabled={sending === p.factura}
                    >
                      <Icon name="bell" size={14} />
                    </button>
                    {p.estado !== 'al-corriente' && (
                      <button
                        className="btn-icon"
                        title="Marcar como pagado"
                        onClick={() => setPayOpen(p)}
                      >
                        <Icon name="check" size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recordatorios */}
      <div className="page-grid grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Automatización</div>
              <h3 className="card-title">Recordatorios programados · {recordatorios.length}</h3>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => toast.info('Nuevo recordatorio', 'Usa el panel de la derecha →')}
            >
              <Icon name="plus" size={14} /> Nuevo
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recordatorios.length === 0 ? (
              <div className="empty-state">Sin recordatorios programados</div>
            ) : recordatorios.map(r => (
              <div key={r.id} className="recordatorio-row">
                <div className="recordatorio-icon">
                  <Icon name="bell" size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.cliente}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{r.tipo}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-700)' }}>{r.cuando}</div>
                  <span className="tag info" style={{ marginTop: 4 }}>{r.estado}</span>
                </div>
                <button
                  className="btn-icon"
                  style={{ marginLeft: 8 }}
                  onClick={() => removeReminder(r.id)}
                  title="Eliminar recordatorio"
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Nuevo recordatorio</div>
              <h3 className="card-title">Configurar regla automática</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="form-row">
              <label>Cliente</label>
              <select className="input" value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))}>
                {['Plaza Antara', 'WeWork Insurgentes', 'Universidad Anáhuac', 'Hospital Ángeles Pedregal', 'Torre BBVA Reforma'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Disparador</label>
              <select className="input" value={form.disparador} onChange={e => setForm(f => ({ ...f, disparador: e.target.value }))}>
                <option>X días antes del vencimiento</option>
                <option>X días después del vencimiento</option>
                <option>Fecha específica</option>
              </select>
            </div>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label>Días</label>
                <input
                  className="input"
                  type="number"
                  value={form.dias}
                  onChange={e => setForm(f => ({ ...f, dias: e.target.value }))}
                  disabled={form.disparador === 'Fecha específica'}
                />
              </div>
              <div>
                <label>Hora</label>
                <input
                  className="input"
                  type="time"
                  value={form.hora}
                  onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-row">
              <label>Canal</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <label className="check-pill"><input type="checkbox" checked={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.checked }))} /> Email</label>
                <label className="check-pill"><input type="checkbox" checked={form.wa} onChange={e => setForm(f => ({ ...f, wa: e.target.checked }))} /> WhatsApp</label>
                <label className="check-pill"><input type="checkbox" checked={form.sms} onChange={e => setForm(f => ({ ...f, sms: e.target.checked }))} /> SMS</label>
                <label className="check-pill"><input type="checkbox" checked={form.call} onChange={e => setForm(f => ({ ...f, call: e.target.checked }))} /> Llamada</label>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={scheduleReminder}>
              <Icon name="check" size={14} /> Programar recordatorio
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={!!payOpen}
        onClose={() => setPayOpen(null)}
        title="Registrar pago"
        size="sm"
        footer={payOpen && (
          <>
            <button className="btn btn-ghost" onClick={() => setPayOpen(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={() => markPaid(payOpen)}>
              <Icon name="check" size={14} /> Registrar pago
            </button>
          </>
        )}
      >
        {payOpen && (
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink-700)' }}>
              Confirma el pago de <strong>{payOpen.factura}</strong> de <strong>{payOpen.cliente}</strong>.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 12, background: 'var(--ink-50)', borderRadius: 8 }}>
              <div>
                <div className="card-eyebrow">Monto</div>
                <div style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }} className="mono">${payOpen.monto.toLocaleString()}</div>
              </div>
              <div>
                <div className="card-eyebrow">Vencimiento</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }} className="mono">{payOpen.vence}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function AgingCard({ label, value, count, tone }) {
  const colorMap = {
    ok: { bg: 'var(--ok-soft)', fg: '#065f46', bar: 'var(--ok)' },
    warn: { bg: 'var(--warn-soft)', fg: '#92400e', bar: 'var(--warn)' },
    'bad-soft': { bg: '#fef2f2', fg: '#991b1b', bar: '#f87171' },
    bad: { bg: 'var(--bad-soft)', fg: '#991b1b', bar: 'var(--bad)' },
  }
  const c = colorMap[tone]
  return (
    <div className="aging-card">
      <div className="aging-bar" style={{ background: c.bar }}></div>
      <div className="aging-info">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value" style={{ fontSize: 26 }}>${(value / 1000).toFixed(1)}<span className="kpi-unit">K</span></div>
        <div className="kpi-meta"><span className="tag" style={{ background: c.bg, color: c.fg }}>{count} {count === 1 ? 'factura' : 'facturas'}</span></div>
      </div>
    </div>
  )
}

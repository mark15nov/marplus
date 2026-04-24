import { Modal, DropdownMenu, useToast } from './ui.jsx'
import { Icon } from './Icons'
import { CLIENTES } from '../data.js'

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function deriveEmpleado(emp) {
  const h = hashStr(emp.nombre)
  const id = 'EMP-' + (1000 + (h % 9000))
  const parts = emp.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(' ')
  const email = `${parts[0]}.${parts[1] || 'marplus'}@marplus.mx`
  const tel = `55 ${String(1000 + (h % 9000)).padStart(4, '0')} ${String(1000 + ((h >> 4) % 9000)).padStart(4, '0')}`
  const asistencia = Math.max(88, Math.min(100, Math.round(emp.rating * 20)))
  const faltas = Math.max(0, Math.round((4.9 - emp.rating) * 3))
  const retardos = Math.max(0, Math.round((5 - emp.rating) * 2))
  const bonos = emp.rating >= 4.7 ? 800 : emp.rating >= 4.5 ? 400 : 0
  const incidentes = Math.max(0, Math.round((4.8 - emp.rating) * 1.5))
  return { id, email, tel, asistencia, faltas, retardos, bonos, incidentes }
}

const MOCK_HISTORIAL = (emp) => {
  const events = []
  const h = hashStr(emp.nombre)
  if ((h % 5) === 0) events.push({ fecha: 'Hoy', tipo: 'bono', texto: `Bono de desempeño · +$${400 + (h % 400)}` })
  events.push({ fecha: 'Hace 3 días', tipo: 'asistencia', texto: 'Checkin matutino · 06:52 AM' })
  if ((h % 7) === 0) events.push({ fecha: 'Hace 1 semana', tipo: 'incidente', texto: 'Retardo de 18 min · justificado' })
  events.push({ fecha: 'Hace 2 semanas', tipo: 'capacitacion', texto: 'Curso NOM-035 · aprobado' })
  events.push({ fecha: emp.desde, tipo: 'alta', texto: `Alta en Marplus · ${emp.puesto}` })
  return events
}

const TIPO_MAP = {
  bono:         { icon: 'cash',   color: { bg: 'var(--ok-soft)',   fg: '#065f46' } },
  asistencia:   { icon: 'check',  color: { bg: 'var(--mp-blue-100)', fg: 'var(--mp-blue-800)' } },
  incidente:    { icon: 'alert',  color: { bg: 'var(--warn-soft)', fg: '#92400e' } },
  capacitacion: { icon: 'file',   color: { bg: 'var(--info-soft)', fg: '#155e75' } },
  alta:         { icon: 'user',   color: { bg: 'var(--ink-100)',   fg: 'var(--ink-700)' } },
}

export function EmpleadoProfileModal({ empleado, open, onClose }) {
  const toast = useToast()
  if (!empleado) return null

  const d = deriveEmpleado(empleado)
  const cliente = empleado.cliente ? CLIENTES.find(c => c.id === empleado.cliente) : null
  const initials = empleado.nombre.split(' ').map(w => w[0]).slice(0, 2).join('')
  const historial = MOCK_HISTORIAL(empleado)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={empleado.nombre}
      eyebrow={`${d.id} · Perfil de empleado`}
      size="lg"
      footer={
        <>
          <DropdownMenu
            align="left"
            trigger={<button className="btn btn-ghost"><Icon name="more" size={14} /> Acciones</button>}
            items={[
              { icon: 'refresh', label: 'Re-sincronizar con NOI', onClick: () => toast.success('NOI', `${empleado.nombre} re-sincronizado`) },
              { icon: 'calendar', label: 'Ver asistencia completa', onClick: () => toast.info('Asistencia', `${d.asistencia}% últimos 30 días`) },
              { icon: 'download', label: 'Descargar recibo de nómina', onClick: () => toast.success('Recibo descargado', `${empleado.nombre} · PDF`) },
              { divider: true },
              { icon: 'x', label: 'Dar de baja', danger: true, onClick: () => toast.warn('Baja', 'Abrir flujo de baja · demo') },
            ]}
          />
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={() => { toast.success('Mensaje enviado', `WhatsApp a ${empleado.nombre}`); onClose?.() }}>
            <Icon name="bell" size={14} /> Enviar mensaje
          </button>
        </>
      }
    >
      <div className="profile-wrap">
        {/* Header strip */}
        <div className="profile-hero">
          <div className="profile-avatar-xl">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="profile-role">{empleado.puesto}</div>
            <div className="profile-subrow">
              {cliente ? (
                <span><Icon name="building" size={12} /> {cliente.nombre}</span>
              ) : (
                <span><Icon name="building" size={12} /> Sin cliente asignado</span>
              )}
              <span>·</span>
              <span style={{ textTransform: 'capitalize' }}><Icon name="pin" size={12} /> Zona {empleado.zona}</span>
              <span>·</span>
              <span><Icon name="clock" size={12} /> {empleado.turno}</span>
            </div>
            <div className="profile-rating">
              <span className="rating-badge">★ {empleado.rating}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>
                Rating operativo · {empleado.antiguedad} de antigüedad
              </span>
            </div>
          </div>
        </div>

        {/* Stats del mes */}
        <div className="profile-section-title">Desempeño · últimos 30 días</div>
        <div className="profile-stats">
          <StatTile label="Asistencia" value={`${d.asistencia}%`} tone={d.asistencia >= 95 ? 'ok' : 'warn'} />
          <StatTile label="Faltas" value={d.faltas} tone={d.faltas === 0 ? 'ok' : 'warn'} />
          <StatTile label="Retardos" value={d.retardos} tone={d.retardos <= 2 ? 'ok' : 'warn'} />
          <StatTile label="Bonos" value={d.bonos ? `$${d.bonos}` : '—'} tone="muted" />
        </div>

        {/* Información */}
        <div className="profile-section-title">Información</div>
        <div className="profile-info-grid">
          <InfoRow label="ID empleado" value={d.id} mono />
          <InfoRow label="Sueldo base" value={`$${empleado.sueldo.toLocaleString()} MXN`} mono />
          <InfoRow label="Alta en Marplus" value={empleado.desde} mono />
          <InfoRow label="Antigüedad" value={empleado.antiguedad} mono />
          <InfoRow label="Email" value={d.email} mono link={`mailto:${d.email}`} />
          <InfoRow label="Teléfono" value={d.tel} mono link={`tel:${d.tel.replace(/\s/g, '')}`} />
          <InfoRow label="NOI" value={<span className="tag ok">Sincronizado</span>} />
          <InfoRow label="Estado" value={<span className="tag ok">Activo</span>} />
        </div>

        {/* Historial */}
        <div className="profile-section-title">Historial reciente</div>
        <div className="profile-historial">
          {historial.map((h, i) => {
            const cfg = TIPO_MAP[h.tipo] || TIPO_MAP.alta
            return (
              <div key={i} className="historial-row">
                <div className="historial-icon" style={{ background: cfg.color.bg, color: cfg.color.fg }}>
                  <Icon name={cfg.icon} size={12} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-800)' }}>{h.texto}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)', marginTop: 2 }}>{h.fecha}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

function StatTile({ label, value, tone }) {
  const bgMap = {
    ok: 'var(--ok-soft)',
    warn: 'var(--warn-soft)',
    muted: 'var(--ink-50)',
  }
  return (
    <div className="stat-tile" style={{ background: bgMap[tone] || 'var(--ink-50)' }}>
      <div className="stat-tile-label">{label}</div>
      <div className="stat-tile-value mono">{value}</div>
    </div>
  )
}

function InfoRow({ label, value, mono, link }) {
  return (
    <div className="info-row">
      <div className="info-row-label">{label}</div>
      <div className={`info-row-value ${mono ? 'mono' : ''}`}>
        {link ? <a href={link} style={{ color: 'var(--mp-blue-700)' }}>{value}</a> : value}
      </div>
    </div>
  )
}

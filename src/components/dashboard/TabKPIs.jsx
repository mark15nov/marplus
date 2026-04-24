import { useState } from 'react'
import { Icon } from '../Icons'
import { useToast } from '../ui.jsx'

const KPIS = [
  { label: 'Calidad operativa',       value: 94.2, unit: '%', target: 92, trend: 'up',   delta: '+1.8' },
  { label: 'Cumplimiento de tareas',  value: 88.5, unit: '%', target: 90, trend: 'down', delta: '-1.2' },
  { label: 'Tiempo de respuesta',     value: 2.4,  unit: 'h', target: 3,  trend: 'up',   delta: '-0.4' },
  { label: 'Retención personal',      value: 81,   unit: '%', target: 75, trend: 'up',   delta: '+3.0' },
  { label: 'Ausentismo',              value: 4.8,  unit: '%', target: 5,  trend: 'up',   delta: '-0.6' },
  { label: 'Satisfacción cliente',    value: 9.2,  unit: '/10', target: 8.5, trend: 'up', delta: '+0.4' },
  { label: 'Margen operativo',        value: 32.4, unit: '%', target: 30, trend: 'up',   delta: '+2.1' },
  { label: 'NPS',                     value: 72,   unit: '',  target: 60, trend: 'up',   delta: '+8'   },
]

import { CLIENTES } from '../../data.js'

const CONTRIBUCION = CLIENTES.map(c => {
  const ingresos = Math.round(c.mrr * 1000)
  const costos = Math.round(ingresos * (1 - c.margen / 100))
  return { cliente: c.nombre, ingresos, costos, margen: c.margen }
})

const PERIOD_MULT = { MES: 0.34, TRIMESTRE: 1, AÑO: 4.1 }

export default function TabKPIs() {
  const toast = useToast()
  const [period, setPeriod] = useState('TRIMESTRE')
  const mult = PERIOD_MULT[period]

  return (
    <div className="page-grid" style={{ gap: 16 }}>
      {/* KPIs grid */}
      <div className="kpi-grid">
        {KPIS.map(k => <KPICard key={k.label} {...k} />)}
      </div>

      {/* Contribución por cliente */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-eyebrow">Análisis de rentabilidad</div>
            <h3 className="card-title">Contribución por cliente · ingresos vs costos</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['MES', 'TRIMESTRE', 'AÑO'].map(p => (
              <button
                key={p}
                className="btn btn-ghost mono"
                style={{
                  fontSize: 11,
                  ...(period === p ? { background: 'var(--mp-blue-50)', borderColor: 'var(--mp-blue-300)', color: 'var(--mp-blue-800)' } : {})
                }}
                onClick={() => { setPeriod(p); toast.info('Período actualizado', `Vista: ${p}`) }}
              >{p}</button>
            ))}
          </div>
        </div>
        <div className="card-body">
          {CONTRIBUCION.map((c, i) => {
            const ing = c.ingresos * mult
            const cost = c.costos * mult
            const maxVal = Math.max(...CONTRIBUCION.map(x => x.ingresos)) * mult
            return (
              <div
                key={i}
                className="contribucion-row"
                onClick={() => toast.info(c.cliente, `Ingresos ${period}: $${(ing/1000).toFixed(0)}K · Margen ${c.margen.toFixed(1)}%`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="contribucion-label">{c.cliente}</div>
                <div className="contribucion-bar-wrap">
                  <div className="contribucion-bar costos" style={{ width: (cost / maxVal) * 100 + '%' }}>
                    <span className="contribucion-val mono">${(cost / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="contribucion-bar ingresos" style={{ width: (ing / maxVal) * 100 + '%' }}>
                    <span className="contribucion-val mono">${(ing / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <div className={`contribucion-margen mono ${c.margen < 20 ? 'low' : c.margen > 35 ? 'high' : ''}`}>
                  {c.margen.toFixed(1)}%
                </div>
              </div>
            )
          })}
          <div className="contribucion-legend mono">
            <span><span className="dot" style={{ background: 'var(--mp-blue-600)' }}></span> Ingresos</span>
            <span><span className="dot" style={{ background: 'var(--ink-300)' }}></span> Costos</span>
            <span style={{ marginLeft: 'auto' }}>Margen objetivo: <strong style={{ color: 'var(--ink-900)' }}>30%</strong></span>
          </div>
        </div>
      </div>

      {/* Cumplimiento + Satisfacción */}
      <div className="page-grid grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Operación</div>
              <h3 className="card-title">Cumplimiento por turno · últimos 7 días</h3>
            </div>
          </div>
          <div className="card-body">
            <CumplimientoChart />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">Calidad</div>
              <h3 className="card-title">Distribución de satisfacción</h3>
            </div>
          </div>
          <div className="card-body">
            <SatisfaccionChart />
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, unit, target, trend, delta }) {
  const pct = unit === '%' ? value : (value / target) * 100
  const onTarget = unit === '%' ? value >= target : (unit === 'h' ? value <= target : value >= target)

  return (
    <div className="kpi-card-pro">
      <div className="kpi-label">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '8px 0 12px' }}>
        <div className="kpi-value" style={{ fontSize: 32 }}>{value}<span className="kpi-unit">{unit}</span></div>
        <div className={`kpi-delta mono ${trend === 'up' ? 'up' : 'down'}`}>
          {trend === 'up' ? '↑' : '↓'} {delta}
        </div>
      </div>
      <div className="kpi-target-bar">
        <div className="kpi-target-fill" style={{ width: Math.min(pct, 100) + '%', background: onTarget ? 'var(--ok)' : 'var(--warn)' }}></div>
        <div className="kpi-target-marker" style={{ left: '85%' }}></div>
      </div>
      <div className="kpi-target-label mono">Meta {target}{unit}</div>
    </div>
  )
}

function CumplimientoChart() {
  const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const data = [
    { mat: 92, ves: 88 },
    { mat: 95, ves: 91 },
    { mat: 89, ves: 86 },
    { mat: 94, ves: 90 },
    { mat: 97, ves: 93 },
    { mat: 88, ves: 84 },
    { mat: 82, ves: 79 },
  ]

  return (
    <div className="cumpl-chart">
      <div className="cumpl-y-axis mono">
        <span>100</span><span>75</span><span>50</span>
      </div>
      <div className="cumpl-bars">
        {data.map((d, i) => (
          <div key={i} className="cumpl-day">
            <div className="cumpl-bar-pair">
              <div className="cumpl-bar mat" style={{ height: d.mat + '%' }} title={`${d.mat}%`}></div>
              <div className="cumpl-bar ves" style={{ height: d.ves + '%' }} title={`${d.ves}%`}></div>
            </div>
            <div className="cumpl-day-label">{dias[i]}</div>
          </div>
        ))}
      </div>
      <div className="cumpl-legend mono">
        <span><span className="dot" style={{ background: 'var(--mp-blue-600)' }}></span> Matutino</span>
        <span><span className="dot" style={{ background: 'var(--mp-blue-300)' }}></span> Vespertino</span>
      </div>
    </div>
  )
}

function SatisfaccionChart() {
  const buckets = [
    { label: 'Excelente (9-10)', value: 64, color: 'var(--ok)' },
    { label: 'Bueno (7-8)',      value: 24, color: 'var(--mp-blue-500)' },
    { label: 'Regular (5-6)',    value: 9,  color: 'var(--warn)' },
    { label: 'Malo (1-4)',       value: 3,  color: 'var(--bad)' },
  ]

  return (
    <>
      <div className="satis-bar-stacked">
        {buckets.map((b, i) => (
          <div key={i} className="satis-segment" style={{ width: b.value + '%', background: b.color }} title={`${b.label}: ${b.value}%`}></div>
        ))}
      </div>
      <div className="satis-list">
        {buckets.map((b, i) => (
          <div key={i} className="satis-row">
            <span className="dot" style={{ background: b.color }}></span>
            <span style={{ flex: 1, fontSize: 13 }}>{b.label}</span>
            <span className="mono" style={{ fontWeight: 500 }}>{b.value}%</span>
          </div>
        ))}
      </div>
    </>
  )
}

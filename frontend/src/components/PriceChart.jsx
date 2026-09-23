import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import './PriceChart.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="tooltip-date">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <strong>₹{Number(p.value).toFixed(2)}</strong>
        </div>
      ))}
    </div>
  )
}

export default function PriceChart({ stockData, loading }) {
  if (loading) {
    return (
      <div className="card chart-card">
        <div className="skeleton" style={{ height: 24, width: 200, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    )
  }

  if (!stockData) return null

  const data = stockData.history.map(d => ({
    date:      d.date.slice(5),
    'Actual Close':              d.close,
    'Model Predicted Close':     d.predicted,
  }))

  const vals = stockData.history.flatMap(d => [d.close, d.predicted])
  const min = Math.floor(Math.min(...vals) * 0.98)
  const max = Math.ceil(Math.max(...vals) * 1.02)

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-title">{stockData.name}</div>
          <div className="chart-sub">
            Last 90 trading days — Actual Close vs Model's Predicted Close
          </div>
        </div>
        <div className="chart-badges">
          <span className="badge badge-green">R² {stockData.r2}</span>
          <span className="badge badge-indigo">MAE ₹{stockData.mae}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#7b8db0', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={14}
          />
          <YAxis
            domain={[min, max]}
            tick={{ fill: '#7b8db0', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `₹${v}`}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 13, color: '#7b8db0', paddingTop: 12 }} />
          <Area
            type="monotone"
            dataKey="Actual Close"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#colorActual)"
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />
          <Area
            type="monotone"
            dataKey="Model Predicted Close"
            stroke="#10b981"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            fill="url(#colorPredicted)"
            dot={false}
            activeDot={{ r: 4, fill: '#10b981' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import './ComparisonChart.css'

const COLORS = {
  'ITC.NS': '#6366f1',
  'TCS.NS': '#10b981',
  'HDFCBANK.NS': '#f59e0b',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="comp-tooltip">
      <div className="tooltip-date">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span>{p.name.replace('.NS', '')}:</span>
          <strong>₹{Number(p.value).toFixed(2)}</strong>
        </div>
      ))}
    </div>
  )
}

export default function ComparisonChart({ compareData, selectedTicker }) {
  if (!compareData) {
    return (
      <div className="card">
        <div className="skeleton" style={{ height: 280 }} />
      </div>
    )
  }

  const tickers = Object.keys(compareData)
  const baseLen = compareData[tickers[0]]?.history?.length ?? 0

  const data = Array.from({ length: baseLen }, (_, i) => {
    const row = { date: compareData[tickers[0]].history[i]?.date.slice(5) }
    tickers.forEach(t => {
      row[t] = compareData[t].history[i]?.close
    })
    return row
  })

  return (
    <div className="card comp-card">
      <div className="comp-header">
        <div className="comp-title">📊 Multi-Stock Comparison – Last 90 Days</div>
        <div className="comp-legend">
          {tickers.map(t => (
            <span key={t} className={`comp-tag ${t === selectedTicker ? 'active' : ''}`}>
              <span style={{ background: COLORS[t] }} className="comp-dot" />
              {compareData[t].name}
            </span>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#7b8db0', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={14}
          />
          <YAxis
            tick={{ fill: '#7b8db0', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `₹${v}`}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          {tickers.map(t => (
            <Line
              key={t}
              type="monotone"
              dataKey={t}
              name={t}
              stroke={COLORS[t]}
              strokeWidth={t === selectedTicker ? 2.5 : 1.5}
              dot={false}
              activeDot={{ r: 4 }}
              opacity={t === selectedTicker ? 1 : 0.65}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

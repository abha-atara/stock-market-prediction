import './StatsCards.css'

const fmt = (v) => v !== undefined && v !== null ? `₹${Number(v).toFixed(2)}` : '—'
const fmtVol = (v) => v ? Number(v).toLocaleString('en-IN') : '—'

function StatCard({ label, value, sub, color, loading }) {
  return (
    <div className={`stat-card ${color}`}>
      {loading ? (
        <>
          <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 28, width: 120 }} />
        </>
      ) : (
        <>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
          {sub && <div className="stat-sub">{sub}</div>}
        </>
      )}
    </div>
  )
}

export default function StatsCards({ latest, stockData, loading }) {
  const lastClose = latest?.close
  const prev = stockData?.history?.at(-2)?.close
  const change = lastClose && prev ? (lastClose - prev) : null
  const changePct = change && prev ? (change / prev * 100) : null
  const isUp = change > 0

  const isITC = stockData?.ticker === 'ITC.NS'

  return (
    <div className="stats-row">
      <StatCard
        label="Last Close"
        value={fmt(lastClose)}
        sub={
          change !== null
            ? <span style={{ color: isUp ? '#10b981' : '#ef4444' }}>
                {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)} ({Math.abs(changePct).toFixed(2)}%)
              </span>
            : null
        }
        color="indigo"
        loading={loading}
      />
      <StatCard label="Open" value={fmt(latest?.open)} color="default" loading={loading} />
      <StatCard label="High" value={fmt(latest?.high)} color="green" loading={loading} />
      <StatCard label="Low" value={fmt(latest?.low)} color="red" loading={loading} />
      <StatCard label="Volume" value={fmtVol(latest?.volume)} color="amber" loading={loading} />
      <StatCard
        label="Last Updated"
        value={latest?.date ?? '—'}
        color="default"
        loading={loading}
      />
      <StatCard
        label="Model Used"
        value={stockData?.model_name ?? '—'}
        color="amber"
        loading={loading}
      />
      <StatCard
        label="Test R²"
        value={stockData?.r2 !== undefined ? stockData.r2 : '—'}
        sub="on held-out test set"
        color="indigo"
        loading={loading}
      />
      <StatCard
        label="CV R² (Stable)"
        value={stockData?.cv_r2 !== undefined && stockData?.cv_r2 !== null ? stockData.cv_r2 : '—'}
        sub="5-fold time-series CV"
        color="indigo"
        loading={loading}
      />
      <StatCard
        label="MAE"
        value={stockData?.mae !== undefined ? `₹${stockData.mae}` : '—'}
        sub="avg prediction error"
        color="amber"
        loading={loading}
      />
      <StatCard
        label="Bagging / Boosting"
        value={stockData?.bagging_boosting_status || (isITC ? 'Not Needed' : 'Applied (RF)')}
        sub={isITC ? 'Evaluated — negligible variance' : '200 trees ensemble'}
        color={isITC ? 'green' : 'indigo'}
        loading={loading}
      />
      <StatCard
        label="Hyperparameter Tuning"
        value="GridSearchCV"
        sub={isITC ? 'Ridge alpha, SVR C/gamma' : 'RF n_estimators, max_depth'}
        color="green"
        loading={loading}
      />
    </div>
  )
}

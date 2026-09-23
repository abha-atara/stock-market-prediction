import { useState, useEffect } from 'react'
import './PredictPanel.css'

export default function PredictPanel({ ticker, latest, api, modelName }) {
  const [inputs, setInputs] = useState({ open: '', high: '', low: '', volume: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (latest) {
      setInputs({
        open: latest.open,
        high: latest.high,
        low: latest.low,
        volume: latest.volume,
      })
      setResult(null)
      setRevealed(false)
      setError(null)
    }
  }, [latest, ticker])

  const handleChange = (field, val) => {
    setInputs(p => ({ ...p, [field]: val }))
    setResult(null)
    setRevealed(false)
    setError(null)
  }

  const predict = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setRevealed(false)

    try {
      const res = await fetch(`${api}/api/stock/${ticker}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          open: parseFloat(inputs.open),
          high: parseFloat(inputs.high),
          low: parseFloat(inputs.low),
          volume: parseFloat(inputs.volume),
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error (${res.status})`)
      }
      const data = await res.json()
      setResult(data.predicted_close)
      setTimeout(() => setRevealed(true), 50)
    } catch (err) {
      setError(err.message || 'Failed to get prediction. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const isValid = Object.values(inputs).every(v => v !== '' && !isNaN(Number(v)))
  const lastClose = latest?.close

  return (
    <div className="card predict-panel">
      <div className="predict-header">
        <div className="predict-title">🎯 Predict Tomorrow's Closing Price</div>
        <div className="predict-sub">Input today's market values → model predicts next day close</div>
      </div>

      <div className="predict-fields">
        {[
          { key: 'open', label: 'Open Price', icon: '◎' },
          { key: 'high', label: 'Day High', icon: '↑' },
          { key: 'low', label: 'Day Low', icon: '↓' },
          { key: 'volume', label: 'Volume', icon: '⊞' },
        ].map(({ key, label, icon }) => (
          <div key={key} className="field-group">
            <label className="field-label">
              <span className="field-icon">{icon}</span>
              {label}
            </label>
            <input
              type="number"
              className="field-input"
              value={inputs[key]}
              onChange={e => handleChange(key, e.target.value)}
              placeholder="0.00"
              step={key === 'volume' ? 1 : 0.01}
            />
          </div>
        ))}
      </div>

      <button
        className={`predict-btn ${loading ? 'loading' : ''}`}
        onClick={predict}
        disabled={!isValid || loading}
        id="predict-button"
      >
        {loading ? (
          <span className="btn-spinner" />
        ) : (
          '▶ Predict Tomorrow\'s Close'
        )}
      </button>

      {error && (
        <div className="predict-error">{error}</div>
      )}

      {result !== null && (
        <div className={`predict-result ${revealed ? 'revealed' : ''}`}>
          <div className="result-label">Predicted Close Price</div>
          <div className="result-value">₹{result.toFixed(2)}</div>
          {lastClose && (
            <div className="result-diff">
              {result > lastClose
                ? <span className="diff-up">▲ ₹{(result - lastClose).toFixed(2)} vs today's close</span>
                : <span className="diff-down">▼ ₹{(lastClose - result).toFixed(2)} vs today's close</span>
              }
            </div>
          )}
          <div className="result-note">Based on {modelName || 'ML'} model</div>
        </div>
      )}
    </div>
  )
}

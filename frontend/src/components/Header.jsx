import './Header.css'

export default function Header({ stocks, selectedTicker, onSelect, currentStock, page, onPageChange }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">📈</span>
            <div>
              <div className="logo-title">StockPredict</div>
              <div className="logo-sub">ML-Powered Next Day Close Predictor</div>
            </div>
          </div>

          {page === 'dashboard' && currentStock && (
            <div className="header-badges">
              <span className="badge badge-green">R² {currentStock.r2}</span>
              <span className="badge badge-indigo">MAE ₹{currentStock.mae}</span>
              <span className="badge badge-amber">{currentStock.model_name}</span>
            </div>
          )}
        </div>

        <div className="header-right">
          <nav className="header-nav">
            <button
              className={`nav-tab ${page === 'dashboard' ? 'active' : ''}`}
              onClick={() => onPageChange('dashboard')}
            >
              <span>📊</span> Dashboard
            </button>
            <button
              className={`nav-tab ${page === 'about' ? 'active' : ''}`}
              onClick={() => onPageChange('about')}
            >
              <span>ℹ️</span> About
            </button>
          </nav>

          {page === 'dashboard' && (
            <>
              <label className="select-label">Select Stock</label>
              <select
                id="stock-select"
                className="stock-select"
                value={selectedTicker}
                onChange={e => onSelect(e.target.value)}
              >
                {stocks.map(s => (
                  <option key={s.ticker} value={s.ticker}>
                    {s.name} ({s.ticker})
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      <div className="header-divider" />
    </header>
  )
}

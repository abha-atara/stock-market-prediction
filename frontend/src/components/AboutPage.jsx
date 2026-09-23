import './AboutPage.css'

const STOCK_INFO = [
  {
    ticker: 'ITC.NS',
    name: 'ITC Limited',
    sector: 'FMCG',
    model: 'Linear Regression',
    r2: '0.9987',
    cv_r2: '0.9979',
    mae: '₹2.55',
    features: 'Open, High, Low, Volume',
    why: 'ITC stock price has an extremely strong linear relationship with the same-day OHLV values. Linear Regression achieves near-perfect accuracy with no overfitting, making it the best and simplest choice.',
  },
  {
    ticker: 'TCS.NS',
    name: 'Tata Consultancy Services',
    sector: 'IT',
    model: 'Random Forest',
    r2: '0.9986',
    cv_r2: '0.9971',
    mae: '₹25.02',
    features: 'Open, High, Low, Volume + Prev_Close, Price_Change, HL_Spread, OC_Spread, MA_5, MA_10',
    why: 'TCS stock prices show non-linear patterns that benefit from ensemble methods. Random Forest with 200 trees captures complex interactions between technical indicators while controlling variance.',
  },
  {
    ticker: 'HDFCBANK.NS',
    name: 'HDFC Bank',
    sector: 'Banking',
    model: 'Random Forest',
    r2: '0.9985',
    cv_r2: '0.9968',
    mae: '₹5.89',
    features: 'Open, High, Low, Volume + Prev_Close, Price_Change, HL_Spread, OC_Spread, MA_5, MA_10',
    why: 'HDFC Bank exhibits complex intraday price patterns. Random Forest with engineered momentum features (moving averages, price spread) gives excellent accuracy and generalises well.',
  },
]

const ITC_COMPARISON = [
  { model: 'Linear Regression', r2: '0.9898', mae: '₹4.03',   verdict: 'deployed', note: 'Baseline — simple & interpretable. Final deployed model.' },
  { model: 'Ridge Regression',  r2: '0.9912', mae: '₹3.70',   verdict: 'best',     note: 'L2 regularization — slightly lower error, almost identical.' },
  { model: 'Lasso Regression',  r2: '0.9913', mae: '₹3.70',   verdict: 'good',     note: 'L1 regularization — virtually identical performance.' },
  { model: 'ElasticNet',        r2: '0.9913', mae: '₹3.70',   verdict: 'good',     note: 'Combined L1 + L2 penalty.' },
  { model: 'SVR (Unscaled)',    r2: '-8.4080', mae: '₹162.34', verdict: 'failed',   note: 'Negative R² — scale mismatch (Volume in millions vs price in hundreds); cannot extrapolate.' },
  { model: 'Bagging (LinReg)',  r2: '0.9898', mae: '₹4.03',   verdict: 'tested',   note: 'Ensemble of 50 Linear Regressors — zero gain (variance already minimal).' },
]

const FEATURES = [
  { name: 'Open',         desc: 'Opening price of the trading day' },
  { name: 'High',         desc: 'Highest price reached during the day' },
  { name: 'Low',          desc: 'Lowest price reached during the day' },
  { name: 'Volume',       desc: 'Total number of shares traded' },
  { name: 'Prev_Close',   desc: "Previous trading day's closing price" },
  { name: 'Price_Change', desc: 'Close minus Open (intraday movement)' },
  { name: 'HL_Spread',    desc: 'High minus Low (intraday volatility range)' },
  { name: 'OC_Spread',    desc: 'Close minus Open (body of the candle)' },
  { name: 'MA_5',         desc: '5-day simple moving average of Close' },
  { name: 'MA_10',        desc: '10-day simple moving average of Close' },
]

function Section({ title, icon, children }) {
  return (
    <section className="about-section">
      <div className="about-section-title">
        <span className="about-section-icon">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  )
}

function StockCard({ info }) {
  return (
    <div className="about-stock-card">
      <div className="about-stock-header">
        <div>
          <div className="about-stock-name">{info.name}</div>
          <div className="about-stock-meta">{info.ticker} · {info.sector}</div>
        </div>
        <span className="badge badge-indigo">{info.model}</span>
      </div>
      <div className="about-stock-metrics">
        <div className="about-metric">
          <div className="about-metric-label">Test R²</div>
          <div className="about-metric-value green">{info.r2}</div>
        </div>
        <div className="about-metric">
          <div className="about-metric-label">CV R²</div>
          <div className="about-metric-value green">{info.cv_r2}</div>
        </div>
        <div className="about-metric">
          <div className="about-metric-label">MAE</div>
          <div className="about-metric-value amber">{info.mae}</div>
        </div>
      </div>
      <div className="about-stock-features">
        <span className="about-features-label">Features:</span> {info.features}
      </div>
      <div className="about-stock-why">{info.why}</div>
    </div>
  )
}

export default function AboutPage({ stocksFromApi }) {
  const stocks = STOCK_INFO.map(s => {
    const live = stocksFromApi?.find(x => x.ticker === s.ticker)
    return live
      ? { ...s, r2: String(live.r2), mae: `₹${live.mae}`, cv_r2: live.cv_r2 != null ? String(live.cv_r2) : s.cv_r2 }
      : s
  })

  return (
    <div className="about-page">

      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero-icon">📈</div>
        <h1 className="about-hero-title">StockPredict</h1>
        <p className="about-hero-sub">
          ML-Powered Next-Day Closing Price Predictor for Indian Stocks
        </p>
      </div>

      {/* Project Overview */}
      <Section title="Project Overview" icon="🗂️">
        <div className="about-prose">
          <p>
            <strong>StockPredict</strong> predicts the <em>next trading day's closing price</em> for three major NSE-listed stocks — ITC Limited, Tata Consultancy Services, and HDFC Bank.
          </p>
          <p>
            Historical OHLCV data is fetched from <strong>Yahoo Finance</strong> via <code>yfinance</code>, covering January 2015 to present. Models are trained offline, saved as <code>.pkl</code> files, and served through a FastAPI backend consumed by this React frontend.
          </p>
          <ul>
            <li>📅 <strong>Data:</strong> NSE via Yahoo Finance</li>
            <li>📆 <strong>Date range:</strong> Jan 2015 → Present</li>
            <li>🎯 <strong>Target:</strong> Next trading day's Close price</li>
            <li>📊 <strong>Train / Test split:</strong> 67% train, 33% test (chronological)</li>
            <li>🔁 <strong>Cross-validation:</strong> TimeSeriesSplit (5 folds)</li>
            <li>⚙️ <strong>Hyperparameter tuning:</strong> GridSearchCV</li>
          </ul>
        </div>
      </Section>

      {/* Stocks & Models */}
      <Section title="Stocks Covered & Models Used" icon="🏦">
        <div className="about-stocks-grid">
          {stocks.map(s => <StockCard key={s.ticker} info={s} />)}
        </div>
      </Section>

      {/* ITC Model Comparison */}
      <Section title="ITC — Multi-Model Comparison" icon="⚖️">
        <div className="about-prose">
          <p>
            Multiple regression models were trained and compared on ITC data before choosing the final deployed model.
            Features used: <strong>Open, High, Low, Volume</strong>.
          </p>
        </div>
        <div className="about-table-wrap">
          <table className="about-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>R² Score</th>
                <th>MAE (₹)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {ITC_COMPARISON.map(row => {
                const isBest = row.verdict === 'best'
                const isDeployed = row.verdict === 'deployed'
                const isFailed = row.verdict === 'failed'
                return (
                  <tr key={row.model}>
                    <td className="about-td-model">
                      {row.model}
                      {isDeployed && <span className="about-badge-best" style={{ color: '#818cf8' }}> ★ deployed</span>}
                      {isBest && <span className="about-badge-best"> ★ best R²</span>}
                      {isFailed && <span className="about-badge-worst"> ⚠ failed</span>}
                    </td>
                    <td className="about-td-num" style={{ color: isFailed ? '#ef4444' : isBest ? '#10b981' : '#a5b4fc' }}>
                      {row.r2}
                    </td>
                    <td className="about-td-num" style={{ color: isFailed ? '#ef4444' : '#a5b4fc' }}>
                      {row.mae}
                    </td>
                    <td className="about-td-note">{row.note}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="about-prose" style={{ marginTop: 16 }}>
          <p><strong>Why SVR got a negative R²:</strong></p>
          <ul style={{ paddingLeft: 18, marginTop: 4 }}>
            <li><strong>Scale mismatch:</strong> Volume is in millions (~10M) while price is ~200–400. SVR uses Euclidean distances which get completely distorted without scaling.</li>
            <li><strong>Can't extrapolate:</strong> In time series, test prices are higher than training prices. SVR can't predict beyond its training range, so it predicts a flat line → negative R².</li>
          </ul>

          <div className="about-highlight highlight-green" style={{ marginTop: 12 }}>
            <strong>Why Bagging &amp; Boosting are not used for ITC:</strong>
            <ul style={{ marginTop: 6, paddingLeft: 18 }}>
              <li><strong>Bagging tested:</strong> 50 bagged Linear Regressors → R² = 0.9898, same as a single model. Linear Regression already has near-zero variance, so bagging adds nothing.</li>
              <li><strong>Boosting not needed:</strong> Bias is already minimal — MAE is ₹4 on a ₹300+ stock (~1% error). No room to improve.</li>
              <li><strong>Decision:</strong> Keep plain Linear Regression. It's simpler, faster, and just as accurate.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Advanced Training */}
      <Section title="Cross-Validation & Hyperparameter Tuning" icon="🔬">
        <div className="about-prose">
          <p>
            <strong>TimeSeriesSplit Cross-Validation (5 folds):</strong> Applied only to the training portion so future data never leaks into earlier folds. Five models were cross-validated — Linear Regression, Ridge, SVR (scaled), Random Forest, and Bagging.
          </p>
          <div className="about-table-wrap" style={{ marginTop: 12 }}>
            <table className="about-table">
              <thead>
                <tr><th>Stock</th><th>Model</th><th>Test R²</th><th>CV R²</th></tr>
              </thead>
              <tbody>
                {stocks.map(s => (
                  <tr key={s.ticker}>
                    <td className="about-td-model">{s.name}</td>
                    <td style={{ color: '#a5b4fc', fontSize: 13 }}>{s.model}</td>
                    <td className="about-td-num">{s.r2}</td>
                    <td className="about-td-num">{s.cv_r2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 12 }}>
            <strong>GridSearchCV Hyperparameter Tuning:</strong> Used <code>GridSearchCV</code> with <code>TimeSeriesSplit</code> to keep tuning time-series aware.
          </p>
          <ul style={{ paddingLeft: 18 }}>
            <li>SVR: searched C ∈ [1, 10, 100], epsilon ∈ [0.01, 0.1, 0.2], gamma ∈ [scale, 0.01, 0.1]</li>
            <li>Random Forest: searched n_estimators ∈ [100, 200], max_depth ∈ [None, 10, 20], min_samples_split ∈ [2, 5]</li>
          </ul>
          <div className="about-highlight highlight-amber" style={{ marginTop: 10 }}>
            <strong>Overfitting Check:</strong> Train R² vs Test R² gap is {'<'} 0.002 for all models — no overfitting.
          </div>
        </div>
      </Section>

      {/* Bagging/Boosting */}
      <Section title="Ensemble Methods — Bagging & Boosting" icon="🎒">
        <div className="about-prose">
          <p>
            <strong>Bagging (Bootstrap Aggregating)</strong> reduces variance by training many models on random data subsets and averaging their predictions.
          </p>
          <div className="about-highlight">
            <strong>Used for TCS & HDFC Bank:</strong> Random Forest is itself a form of Bagging applied to Decision Trees. With 10 engineered features and non-linear interactions, 200 bagged trees prevent overfitting and achieve R² {'>'} 0.998.
          </div>
          <p style={{ marginTop: 8 }}>
            <strong>Boosting</strong> reduces bias by sequentially correcting errors from previous models. Not needed here — baseline bias is already minimal.
          </p>
          <div className="about-highlight highlight-amber">
            <strong>GradientBoostingRegressor note:</strong> Tested on HDFC Bank but replaced with Random Forest due to a Python 3.14 pickle compatibility issue (<code>_loss</code> Cython module). Random Forest gives the same accuracy and loads cleanly.
          </div>
        </div>
      </Section>

      {/* Engineered Features */}
      <Section title="Engineered Features" icon="🔧">
        <div className="about-prose">
          <p>For TCS and HDFC Bank, six additional features were engineered from raw OHLCV data:</p>
        </div>
        <div className="about-table-wrap">
          <table className="about-table">
            <thead>
              <tr><th>Feature</th><th>Description</th></tr>
            </thead>
            <tbody>
              {FEATURES.map(f => (
                <tr key={f.name}>
                  <td><code>{f.name}</code></td>
                  <td>{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="about-note">
          ITC uses only raw OHLV features — its linear model achieves near-perfect accuracy without any extra engineering.
        </div>
      </Section>

      {/* Tech Stack */}
      <Section title="Tech Stack" icon="🛠️">
        <div className="about-tech-grid">
          {[
            { name: 'scikit-learn',   desc: 'Linear Regression, Ridge, Lasso, SVR, Random Forest, BaggingRegressor, GridSearchCV', color: 'indigo' },
            { name: 'yfinance',       desc: 'NSE stock data via Yahoo Finance API', color: 'green' },
            { name: 'FastAPI',        desc: 'Python REST API backend (port 8000)', color: 'green' },
            { name: 'joblib',         desc: 'Model serialisation (.pkl files)', color: 'amber' },
            { name: 'pandas / numpy', desc: 'Data manipulation, feature engineering, manual Normal Equation', color: 'amber' },
            { name: 'matplotlib',     desc: 'Training plots and comparison charts', color: 'red' },
            { name: 'React + Vite',   desc: 'Frontend SPA (port 5173)', color: 'indigo' },
            { name: 'Recharts',       desc: 'Interactive SVG charts', color: 'green' },
          ].map(t => (
            <div key={t.name} className={`about-tech-card tech-${t.color}`}>
              <div className="about-tech-name">{t.name}</div>
              <div className="about-tech-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </Section>

    </div>
  )
}

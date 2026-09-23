import { useState, useEffect } from 'react'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import PriceChart from './components/PriceChart'
import PredictPanel from './components/PredictPanel'
import ComparisonChart from './components/ComparisonChart'
import AboutPage from './components/AboutPage'
import './App.css'

const API = import.meta.env.VITE_API_URL || ''


const DEFAULT_STOCKS = [
  { ticker: 'ITC.NS', name: 'ITC Limited', sector: 'FMCG', model_name: 'Linear Regression' },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT', model_name: 'Random Forest' },
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank', sector: 'Banking', model_name: 'Random Forest' },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [stocks, setStocks] = useState(DEFAULT_STOCKS)
  const [selectedTicker, setSelectedTicker] = useState('ITC.NS')
  const [stockData, setStockData] = useState(null)
  const [latest, setLatest] = useState(null)
  const [compareData, setCompareData] = useState(null)
  const [showCompare, setShowCompare] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/stocks`)
      .then(r => {
        if (r.ok) return r.json()
        throw new Error('API Error')
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStocks(data)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setStockData(null)
    setLatest(null)

    Promise.all([
      fetch(`${API}/api/stock/${selectedTicker}/data`).then(r => r.json()),
      fetch(`${API}/api/stock/${selectedTicker}/latest`).then(r => r.json()),
    ])
      .then(([data, lat]) => {
        setStockData(data)
        setLatest(lat)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedTicker])

  useEffect(() => {
    if (showCompare && !compareData) {
      fetch(`${API}/api/compare`)
        .then(r => r.json())
        .then(setCompareData)
        .catch(() => {})
    }
  }, [showCompare])

  const currentStock = stocks.find(s => s.ticker === selectedTicker)

  return (
    <div className="app">
      <Header
        stocks={stocks}
        selectedTicker={selectedTicker}
        onSelect={setSelectedTicker}
        currentStock={currentStock}
        page={page}
        onPageChange={setPage}
      />

      {page === 'about' ? (
        <AboutPage stocksFromApi={stocks} />
      ) : (
        <main className="main-grid">
          <StatsCards latest={latest} loading={loading} stockData={stockData} />

          <div className="chart-predict-row">
            <PriceChart stockData={stockData} loading={loading} />
            <PredictPanel
              ticker={selectedTicker}
              latest={latest}
              api={API}
              modelName={stockData?.model_name}
            />
          </div>

          <div className="compare-section">
            <button
              className={`compare-toggle ${showCompare ? 'active' : ''}`}
              onClick={() => setShowCompare(v => !v)}
            >
              <span>{showCompare ? '▾' : '▸'}</span>
              {showCompare ? 'Hide' : 'Show'} Multi-Stock Comparison
            </button>

            {showCompare && (
              <ComparisonChart
                compareData={compareData}
                selectedTicker={selectedTicker}
              />
            )}
          </div>
        </main>
      )}
    </div>
  )
}

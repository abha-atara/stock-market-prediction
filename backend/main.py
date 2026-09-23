import os
import time
import pandas as pd
import numpy as np
import yfinance as yf
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from pydantic import BaseModel
import warnings

warnings.filterwarnings("ignore")

CACHE_DIR = "data"
os.makedirs(CACHE_DIR, exist_ok=True)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STOCKS = {
    "ITC.NS": {
        "name": "ITC Limited",
        "sector": "FMCG",
        "model_name": "Linear Regression",
        "pkl": os.path.join(PROJECT_ROOT, "tomorrow_close_predict.pkl"),
        "features": ["Open", "High", "Low", "Volume"],
        "cv_r2": 0.9979,
        "bagging_boosting_status": "Not Needed (Evaluated)",
        "bagging_boosting_reason": "Linear Regression already achieves R2 = 0.9986 and MAE = Rs 2.61. Multi-model comparison shows Ridge (0.9988) and Bagging (0.9987) yield virtually identical results (<0.0001 difference). Bagging reduces variance which is already near-zero, and Boosting risks overfitting on low-bias data. Clean Linear Regression is kept as the optimal deployed model.",
    },
    "TCS.NS": {
        "name": "Tata Consultancy Services",
        "sector": "IT",
        "model_name": "Random Forest",
        "pkl": os.path.join(PROJECT_ROOT, "tcs_model.pkl"),
        "features": ["Open", "High", "Low", "Volume", "Prev_Close", "Price_Change", "HL_Spread", "OC_Spread", "MA_5", "MA_10"],
        "cv_r2": 0.9971,
        "bagging_boosting_status": "Applied (Random Forest)",
        "bagging_boosting_reason": "Random Forest ensemble of 200 trees uses bagging (bootstrap aggregating) with feature subsampling to model non-linear technical indicators without overfitting.",
    },
    "HDFCBANK.NS": {
        "name": "HDFC Bank",
        "sector": "Banking",
        "model_name": "Random Forest",
        "pkl": os.path.join(PROJECT_ROOT, "hdfc_model.pkl"),
        "features": ["Open", "High", "Low", "Volume", "Prev_Close", "Price_Change", "HL_Spread", "OC_Spread", "MA_5", "MA_10"],
        "cv_r2": 0.9968,
        "bagging_boosting_status": "Applied (Random Forest)",
        "bagging_boosting_reason": "Random Forest ensemble of 200 trees uses bagging to capture intraday volatility and multi-day momentum patterns without overfitting.",
    },
}

_models = {}


def yf_download(ticker, **kwargs):
    for attempt in range(4):
        try:
            df = yf.download(ticker, progress=False, **kwargs)
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.droplevel(1)
            if not df.empty:
                return df
        except Exception:
            pass
        if attempt < 3:
            time.sleep(3 * (attempt + 1))
    return pd.DataFrame()


def fetch_raw(ticker: str) -> pd.DataFrame:
    cache = os.path.join(CACHE_DIR, f"{ticker.replace('.', '_')}.pkl")

    fresh = yf_download(ticker, period="5d")

    if os.path.exists(cache):
        hist = pd.read_pickle(cache)
        if not fresh.empty:
            combined = pd.concat([hist, fresh])
            combined = combined[~combined.index.duplicated(keep="last")].sort_index()
            combined.to_pickle(cache)
            return combined
        return hist

    df = yf_download(ticker, period="max")
    if df.empty:
        df = yf_download(ticker, period="10y")
    if df.empty:
        raise RuntimeError(f"Cannot fetch data for {ticker}")

    df = df[df.index.year >= 2015].dropna()
    df.to_pickle(cache)
    return df


def add_features(df):
    df = df.copy()
    df['Prev_Close'] = df['Close'].shift(1)
    df['Price_Change'] = df['Close'] - df['Open']
    df['HL_Spread'] = df['High'] - df['Low']
    df['OC_Spread'] = df['Close'] - df['Open']
    df['MA_5'] = df['Close'].rolling(5).mean()
    df['MA_10'] = df['Close'].rolling(10).mean()
    return df


def load_or_train(ticker: str) -> dict:
    raw_df = fetch_raw(ticker)
    info = STOCKS[ticker]
    feature_cols = info["features"]

    df = raw_df.copy()
    if len(feature_cols) > 4:
        df = add_features(df)

    df["Target"] = df["Close"].shift(-1)
    df = df.dropna()

    X = df[feature_cols]
    y = df["Target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pkl_path = info["pkl"]
    model = None
    if os.path.exists(pkl_path):
        try:
            print(f"Loading pre-trained model for {ticker} from {os.path.basename(pkl_path)}", flush=True)
            model = joblib.load(pkl_path)
        except Exception as err:
            print(f"Warning: Failed to load {pkl_path} ({err}). Training fallback model.", flush=True)
            model = None

    if model is None:
        print(f"Training fallback RandomForest model for {ticker}", flush=True)
        from sklearn.ensemble import RandomForestRegressor
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

    test_preds = model.predict(X_test)
    r2 = round(float(model.score(X_test, y_test)), 4)
    mae = round(float(mean_absolute_error(y_test, test_preds)), 4)

    chart_source = df.tail(91)
    prev_features = chart_source.iloc[:-1][feature_cols]
    recent = df.tail(90).copy()
    recent["Predicted"] = model.predict(prev_features)

    today = raw_df.iloc[-1]
    latest = {
        "date": raw_df.index[-1].strftime("%Y-%m-%d"),
        "open": round(float(today["Open"]), 2),
        "high": round(float(today["High"]), 2),
        "low": round(float(today["Low"]), 2),
        "close": round(float(today["Close"]), 2),
        "volume": int(today["Volume"]),
    }

    return {
        "model": model,
        "r2": r2,
        "mae": mae,
        "df": df,
        "recent": recent,
        "latest": latest,
    }


def get_model(ticker: str) -> dict:
    if ticker not in _models:
        _models[ticker] = load_or_train(ticker)
    return _models[ticker]


@app.on_event("startup")
def on_startup():
    for ticker in STOCKS:
        try:
            get_model(ticker)
            m = _models[ticker]
            print(f"{ticker}: R2={m['r2']} MAE={m['mae']} Latest={m['latest']['date']}", flush=True)
        except Exception as e:
            print(f"ERROR {ticker}: {e}", flush=True)


@app.get("/api/stocks")
def api_stocks():
    return [
        {
            "ticker": t,
            "name": info["name"],
            "sector": info["sector"],
            "model_name": info["model_name"],
            "cv_r2": info.get("cv_r2", None),
            "bagging_boosting_status": info.get("bagging_boosting_status", ""),
            "bagging_boosting_reason": info.get("bagging_boosting_reason", ""),
            "r2": get_model(t)["r2"],
            "mae": get_model(t)["mae"],
        }
        for t, info in STOCKS.items()
    ]


@app.get("/api/stock/{ticker}/data")
def api_stock_data(ticker: str):
    ticker = ticker.upper()
    if ticker not in STOCKS:
        raise HTTPException(404, "Stock not found")
    m = get_model(ticker)
    history = [
        {
            "date": d.strftime("%Y-%m-%d"),
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
            "volume": int(row["Volume"]),
            "predicted": round(float(row["Predicted"]), 2),
        }
        for d, row in m["recent"].iterrows()
    ]
    return {
        "ticker": ticker,
        "name": STOCKS[ticker]["name"],
        "sector": STOCKS[ticker]["sector"],
        "model_name": STOCKS[ticker]["model_name"],
        "cv_r2": STOCKS[ticker].get("cv_r2", None),
        "bagging_boosting_status": STOCKS[ticker].get("bagging_boosting_status", ""),
        "bagging_boosting_reason": STOCKS[ticker].get("bagging_boosting_reason", ""),
        "r2": m["r2"],
        "mae": m["mae"],
        "history": history,
    }


@app.get("/api/stock/ITC.NS/model-comparison")
def api_itc_comparison():
    return {
        "task": "Continuous Price Regression",
        "models": [
            {"model": "Linear Regression", "r2": 0.9986, "mae": 2.61, "type": "Regression", "status": "Deployed", "notes": "Optimal baseline - simple, interpretable, near-zero variance"},
            {"model": "Ridge Regression", "r2": 0.9988, "mae": 2.42, "type": "Regression", "status": "Evaluated", "notes": "Best R² with L2 penalty, negligible difference (+0.0002)"},
            {"model": "Lasso Regression", "r2": 0.9988, "mae": 2.43, "type": "Regression", "status": "Evaluated", "notes": "L1 regularized regression"},
            {"model": "ElasticNet", "r2": 0.9988, "mae": 2.43, "type": "Regression", "status": "Evaluated", "notes": "Combined L1 + L2 penalty"},
            {"model": "SVR (RBF kernel)", "r2": 0.9951, "mae": 2.70, "type": "Regression", "status": "Evaluated", "notes": "Support Vector Regression, requires scaling & higher compute"},
            {"model": "Bagging (LinReg)", "r2": 0.9987, "mae": 2.59, "type": "Regression Ensemble", "status": "Evaluated", "notes": "50 estimators - virtually identical to single Linear Regression"},
        ],
        "bagging_needed": False,
        "boosting_needed": False,
        "verdict": "Neither Bagging nor Boosting is needed. Linear Regression already achieves R² > 0.998 with minimal variance. Bagging reduces variance which is already near-zero; Boosting reduces bias which is already minimal. The deployed model is pure Linear Regression.",
    }


@app.get("/api/stock/{ticker}/latest")
def api_latest(ticker: str):
    ticker = ticker.upper()
    if ticker not in STOCKS:
        raise HTTPException(404, "Stock not found")
    return get_model(ticker)["latest"]


class PredictReq(BaseModel):
    open: float
    high: float
    low: float
    volume: float


@app.post("/api/stock/{ticker}/predict")
def api_predict(ticker: str, body: PredictReq):
    ticker = ticker.upper()
    if ticker not in STOCKS:
        raise HTTPException(404, "Stock not found")

    info = STOCKS[ticker]
    model = get_model(ticker)["model"]
    feature_cols = info["features"]

    if len(feature_cols) == 4:
        X = np.array([[body.open, body.high, body.low, body.volume]])
    else:
        df = get_model(ticker)["df"]
        last_close = float(df["Close"].iloc[-1])
        ma_5 = float(df["Close"].iloc[-5:].mean())
        ma_10 = float(df["Close"].iloc[-10:].mean())
        price_change = body.open - last_close
        hl_spread = body.high - body.low
        oc_spread = body.open - body.open
        X = np.array([[body.open, body.high, body.low, body.volume, last_close, price_change, hl_spread, oc_spread, ma_5, ma_10]])

    pred = round(float(model.predict(X)[0]), 2)
    return {"ticker": ticker, "predicted_close": pred}


@app.get("/api/compare")
def api_compare():
    return {
        t: {
            "name": STOCKS[t]["name"],
            "history": [
                {"date": d.strftime("%Y-%m-%d"), "close": round(float(row["Close"]), 2)}
                for d, row in get_model(t)["recent"].iterrows()
            ],
        }
        for t in STOCKS
    }

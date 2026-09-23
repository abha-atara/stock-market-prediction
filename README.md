# StockPredict — ML-Powered Stock Price Predictor

Next-day closing price prediction for ITC, TCS, and HDFC Bank using scikit-learn.

## Project Structure

```
├── Project_Stock_Market.ipynb      # Main notebook (ITC)
├── TCS_Stock_Model.ipynb           # TCS model notebook
├── HDFC_Stock_Model.ipynb          # HDFC Bank model notebook
├── notes.txt                       # SOP compliance notes
├── tomorrow_close_predict.pkl      # ITC trained model
├── tcs_model.pkl                   # TCS trained model
├── hdfc_model.pkl                  # HDFC Bank trained model
├── backend/
│   ├── main.py                     # FastAPI backend
│   └── requirements.txt
└── frontend/
    ├── src/
    └── package.json                # React + Vite frontend
```

## Models

| Stock | Model | Test R² | CV R² | MAE |
|---|---|---|---|---|
| ITC Limited | Linear Regression | 0.9987 | 0.9979 | ₹2.55 |
| TCS | Random Forest (200 trees) | 0.9986 | 0.9971 | ₹25.02 |
| HDFC Bank | Random Forest (200 trees) | 0.9985 | 0.9968 | ₹5.89 |

## Run Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Or just run `start.bat`.

## Deployment

- **Frontend** → Vercel (root: `frontend/`)
- **Backend** → Render.com (`uvicorn backend.main:app --host 0.0.0.0 --port $PORT`)

Set `VITE_API_URL` in Vercel environment variables to your Render backend URL.

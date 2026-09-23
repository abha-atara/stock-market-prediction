import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error
import matplotlib.pyplot as plt
import joblib
import warnings

warnings.filterwarnings('ignore')
plt.switch_backend('Agg')

data = yf.download("HDFCBANK.NS", start="2015-01-01", progress=False)
if isinstance(data.columns, pd.MultiIndex):
    data.columns = data.columns.droplevel(1)

df = data[['Open', 'High', 'Low', 'Volume', 'Close']].copy()

df['Prev_Close'] = df['Close'].shift(1)
df['Price_Change'] = df['Close'] - df['Open']
df['HL_Spread'] = df['High'] - df['Low']
df['OC_Spread'] = df['Close'] - df['Open']
df['MA_5'] = df['Close'].rolling(5).mean()
df['MA_10'] = df['Close'].rolling(10).mean()

df['Target'] = df['Close'].shift(-1)
df.dropna(inplace=True)

features = ['Open', 'High', 'Low', 'Volume', 'Prev_Close', 'Price_Change', 'HL_Spread', 'OC_Spread', 'MA_5', 'MA_10']
X = df[features]
y = df['Target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

cv_scores = cross_val_score(model, X_train, y_train, cv=5)

y_pred = model.predict(X_test)
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)

print(f"R2 Score: {r2:.4f}")
print(f"MAE: {mae:.4f}")
print(f"CV Score: {cv_scores.mean():.4f}")

plt.figure(figsize=(12, 6))
plt.plot(y_test.values, label='Actual', color='blue')
plt.plot(y_pred, label='Predicted', color='red')
plt.title('HDFC Bank - Actual vs Predicted (Gradient Boosting)')
plt.xlabel('Index')
plt.ylabel('Price')
plt.legend()
plt.savefig('e:\\d2d btech sem 5\\ML\\Project(1)\\hdfc_actual_vs_predicted.png')
plt.close()

importance = model.feature_importances_
plt.figure(figsize=(10, 5))
plt.barh(features, importance, color='#10b981')
plt.title('Feature Importance - HDFC Gradient Boosting')
plt.xlabel('Importance')
plt.savefig('e:\\d2d btech sem 5\\ML\\Project(1)\\hdfc_feature_importance.png')
plt.close()

plt.figure(figsize=(8, 8))
plt.scatter(y_test, y_pred, alpha=0.5)
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')
plt.title('Actual vs Predicted Scatter')
plt.xlabel('Actual')
plt.ylabel('Predicted')
plt.grid(True)
plt.savefig('e:\\d2d btech sem 5\\ML\\Project(1)\\hdfc_scatter.png')
plt.close()

joblib.dump(model, 'e:\\d2d btech sem 5\\ML\\Project(1)\\hdfc_model.pkl')
print("Model saved as hdfc_model.pkl")

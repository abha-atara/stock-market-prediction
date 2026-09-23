import pandas as pd
import yfinance as yf
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import BaggingRegressor
from sklearn.metrics import r2_score, mean_absolute_error
import matplotlib.pyplot as plt
import warnings

warnings.filterwarnings('ignore')
plt.switch_backend('Agg')

df = yf.download("ITC.NS", start="2015-01-01")
if isinstance(df.columns, pd.MultiIndex):
    df.columns = df.columns.droplevel(1)

df['Target'] = df['Close'].shift(-1)
df.dropna(inplace=True)

X = df[['Open', 'High', 'Low', 'Volume']]
y = df['Target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, shuffle=False, random_state=42)

lr = LinearRegression()
br = BaggingRegressor(estimator=LinearRegression(), n_estimators=10, random_state=42)

lr.fit(X_train, y_train)
br.fit(X_train, y_train)

lr_pred = lr.predict(X_test)
br_pred = br.predict(X_test)

lr_r2 = r2_score(y_test, lr_pred)
lr_mae = mean_absolute_error(y_test, lr_pred)

br_r2 = r2_score(y_test, br_pred)
br_mae = mean_absolute_error(y_test, br_pred)

print(f"{'Model':<25} | {'R2 Score':<15} | {'MAE':<15}")
print("-" * 60)
print(f"{'Linear Regression':<25} | {lr_r2:<15.4f} | {lr_mae:<15.4f}")
print(f"{'Bagging (LinReg)':<25} | {br_r2:<15.4f} | {br_mae:<15.4f}")

plt.figure(figsize=(14, 7))
plt.plot(y_test.index, y_test.values, label='Actual', alpha=0.7)
plt.plot(y_test.index, lr_pred, label='Linear Regression', alpha=0.7)
plt.plot(y_test.index, br_pred, label='Bagging', alpha=0.7)
plt.title('ITC Bagging Demonstration')
plt.xlabel('Date')
plt.ylabel('Price')
plt.legend()
plt.savefig('e:\\d2d btech sem 5\\ML\\Project(1)\\itc_bagging_comparison.png')
plt.close()

import requests
import pandas as pd
from datetime import datetime, timedelta
import os

# 1. Set parameters
instrument_key = 'NSE_EQ|INE002A01018'  # Reliance Industries
interval = '1minute'

# 2. Compute date range: today and 2 days before
from_date = datetime.today().strftime('%Y-%m-%d')
to_date = (datetime.today() - timedelta(days=9)).strftime('%Y-%m-%d')

# 3. Format the URL
url = f'https://api.upstox.com/v2/historical-candle/{instrument_key}/{interval}/{from_date}/{to_date}'

headers = {
    'Accept': 'application/json'
}

# 4. Make the request
response = requests.get(url, headers=headers)

# 5. Handle the response
if response.status_code == 200:
    candles = response.json().get("data", {}).get("candles", [])
    if candles:
        df = pd.DataFrame(candles, columns=["timestamp", "open", "high", "low", "close", "volume", "oi"])
        df.drop(columns=["oi"], inplace=True)

        # Convert timestamp and sort ascending
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values(by="timestamp")

        save_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', 'uploads', 'data', 'hist_data_reliance.csv')
        )
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        df.to_csv(save_path, index=False)
        print(f"✅ Saved first 10 candles after market open to: {save_path}")
    else:
        print("⚠️ No data found.")
else:
    print(f"❌ API error: {response.status_code} - {response.text}")

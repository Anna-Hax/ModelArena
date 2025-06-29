import requests
import pandas as pd
import os

# Corrected URL: from_date < to_date
url = 'https://api.upstox.com/v2/historical-candle/NSE_EQ%7CINE848E01016/1minute/2023-11-13/2023-11-12'

headers = {
    'Accept': 'application/json',
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    candles = data.get("data", {}).get("candles", [])

    if candles:
        df = pd.DataFrame(candles, columns=["timestamp", "open", "high", "low", "close", "volume", "oi"])
        df.drop(columns=["oi"], inplace=True)

        # Save path: backend/modelArena/uploads/data/historical_data.csv
        save_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', 'uploads', 'data', 'historical_data.csv')
        )
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        df.to_csv(save_path, index=False)
        print(f"✅ Data saved to {save_path}")
    else:
        print("⚠️ No candle data found in response.")
else:
    print(f"❌ Error: {response.status_code} - {response.text}")

import requests
from datetime import datetime
import pandas as pd
import os
import pytz  # ✅ for timezone handling

# # Set the specific date (market day)
# today = "2025-07-01"

# instrument_key = 'NSE_EQ|INE002A01018'  # Reliance
# interval = '1minute'

# url = f'https://api.upstox.com/v2/historical-candle/{instrument_key}/{interval}/{today}/{today}'
# headers = {
#     'Accept': 'application/json',
#     # 'Authorization': 'Bearer YOUR_ACCESS_TOKEN'  # Include if needed
# }

# response = requests.get(url, headers=headers)

# if response.status_code == 200:
#     candles = response.json().get("data", {}).get("candles", [])

#     if candles:
#         df = pd.DataFrame(candles, columns=["timestamp", "open", "high", "low", "close", "volume", "oi"])
#         df.drop(columns=["oi"], inplace=True)

#         # ✅ Convert timestamp column to datetime with timezone
#         df["timestamp"] = pd.to_datetime(df["timestamp"])

#         # ✅ Create timezone-aware 9:15 AM market open datetime
#         ist = pytz.timezone("Asia/Kolkata")
#         market_open = ist.localize(datetime.strptime(f"{today} 09:15:00", "%Y-%m-%d %H:%M:%S"))

#         # ✅ Filter first 10 rows after market open
#         df = df[df["timestamp"] >= market_open].head(10)

#         # ✅ Save to CSV
#         save_path = os.path.abspath(
#             os.path.join(os.path.dirname(__file__), '..', 'uploads', 'data', 'input_data_d.csv')
#         )
#         os.makedirs(os.path.dirname(save_path), exist_ok=True)
#         df.to_csv(save_path, index=False)

#         print(f"✅ Saved first 10 candles after market open to: {save_path}")
#     else:
#         print("⚠️ No candle data received.")
# else:
#     print(f"❌ API Error: {response.status_code} - {response.text}")




import requests
instrument_key = '' 

url = 'https://api.upstox.com/v2/historical-candle/intraday/NSE_EQ|INE002A01018/1minute'
headers = {
    'Accept': 'application/json'
}

response = requests.get(url, headers=headers)

# Check the response status
if response.status_code == 200:
    candles = response.json().get("data", {}).get("candles", [])

    if candles:
        df = pd.DataFrame(candles, columns=["timestamp", "open", "high", "low", "close", "volume", "oi"])
        df.drop(columns=["oi"], inplace=True)

        # ✅ Convert timestamp column to datetime with timezone
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        

        # ✅ Save to CSV
        save_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', 'uploads', 'data', 'input_data_d.csv')
        )
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        (df.head(10)).to_csv(save_path, index=False)

        print(f"✅ Saved first 10 candles after market open to: {save_path}")
    else:
        print("⚠️ No candle data received.")
else:
    print(f"❌ API Error: {response.status_code} - {response.text}")
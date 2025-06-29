# import requests
# from datetime import datetime
# import pandas as pd
# import os

# # Get today's date in YYYY-MM-DD format
# # today = datetime.today().strftime('%Y-%m-%d')
# today="2025-06-27"


# instrument_key = 'NSE_EQ|INE848E01016'  # example: Hindustan Copper
# interval = '1minute'

# url = f'https://api.upstox.com/v2/historical-candle/{instrument_key}/{interval}/{today}/{today}?count=10'
# headers = {
#     'Accept': 'application/json',
# }

# response = requests.get(url, headers=headers)

# if response.status_code == 200:
#     candles = response.json().get("data", {}).get("candles", [])
#     if candles:
#         df = pd.DataFrame(candles, columns=["timestamp", "open", "high", "low", "close", "volume", "oi"])
#         df.drop(columns=["oi"], inplace=True)

#         save_path = os.path.abspath(
#             os.path.join(os.path.dirname(__file__), '..', 'uploads', 'data', 'input_data_d.csv')
#         )
#         os.makedirs(os.path.dirname(save_path), exist_ok=True)

#         df.to_csv(save_path, index=False)
#         print(f"✅ Data saved to {save_path}")

#     else:
#         print("⚠️ No candle data received.")
# else:
#     print(f"❌ API Error: {response.status_code} - {response.text}")


import requests
from datetime import datetime
import pandas as pd
import os

# Set the specific date (market day)
today = "2025-06-27"

instrument_key = 'NSE_EQ|INE002A01018'  # e.g., reliance
interval = '1minute'

url = f'https://api.upstox.com/v2/historical-candle/{instrument_key}/{interval}/{today}/{today}'
headers = {
    'Accept': 'application/json',
    # 'Authorization': 'Bearer YOUR_ACCESS_TOKEN'  # Add if required
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    candles = response.json().get("data", {}).get("candles", [])

    if candles:
        df = pd.DataFrame(candles, columns=["timestamp", "open", "high", "low", "close", "volume", "oi"])
        df.drop(columns=["oi"], inplace=True)

        # Convert timestamp and sort ascending
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values(by="timestamp")

        # Filter first 10 rows after 9:15 AM
        market_open = datetime.strptime(f"{today} 09:15:00+05:30", "%Y-%m-%d %H:%M:%S%z")
        df = df[df["timestamp"] >= market_open].head(10)

        save_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', 'uploads', 'data', 'input_data_d.csv')
        )
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        df.to_csv(save_path, index=False)
        print(f"✅ Saved first 10 candles after market open to: {save_path}")
    else:
        print("⚠️ No candle data received.")
else:
    print(f"❌ API Error: {response.status_code} - {response.text}")

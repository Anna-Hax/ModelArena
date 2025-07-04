import os
import requests
import pandas as pd
from celery import shared_task
from datetime import datetime, timedelta, timezone


@shared_task(name='prediction.actual_data_d.evaluate_predictions')
def evaluate_predictions():
    from .models import PredictionResult
    now = datetime.now(timezone.utc)
    results = PredictionResult.objects.all()

    def fetch_actual_for(target_time):
        instrument_key = 'NSE_EQ|INE002A01018'  # Reliance Industries
        interval = '1minute'

        from_date = (target_time - timedelta(days=1)).strftime('%Y-%m-%d')
        to_date = target_time.strftime('%Y-%m-%d')

        url = f'https://api.upstox.com/v2/historical-candle/intraday/{instrument_key}/{interval}'
        headers = {
            'Accept': 'application/json',
            # ⚠️ Replace <your_token> with actual token if required
            # 'Authorization': 'Bearer <your_token>',
        }

        print(f" Fetching from {url} | from_date={from_date} to_date={to_date}")

        response = requests.get(url, headers=headers)
        print(" Status Code:", response.status_code)

        try:
            data = response.json()
            #print(" Response preview:", data)
        except Exception as e:
            print("Failed to parse JSON:", e)
            return None

        if response.status_code == 200:
            candles = data.get("data", {}).get("candles", [])
            print("🕯️ Number of candles received:", len(candles))

            if candles:
                df = pd.DataFrame(
                    candles,
                    columns=["timestamp", "open", "high", "low", "close", "volume", "oi"]
                )
                df.drop(columns=["oi"], inplace=True)
                df["timestamp"] = pd.to_datetime(df["timestamp"])
                df = df.sort_values(by="timestamp")

                df_filtered = df[df["timestamp"] <= target_time]
                print("🧪 Closest timestamp ≤ target:", df_filtered.tail(1))

                if not df_filtered.empty:
                    return df_filtered.iloc[-1]["close"]

        return None

    for result in results:
        timestamp = result.timestamp

        if result.actual_5 is None and now >= timestamp + timedelta(minutes=0.1):
            target = timestamp + timedelta(minutes=5)
            actual = fetch_actual_for(target)
            if actual is not None:
                result.actual_5 = actual
                result.error_5 = abs(actual - result.pred_5)

        if result.actual_10 is None and now >= timestamp + timedelta(minutes=0.2):
            target = timestamp + timedelta(minutes=10)
            actual = fetch_actual_for(target)
            if actual is not None:
                result.actual_10 = actual
                result.error_10 = abs(actual - result.pred_10)

        if result.actual_15 is None and now >= timestamp + timedelta(minutes=0.3):
            target = timestamp + timedelta(minutes=15)
            actual = fetch_actual_for(target)
            if actual is not None:
                result.actual_15 = actual
                result.error_15 = abs(actual - result.pred_15)

        result.save()

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

    for result in results:
        timestamp = result.timestamp

        def fetch_actual_for(target_time):
            instrument_key = 'NSE_EQ|INE002A01018'  # Reliance Industries
            interval = '1minute'

            url = f'https://api.upstox.com/v2/historical-candle/intraday/{instrument_key}/{interval}'
            headers = {
                'Accept': 'application/json',
                # Add auth if needed:
                # 'Authorization': f'Bearer {os.getenv("UPSTOX_API_KEY")}'
            }

            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                candles = response.json().get("data", {}).get("candles", [])
                if candles:
                    df = pd.DataFrame(
                        candles,
                        columns=["timestamp", "open", "high", "low", "close", "volume", "oi"]
                    )
                    df.drop(columns=["oi"], inplace=True)
                    df["timestamp"] = pd.to_datetime(df["timestamp"])
                    df = df.sort_values(by="timestamp")

                    df_filtered = df[df["timestamp"] <= target_time]
                    if not df_filtered.empty:
                        print(f"✅ Found actual for {target_time}: {df_filtered.iloc[-1]['close']}")
                        return df_filtered.iloc[-1]["close"]
            else:
                print(f"❌ Failed to fetch Upstox data: {response.status_code} - {response.text}")
            return None

        if result.actual_5 is None and now >= timestamp + timedelta(minutes=5):
            target = timestamp + timedelta(minutes=5)
            actual = fetch_actual_for(target)
            if actual is not None:
                result.actual_5 = actual
                result.error_5 = abs(actual - result.pred_5)
                print(f"✅ Updated actual_5 for prediction {result.id}: {actual}")

        if result.actual_10 is None and now >= timestamp + timedelta(minutes=10):
            target = timestamp + timedelta(minutes=10)
            actual = fetch_actual_for(target)
            if actual is not None:
                result.actual_10 = actual
                result.error_10 = abs(actual - result.pred_10)
                print(f"✅ Updated actual_10 for prediction {result.id}: {actual}")

        if result.actual_15 is None and now >= timestamp + timedelta(minutes=15):
            target = timestamp + timedelta(minutes=15)
            actual = fetch_actual_for(target)
            if actual is not None:
                result.actual_15 = actual
                result.error_15 = abs(actual - result.pred_15)
                print(f"✅ Updated actual_15 for prediction {result.id}: {actual}")

        result.save()

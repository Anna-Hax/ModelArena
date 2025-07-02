import pandas as pd
import numpy as np
from sklearn.multioutput import MultiOutputRegressor
import xgboost as xgb
import pickle
import os

def prepare_features(df):
    X, y = [], []
    for i in range(len(df) - 12):  # Make sure i+12 is valid
        window = df.iloc[i:i+10]

        # Check for NaNs in input
        if window.isnull().values.any():
            continue

        try:
            future_5 = df.iloc[i+10]["close"]
            future_10 = df.iloc[i+11]["close"]
            future_15 = df.iloc[i+12]["close"]
        except IndexError:
            continue

        # Skip if any of the target values is NaN
        if pd.isna(future_5) or pd.isna(future_10) or pd.isna(future_15):
            continue

        features = window[["open", "high", "low", "close", "volume"]].values.flatten()
        X.append(features)
        y.append([future_5, future_10, future_15])
    return np.array(X), np.array(y)


def main():
    # Path to historical data
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__),  'data', 'hist_data_reliance.csv'))
    df = pd.read_csv(csv_path)

    # Feature preparation
    X, y = prepare_features(df)

    # Use XGBoost instead of RandomForest
    base_model = xgb.XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42)
    model = MultiOutputRegressor(base_model)
    model.fit(X, y)

    # Save model
    with open("model.pkl", "wb") as f:
        pickle.dump(model, f)
    print("✅ XGBoost multi-output model trained and saved as model.pkl")

if __name__ == "__main__":
    main()

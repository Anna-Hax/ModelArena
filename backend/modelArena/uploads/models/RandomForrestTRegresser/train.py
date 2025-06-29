import pandas as pd
import numpy as np
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor
import pickle
import os

def load_data(file_path):
    df = pd.read_csv(file_path)
    return df

def prepare_features(df):
    X, y = [], []
    for i in range(len(df) - 10 - 15):  # Ensure future steps are available
        window = df.iloc[i:i+10]
        future_5 = df.iloc[i+10]["close"]
        future_10 = df.iloc[i+11]["close"]
        future_15 = df.iloc[i+12]["close"]
        features = window[["open", "high", "low", "close", "volume"]].values.flatten()
        X.append(features)
        y.append([future_5, future_10, future_15])
    return np.array(X), np.array(y)

def main():
    # Get the base directory (where model.py resides)

    # Construct full path to the historical data CSV
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'hist_data_reliance.csv'))

    df = pd.read_csv(csv_path)

    # Load and process
    df = pd.read_csv(csv_path)
    X, y = prepare_features(df)

    X, y = prepare_features(df)

    base_model = RandomForestRegressor(n_estimators=100, random_state=42)
    model = MultiOutputRegressor(base_model)
    model.fit(X, y)

    with open("model.pkl", "wb") as f:
        pickle.dump(model, f)
    print("✅ Multi-output model trained and saved as model.pkl")

if __name__ == "__main__":
    main()

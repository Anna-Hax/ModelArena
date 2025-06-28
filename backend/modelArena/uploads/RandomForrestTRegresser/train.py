import pandas as pd
import numpy as np
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor
import pickle

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
    df = load_data("historical_data_d.csv")
    X, y = prepare_features(df)

    base_model = RandomForestRegressor(n_estimators=100, random_state=42)
    model = MultiOutputRegressor(base_model)
    model.fit(X, y)

    with open("model.pkl", "wb") as f:
        pickle.dump(model, f)
    print("✅ Multi-output model trained and saved as model.pkl")

if __name__ == "__main__":
    main()

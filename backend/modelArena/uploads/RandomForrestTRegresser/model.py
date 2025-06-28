import pickle
import pandas as pd
import numpy as np

class StockPredictor:
    def __init__(self):
        with open("model.pkl", "rb") as f:
            self.model = pickle.load(f)

    def preprocess(self, df):
        if len(df) != 10:
            raise ValueError("input_data_d.csv must contain exactly 10 rows of OHLCV data")
        return df[["open", "high", "low", "close", "volume"]].values.flatten().reshape(1, -1)

    def predict(self):
        df = pd.read_csv("input_data_d.csv")
        X = self.preprocess(df)
        predictions = self.model.predict(X)
        return {
            "+5min": float(predictions[0]),
            "+10min": float(predictions[1]),
            "+15min": float(predictions[2]),
        }

# Optional local test
if __name__ == "__main__":
    predictor = StockPredictor()
    result = predictor.predict()
    print(f"Predicted close prices: {result}")

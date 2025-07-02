import pickle
import pandas as pd
import numpy as np
import os

class StockPredictor:
    def __init__(self):
        base_path = os.path.dirname(__file__)  # path of model.py
        model_path = os.path.join(base_path, "model.pkl")
        with open(model_path, "rb") as f:
            self.model = pickle.load(f)

    def preprocess(self, df):
        if len(df) != 10:
            raise ValueError("input_data_d.csv must contain exactly 10 rows of OHLCV data")
        return df[["open", "high", "low", "close", "volume"]].values.flatten().reshape(1, -1)

    def predict(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(base_dir, "..", "..", "data", "input_data_d.csv")
        
        df = pd.read_csv(csv_path)
        X = self.preprocess(df)
        predictions = self.model.predict(X)
        return {
            "+5min": float(predictions[0][0]),
            "+10min": float(predictions[0][1]),
            "+15min": float(predictions[0][2]),
        }

# Optional local test
if __name__ == "__main__":
    predictor = StockPredictor()
    result = predictor.predict()
    print(f"Predicted close prices: {result}")

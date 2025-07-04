from collections import defaultdict
from ..models import PredictionResult

def get_sorted_leaderboard():
    model_data = defaultdict(lambda: {
        "user": None,
        "model_file": "",
        "total_error": 0,
        "count": 0,
        "predictions": [],
    })

    results = PredictionResult.objects.select_related('model__user').all()

    for result in results:
        model_instance = result.model
        model_id = model_instance.id
        user = model_instance.user

        for i in [result.error_5, result.error_10, result.error_15]:
            if i is not None:
                model_data[model_id]["total_error"] += i
                model_data[model_id]["count"] += 1

        model_data[model_id]["user"] = user
        model_data[model_id]["model_file"] = model_instance.model.url 
        
        model_data[model_id]["predictions"].append({
            "timestamp": result.timestamp,
            "pred_5": result.pred_5,
            "actual_5": result.actual_5,
            "pred_10": result.pred_10,
            "actual_10": result.actual_10,
            "pred_15": result.pred_15,
            "actual_15": result.actual_15,
        })

    leaderboard = []
    for model_id, data in model_data.items():
        if data["count"] == 0:
            continue

        avg_error = data["total_error"] / data["count"]
        user = data["user"]

        leaderboard.append({
            "model_file": data["model_file"],
            "uploaded_by": user.username,
            "wallet_address": getattr(user, "wallet_address", None),
            "average_error": round(avg_error, 4),
            "predictions": data["predictions"],
        })

    leaderboard.sort(key=lambda x: x["average_error"])

    for i, entry in enumerate(leaderboard, start=1):
        entry["rank"] = i

    return leaderboard

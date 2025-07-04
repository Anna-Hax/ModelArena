import os
import sys
import subprocess
import json
import datetime
from collections import defaultdict
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from model.models import AiModel
from prediction.models import PredictionResult
from django.db.models import Q
import math
from prediction.utils.leaderboard import get_sorted_leaderboard


class RunPredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Check if only model info is requested
            only_model_info = request.data.get('only_model_info', False)
            
            if only_model_info:
                # Return only basic model information without running predictions
                results = []
                for model_entry in AiModel.objects.all():
                    results.append({
                        "uploaded_by": model_entry.user.username,
                        "model_file": model_entry.model.name,
                        "reward_token": model_entry.reward_token,  # Include reward tokens
                    })
                
                return Response({
                    "status": "success",
                    "results": results
                })
            
            # Original prediction logic - runs when only_model_info is False or not provided
            # Step 1: Run input_data_d.py to get latest candle data
            input_script = os.path.join(settings.BASE_DIR, 'api_call', 'input_data_d.py')
            subprocess.run([sys.executable, input_script], check=True)

            results = []

            for model_entry in AiModel.objects.all():
                model_file_path = model_entry.model.path
                model_folder_name = os.path.splitext(os.path.basename(model_file_path))[0]
                model_folder = os.path.join(settings.BASE_DIR, 'uploads', 'models', model_folder_name)
                model_script_path = os.path.join(model_folder, 'model.py')

                if not os.path.exists(model_script_path):
                    print(f" model.py not found for {model_entry.model.name}")
                    continue

                try:
                    result = subprocess.run(
                        [sys.executable, model_script_path],
                        check=True, capture_output=True, text=True
                        )
                    output_lines = result.stdout.strip().split('\n')
                    prediction_line = output_lines[-1]

                    predictions = json.loads(prediction_line.replace("Predicted close prices: ", ""))

                    prediction_obj = PredictionResult.objects.create(
                        model=model_entry,
                        timestamp=datetime.datetime.now(),
                        pred_5=predictions["+5min"],
                        pred_10=predictions["+10min"],
                        pred_15=predictions["+15min"]
                    )

                    results.append({
                        "uploaded_by": model_entry.user.username,
                        "model_file": model_entry.model.name,
                        "reward_token": model_entry.reward_token,  # Include reward tokens
                        "predictions": predictions,
                        "actual_5":  prediction_obj.actual_5,
                        "actual_10": prediction_obj.actual_10,
                        "actual_15": prediction_obj.actual_15,
                        "timestamp": prediction_obj.timestamp
                    })

                except subprocess.CalledProcessError as e:
                    print(f" Error running model: {e.stderr}")
                    results.append({
                        "uploaded_by": model_entry.user.username,
                        "model_file": model_entry.model.name,
                        "reward_token": model_entry.reward_token,  # Include reward tokens
                        "error": e.stderr.strip()
                    })

            return Response({
                "status": "success",
                "results": results
            })

        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            return Response({
                "status": "error",
                "message": str(e)
            }, status=500)
        

def calculate_and_award_rewards():
    
    try:
        # Get all predictions that have actual values but haven't been rewarded yet
        predictions = PredictionResult.objects.filter(
            actual_5__isnull=False,
            rewarded=False  # You might want to add this field to track rewarded predictions
        )
        
        if not predictions.exists():
            return
        
        # Calculate accuracy for 5-minute predictions
        prediction_accuracies = []
        for pred in predictions:
            if pred.actual_5 is not None:
                # Calculate percentage error
                error = abs(pred.pred_5 - pred.actual_5) / pred.actual_5 * 100
                accuracy = max(0, 100 - error)  # Higher accuracy = lower error
                prediction_accuracies.append({
                    'prediction': pred,
                    'accuracy': accuracy,
                    'model': pred.model
                })
        
        if prediction_accuracies:
            # Find the model with highest accuracy
            best_prediction = max(prediction_accuracies, key=lambda x: x['accuracy'])
            
            # Award reward token to the best model
            best_model = best_prediction['model']
            best_model.reward_token += 1
            best_model.save()
            
            # Mark predictions as rewarded
            for pred_data in prediction_accuracies:
                pred_data['prediction'].rewarded = True
                pred_data['prediction'].save()
            
            print(f"🏆 Rewarded {best_model.user.username} with 1 token! Accuracy: {best_prediction['accuracy']:.2f}%")
            
    except Exception as e:
        print(f"❌ Error in reward calculation: {str(e)}")

# You can also create a separate view to manually trigger rewards
class AwardRewardsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            calculate_and_award_rewards()
            return Response({
                "status": "success",
                "message": "Rewards calculated and awarded!"
            })
        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=500)



class LeaderboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        leaderboard = get_sorted_leaderboard()
        return Response({"leaderboard": leaderboard})
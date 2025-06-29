import os
import subprocess
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from model.models import AiModel


class RunPredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Step 1: Run input_data_d.py once to get latest candle data
            input_script = os.path.join(settings.BASE_DIR, 'api_call','input_data_d.py')
            subprocess.run(["python", input_script], check=True)

            # Step 2: Loop through all uploaded models
            results = []
            for model_entry in AiModel.objects.all():
                model_file_path = model_entry.model.path  # Full ZIP file path (after unzipping)
                print(model_file_path)
    
            # Get the model folder name (strip ZIP extension if needed)
                model_folder_name = os.path.splitext(os.path.basename(model_file_path))[0]
                print(model_folder_name)
                model_folder = os.path.join(settings.BASE_DIR, 'uploads', 'models', model_folder_name)
                print(model_folder)
                model_script_path = os.path.join(model_folder, 'model.py')
                print(model_script_path)

                if not os.path.exists(model_script_path):
                    continue  # Skip if model.py doesn't exist

                # Run the model.py and capture output
                try:
                    result = subprocess.run(
                        ["python", model_script_path],
                        check=True, capture_output=True, text=True
                    )
                    output_lines = result.stdout.strip().split('\n')
                    prediction_line = output_lines[-1]
                    predictions = json.loads(prediction_line.replace("Predicted close prices: ", ""))

                    results.append({
                        "uploaded_by": model_entry.user.username,
                        "model_file": model_entry.model.name,
                        "predictions": predictions
                    })

                except subprocess.CalledProcessError as e:
                    results.append({
                        "uploaded_by": model_entry.user.username,
                        "model_file": model_entry.model.name,
                        "error": e.stderr.strip()
                    })

            return Response({
                "status": "success",
                "results": results
            })

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=500)

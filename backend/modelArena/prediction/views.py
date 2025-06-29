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
            # Step 1: Run input_data_d.py to get latest candle data
            input_script = os.path.join(settings.BASE_DIR, 'api_call', 'input_data_d.py')
            subprocess.run(["python", input_script], check=True)

            # Step 2: Loop through all uploaded models
            results = []

            for model_entry in AiModel.objects.all():
                model_file_path = model_entry.model.path
                print("📦 ZIP path:", model_file_path)

                # Extract folder name from uploaded ZIP name
                model_folder_name = os.path.splitext(os.path.basename(model_file_path))[0]
                model_folder = os.path.join(settings.BASE_DIR, 'uploads', 'models', model_folder_name)
                model_script_path = os.path.join(model_folder, 'model.py')
                print("📁 Model folder:", model_folder)
                print("📜 Script path:", model_script_path)

                if not os.path.exists(model_script_path):
                    print(f"❌ model.py not found for {model_entry.model.name}")
                    continue

                # Run model.py script
                try:
                    result = subprocess.run(
                        ["python", model_script_path],
                        check=True, capture_output=True, text=True
                    )
                    output_lines = result.stdout.strip().split('\n')
                    prediction_line = output_lines[-1]

                    # Must be valid JSON - use json.dumps in model.py
                    predictions = json.loads(prediction_line.replace("Predicted close prices: ", ""))

                    results.append({
                        "uploaded_by": model_entry.user.username,
                        "model_file": model_entry.model.name,
                        "predictions": predictions
                    })

                except subprocess.CalledProcessError as e:
                    print(f"🔴 Error running model: {e.stderr}")
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
            print(f"❌ Unexpected error: {str(e)}")
            return Response({
                "status": "error",
                "message": str(e)
            }, status=500)

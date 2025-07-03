from .models import AiModel
from rest_framework import permissions, generics
from .serializers import AiModelSerializer
import zipfile
import os
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class AiModelUploadView(generics.ListCreateAPIView):
    queryset = AiModel.objects.all()
    serializer_class = AiModelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def perform_create(self, serializer):
        # Save with user association (hackathon is passed via serializer)
        instance = serializer.save(user=self.request.user)

        try:
            zip_path = instance.model.path  # Full path to uploaded ZIP
            print(f"📦 ZIP Path: {zip_path}")

            # Step 1: Compute base dir (e.g., /ModelArena)
            base_dir = os.path.dirname(os.path.dirname(zip_path))

            # Step 2: Path to target extraction folder: /ModelArena/uploads/models
            models_root = os.path.join(base_dir, 'uploads', 'models')

            # Step 3: Extract into folder named after zip file (without extension)
            zip_name = os.path.splitext(os.path.basename(zip_path))[0]
            extract_to = os.path.join(models_root, zip_name)

            # Step 4: Create the target folder if not already present
            os.makedirs(extract_to, exist_ok=True)

            # Step 5: Extract ZIP contents into extract_to folder
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
            print(f"✅ Extracted model to: {extract_to}")

            # Step 6: Delete the original zip file after extraction
            os.remove(zip_path)
            print(f"🗑️ Removed ZIP: {zip_path}")

        except Exception as e:
            logger.error(f"❌ Error unzipping model: {str(e)}")

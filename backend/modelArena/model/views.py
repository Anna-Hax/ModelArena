
from .models import AiModel
from rest_framework import permissions, generics
from .serializers import AiModelSerializer
import zipfile
import os
import shutil
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class AiModelUploadView(generics.ListCreateAPIView):
    queryset = AiModel.objects.all()
    serializer_class = AiModelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    import os
import zipfile

def perform_create(self, serializer):
    instance = serializer.save(user=self.request.user)

    try:
        # Full path to the uploaded ZIP file
        zip_path = instance.model.path

        # Define your final models folder path
        base_dir = os.path.dirname(os.path.dirname(zip_path))  # This gets you to /backend/modelArena/
        target_dir = os.path.join(base_dir,'..','uploads', 'models')

        os.makedirs(target_dir, exist_ok=True)

        # Unzip the model.zip contents into uploads/models/<username>_<model_id>/
        extract_path = os.path.join(target_dir)
        os.makedirs(extract_path, exist_ok=True)

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)

        print(f"✅ Extracted to {extract_path}")

    except Exception as e:
        print(f"❌ Error unzipping model: {str(e)}")


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

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)

        try:
            # Full path to the uploaded zip file
            zip_path = instance.model.path

            # Target extraction directory inside uploads/
            target_dir = os.path.join(os.path.dirname(zip_path))
            os.makedirs(target_dir, exist_ok=True)

            # Extract zip contents
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(target_dir)
            
            # Remove the original .zip file
            os.remove(zip_path)


            logger.info(f"Model unzipped to {target_dir} and original zip removed.")

        except Exception as e:
            logger.error(f"Unzipping failed: {e}")


        

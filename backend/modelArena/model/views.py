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
        instance = serializer.save(user=self.request.user)

        try:
            zip_path = instance.model.path  # Full path to uploaded ZIP
            print(zip_path)
            base_dir = os.path.dirname(os.path.dirname(zip_path))  # /backend/modelArena/
            print(base_dir)
            target_dir = os.path.join(base_dir, 'uploads', 'models')
            print(target)

            os.makedirs(target_dir, exist_ok=True)

            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(target_dir)  # ✅ Extract directly into models/


            print(f"✅ Extracted model to: {target_dir}")

            os.remove(zip_path)


        except Exception as e:
            logger.error(f"❌ Error unzipping model: {str(e)}")

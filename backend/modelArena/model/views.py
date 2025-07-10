from .models import AiModel
from rest_framework import permissions, generics
from .serializers import AiModelSerializer
import zipfile
import os
from django.conf import settings
import logging
from hackathon.models import HackathonConfig

logger = logging.getLogger(__name__)

class AiModelUploadView(generics.ListCreateAPIView):
    queryset = AiModel.objects.all()
    serializer_class = AiModelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def perform_create(self, serializer):
        # Extract hackathon_id from the POST data
        hackathon_id = self.request.data.get("hackathon_id")

        if not hackathon_id:
            raise ValueError("hackathon_id is required")

        try:
            hackathon = HackathonConfig.objects.get(blockchain_id=hackathon_id)
        except HackathonConfig.DoesNotExist:
            raise ValueError(f"Hackathon with ID {hackathon_id} does not exist")

        # Save with user and hackathon association
        instance = serializer.save(user=self.request.user, hackathon=hackathon)

        try:
            zip_path = instance.model.path  # Full path to uploaded ZIP
            print(f"📦 ZIP Path: {zip_path}")

            base_dir = os.path.dirname(os.path.dirname(zip_path))
            models_root = os.path.join(base_dir, 'uploads', 'models')
            zip_name = os.path.splitext(os.path.basename(zip_path))[0]
            extract_to = os.path.join(models_root, zip_name)

            os.makedirs(extract_to, exist_ok=True)

            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
            print(f"✅ Extracted model to: {extract_to}")

            os.remove(zip_path)
            print(f"🗑️ Removed ZIP: {zip_path}")

        except Exception as e:
            logger.error(f"❌ Error unzipping model: {str(e)}")
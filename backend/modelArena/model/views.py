from .models import AiModel
from rest_framework import permissions
from rest_framework import generics
from .serializers import AiModelSerializer
import zipfile
import logging
logger = logging.getLogger(__name__)

# Create your views here.
#def unzip():
#    with zipfile.ZipFile('../uploads/', 'r') as zip_ref:
#        zip_ref.extractall('../uploads/unzip/')
class AiModelUploadView(generics.ListCreateAPIView):
    queryset = AiModel.objects.all()
    serializer_class = AiModelSerializer
    permission_classes = [permissions.IsAuthenticated]

    # authenticated users can only see their own tasks
    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        return qs.filter(user=user)
        

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        

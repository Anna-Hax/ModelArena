# files
from .serializers import RegisterSerializer
from django.contrib.auth.models import User
#
import logging
# rest framework
from rest_framework import generics
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

logger = logging.getLogger(__name__)


class JWTTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


#class UserSearchView(generics.ListAPIView):
#    serializer_class = UserSummarySerializer
#    permission_classes = [IsAuthenticated]  
#    queryset = User.objects.all()
#    filter_backends = [SearchFilter]
#    search_fields = ['username']
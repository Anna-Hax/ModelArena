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
# views.py
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_wallet_address(request):
    wallet_address = request.data.get("wallet_address")

    if not wallet_address:
        return Response({"error": "Wallet address required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile, created = Profile.objects.get_or_create(user=request.user)
        profile.wallet_address = wallet_address
        profile.save()
        return Response({"message": "Wallet address saved successfully"})
    except Exception as e:
        logger.error(f"Failed to save wallet address: {e}")
        return Response({"error": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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
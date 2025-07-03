from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Profile
# files
from .serializers import RegisterSerializer, UserSummarySerializer
from django.contrib.auth.models import User
#
import logging
# rest framework
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

logger = logging.getLogger(__name__)
# views.py
# views.py


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_wallet_address(request):
    wallet_address = request.data.get("wallet_address")

    if not wallet_address:
        return Response({"error": "Wallet address required"}, status=status.HTTP_400_BAD_REQUEST)

    request.user.wallet_address = wallet_address
    request.user.save()

    return Response({"message": "Wallet address saved successfully"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_wallet_exists(request):
    """
    Check if the authenticated user has a wallet address
    """
    try:
        # Get the user's profile
        profile = request.user.profile
        
        # Check if wallet address exists and is not empty
        has_wallet = bool(profile.wallet_address and profile.wallet_address.strip())
        
        return Response({
            "has_wallet": has_wallet,
            "wallet_address": profile.wallet_address if has_wallet else None
        }, status=status.HTTP_200_OK)
        
    except Profile.DoesNotExist:
        # If profile doesn't exist, create it
        Profile.objects.create(user=request.user)
        return Response({
            "has_wallet": False,
            "wallet_address": None
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "error": "Something went wrong",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




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

class UserSearchView(APIView):
    def get(self, request):
        serializer = UserSummarySerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from blockchain.arena_contract import  fulfill_winner, get_players
from hackathon.models import HackathonConfig
from prediction.models import PredictionResult
from django.db.models import ExpressionWrapper, F, FloatField


class ArenaViewSet(ViewSet):
    permission_classes = [AllowAny]  

    @action(detail=False, methods=["post"], permission_classes=[IsAdminUser])
    def fulfill_winner(self, request):
        
        hackathon_id = int(request.data.get("hackathon_id"))
        try:
            hackathon = HackathonConfig.objects.get(blockchain_id=hackathon_id)
        except HackathonConfig.DoesNotExist:
            return Response({"error": "Hackathon not found"}, status=404)

        predictions = PredictionResult.objects.filter(hackathon=hackathon).annotate(
            avg_error=ExpressionWrapper(
            (F('error_5') + F('error_10') + F('error_15')) / 3.0,
            output_field=FloatField()
            )
        ).order_by('avg_error')
        if not predictions.exists():
            return Response({"error": "No predictions available for this hackathon"}, status=400)

        best_prediction = predictions.first()
        user = best_prediction.model.user
        wallet_address = user.profile.wallet_address
        
        if not wallet_address:
            return Response({"error": "Winner has no wallet address"}, status=400)

        try:
            tx_hash = fulfill_winner(hackathon_id, wallet_address)
            return Response({
                "winner_username": user.username,
                "wallet_address": wallet_address,
                "tx_hash": tx_hash
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=["get"])
    def players(self, request):
        hackathon_id = int(request.query_params.get("hackathon_id", 0))  # default to 0
        try:
            players = get_players(hackathon_id)
            return Response({"hackathon_id": hackathon_id, "players": players})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

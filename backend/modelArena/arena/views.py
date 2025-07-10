from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from hackathon.models import HackathonConfig
from prediction.models import PredictionResult
from django.db.models import ExpressionWrapper, F, FloatField
from blockchain.arena_contract import create_hackathon, join_hackathon, fulfill_winner, get_players
import logging

logger = logging.getLogger(__name__)

class ArenaViewSet(ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def fulfill(self, request):
        logger.info("Starting winner fulfillment process")

        # Validate hackathon_id
        try:
            hackathon_id = int(request.data.get("hackathon_id"))
        except (TypeError, ValueError):
            logger.error("Invalid hackathon_id provided")
            return Response({"error": "Invalid or missing hackathon_id"}, status=400)

        # Get hackathon config
        try:
            hackathon = HackathonConfig.objects.get(blockchain_id=hackathon_id)
        except HackathonConfig.DoesNotExist:
            logger.error(f"Hackathon with blockchain_id {hackathon_id} not found")
            return Response({"error": "Hackathon not found"}, status=404)

        # Get predictions
        predictions = PredictionResult.objects.filter(model__hackathon=hackathon)

        if not predictions.exists():
            logger.error(f"No predictions available for hackathon {hackathon_id}")
            return Response({"error": "No predictions available for this hackathon"}, status=400)

        # Patch missing errors (FOR TESTING ONLY)
        for p in predictions:
            if p.error_5 is None: p.error_5 = abs(p.pred_5 - (p.actual_5 or 100))
            if p.error_10 is None: p.error_10 = abs(p.pred_10 - (p.actual_10 or 100))
            if p.error_15 is None: p.error_15 = abs(p.pred_15 - (p.actual_15 or 100))

        # Sort by avg error
        predictions = sorted(predictions, key=lambda p: (p.error_5 + p.error_10 + p.error_15) / 3)
        best_prediction = predictions[0]
        user = best_prediction.model.user
        logger.info(f"Winner determined: {user.username}")

        wallet_address = user.profile.wallet_address
        logger.info(f"Winner wallet address: {wallet_address}")

        if not wallet_address:
            logger.error(f"Winner {user.username} has no wallet address")
            return Response({"error": "Winner has no wallet address"}, status=400)

        # Execute blockchain transaction
        try:
            tx_hash = fulfill_winner(hackathon_id, wallet_address)
            logger.info(f"Winner fulfillment successful. TX Hash: {tx_hash}")
            return Response({
                "winner_username": user.username,
                "wallet_address": wallet_address,
                "tx_hash": tx_hash.hex() if hasattr(tx_hash, "hex") else str(tx_hash)
            })
        except Exception as e:
            logger.error(f"Blockchain fulfill failed for hackathon {hackathon_id}: {str(e)}")
            return Response({"error": f"Blockchain fulfill failed: {str(e)}"}, status=500)

    @action(detail=False, methods=["get"])
    def players(self, request):
        hackathon_id = int(request.query_params.get("hackathon_id", 0))  # default to 0
        try:
            players = get_players(hackathon_id)
            return Response({"hackathon_id": hackathon_id, "players": players})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


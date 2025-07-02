from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from blockchain.arena_contract import create_hackathon, join_hackathon, fulfill_winner, get_players


class ArenaViewSet(ViewSet):
    permission_classes = [AllowAny]  

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def create_hackathon(self, request):
        try:
            start_time = request.data.get("start_time")
            tx_hash = create_hackathon(int(start_time))
            return Response({"tx_hash": tx_hash})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


    @action(detail=False, methods=["post"])
    def join_hackathon(self, request):
        hackathon_id = int(request.data.get("hackathon_id"))
        stake = int(request.data.get("stake"))  
        hash = join_hackathon(hackathon_id, stake)
        return Response({"tx_hash": hash})

    @action(detail=False, methods=["post"], permission_classes=[IsAdminUser])
    def fulfill_winner(self, request):
        hackathon_id = int(request.data.get("hackathon_id"))
        winner_address = request.data.get("winner_address")
        hash = fulfill_winner(hackathon_id, winner_address)
        return Response({"tx_hash": hash})

    @action(detail=False, methods=["get"])
    def players(self, request):
        hackathon_id = int(request.query_params.get("hackathon_id", 0))  # default to 0
        try:
            players = get_players(hackathon_id)
            return Response({"hackathon_id": hackathon_id, "players": players})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

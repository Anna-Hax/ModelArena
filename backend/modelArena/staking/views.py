from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from blockchain.staking_contract import enter_platform, stake_for_model, get_total_stake


class StakeViewSet(ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"])
    def enter_platform(self, request):
        try:
            hash = enter_platform()
            return Response({"hash": hash})
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    @action(detail=False, methods=["post"])
    def stake_for_model(self, request):
        try:
            amount = int(request.data.get("amount"))
            hash = stake_for_model(amount)
            return Response({"hash": hash})
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    @action(detail=True, methods=["get"])
    def total_stake(self, request, pk=None):
        try:
            total = get_total_stake(pk)
            return Response({"user": pk, "total_stake": total})
        except Exception as e:
            return Response({"error": str(e)}, status=400)

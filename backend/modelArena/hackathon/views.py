from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import timezone, datetime
from .models import HackathonConfig

class HackathonStatusView(APIView):
    def get(self, request):
        try:
            hackathon = HackathonConfig.objects.latest('start_time')  # get latest scheduled

            now = datetime.now(hackathon.start_time.tzinfo)  # aware datetime

            if now < hackathon.start_time:
                status = "upcoming"
                time_to_start = (hackathon.start_time - now).total_seconds()
                time_remaining = None
            elif hackathon.start_time <= now <= hackathon.end_time:
                status = "running"
                time_to_start = None
                time_remaining = (hackathon.end_time - now).total_seconds()
            else:
                status = "ended"
                time_to_start = None
                time_remaining = None

            return Response({
                "title": hackathon.title,
                "start_time": hackathon.start_time,
                "duration_minutes": hackathon.duration_minutes,
                "hackathon_dataset_url": request.build_absolute_uri(hackathon.dataset.url) if hackathon.dataset else None,

                "status": status,
                "time_to_start": time_to_start,
                "time_remaining": time_remaining
            })

        except HackathonConfig.DoesNotExist:
            return Response({"status": "no_hackathon_scheduled"}, status=404)

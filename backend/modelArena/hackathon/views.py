from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import HackathonConfig

class HackathonStatusView(APIView):
    def get(self, request):
        try:
            hackathon = HackathonConfig.objects.latest('start_time')
            now = timezone.now()  # Timezone-aware current time

            if now < hackathon.start_time:
                status = "upcoming"
                time_to_start = (hackathon.start_time - now).total_seconds()
                time_remaining = None
            elif hackathon.start_time <= now <= hackathon.end_time:
                status = "ongoing"
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

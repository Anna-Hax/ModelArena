from rest_framework import serializers
from .models import HackathonConfig

class HackathonConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = HackathonConfig
        # Include blockchain_id in response, but not required from frontend
        fields = ['id', 'title', 'start_time', 'blockchain_id']
        read_only_fields = ['id', 'blockchain_id']

from rest_framework import serializers
from model.models import AiModel
from hackathon.models import HackathonConfig

class AiModelSerializer(serializers.ModelSerializer):
    hackathon = serializers.IntegerField(write_only=True)  # Accepts blockchain_id

    class Meta:
        model = AiModel
        fields = ['id', 'model', 'user', 'hackathon']
        read_only_fields = ['user']

    def validate(self, data):
        blockchain_id = data.get('hackathon')
        try:
            hackathon = HackathonConfig.objects.get(blockchain_id=blockchain_id)
        except HackathonConfig.DoesNotExist:
            raise serializers.ValidationError({"hackathon": f"No hackathon with blockchain ID {blockchain_id}"})

        data['hackathon'] = hackathon  # replace int with FK instance
        return data

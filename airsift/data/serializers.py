from rest_framework import serializers

from airsift.data import models

class DustboxSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Dustbox
        fields = '__all__'

class DustboxReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.DustboxReading
        fields = '__all__'

# class DustboxReadingAggregateSerializer(serializers.Serializer):
#     created_at = serializers.DateTimeField(required=False)
#     dustbox_id = serializers.CharField(required=False)
#     # created_at = serializers.DateTimeField(required=False)
#     # measure = serializers.FloatField(required=False)
#     # hour = serializers.DateTimeField(required=False)
#     # day = serializers.DateTimeField(required=False)
#     # aggregate_value = serializers.FloatField(required=False)
#     pm1 = serializers.FloatField(required=False)
#     pm2_5 = serializers.FloatField(required=False)
#     pm10 = serializers.FloatField(required=False)

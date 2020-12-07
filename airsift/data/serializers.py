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

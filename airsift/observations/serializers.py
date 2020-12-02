from rest_framework.serializers import ModelSerializer
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class LocationSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = 'observations.Observation'
        geo_field = "location"
        id_field = False
        fields = ('title', 'body', 'observation_type', 'datetime')

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('name', 'username', 'id')

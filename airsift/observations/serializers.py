from rest_framework.serializers import ModelSerializer
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from django.contrib.auth import get_user_model
from rest_framework.fields import Field
from wagtail.core.rich_text import expand_db_html
from wagtail.api import APIField

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

class APIRichTextField(APIField):
    def __init__(self, name):
        serializer = APIRichTextSerializer(name)
        super().__init__(name=name, serializer=serializer)

class APIRichTextSerializer(Field):
    def __init__(self, name):
        self.name = name
        super().__init__()

    def get_attribute(self, instance):
        return instance

    def to_representation(self, obj):
        # name = type(obj)._meta.app_label + '.' + type(obj).__name__
        # self.context['view'].seen_types[name] = type(obj)
        # return name
        value = getattr(obj, self.name)
        html = expand_db_html(value)
        return html

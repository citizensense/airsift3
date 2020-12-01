from django.db import models
from django.db.models import CharField, DateTimeField, ForeignKey
from django.http.response import JsonResponse
from rest_framework import generics
from rest_framework.serializers import ModelSerializer
from wagtail.core.models import Page, Orderable, PageRevision
from wagtail.core.fields import RichTextField
from wagtail.admin.edit_handlers import FieldPanel, InlinePanel
from django.contrib.gis.db.models import PointField
from django.contrib.gis.forms import OSMWidget
from wagtail.images.edit_handlers import ImageChooserPanel
from wagtailautocomplete.edit_handlers import AutocompletePanel
from wagtail.snippets.models import register_snippet
from wagtail.search import index
from modelcluster.fields import ParentalKey
from django.utils import timezone
from wagtail.api import APIField
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from wagtail.images.api.fields import ImageRenditionField
from django.contrib.auth import get_user_model
from rest_framework.response import Response

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
        fields = ('first_name', 'last_name', 'username', 'id')

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class Observation(Page):
    body = RichTextField(blank=True, null=True)
    observation_type = ForeignKey('observations.ObservationType', on_delete=models.DO_NOTHING, related_name='+')
    datetime = DateTimeField(blank=True, null=False, default=timezone.now)
    location = PointField(blank=True, null=True)

    content_panels = Page.content_panels + [
        FieldPanel('body', classname="full"),
        FieldPanel('datetime', classname="full"),
        AutocompletePanel('observation_type'),
        FieldPanel('location', widget=OSMWidget(attrs={
            'default_zoom': 13,
            'default_lat': 52.2043,
            'default_lon': 0.1149,
        })),
        InlinePanel('observation_images', label="Images"),
    ]

    search_fields = [
        index.SearchField('title', partial_match=True),
        index.SearchField('body', partial_match=True),
    ]

    def contributors(self):
        items = [
            revision.user
            for revision in PageRevision.objects.filter(page=self)
        ]
        return UserSerializer(items, many=True).data

    api_fields = [
        APIField('body'),
        APIField('observation_type'),
        APIField('datetime'),
        APIField('location', serializer=LocationSerializer),
        APIField('observation_images'),
        APIField('contributors')
    ]

class ObservationImage(Orderable):
    page = ParentalKey(Observation, related_name="observation_images")
    image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=False,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    panels = [
        ImageChooserPanel("image"),
    ]

    api_fields = [
        APIField('image'),
        APIField('image_thumbnail', serializer=ImageRenditionField('fill-80x80', source='image'))
    ]

@register_snippet
class ObservationType(models.Model):
    # e.g.
    # 'Location',
    # 'Smell',
    # 'Health Effects',
    # 'Visible Pollution',
    # 'Other'

    title = CharField(max_length=256)

    @classmethod
    def autocomplete_create(kls: type, value: str):
        return kls.objects.create(title=value)

    search_fields = [
        index.SearchField('title', partial_match=True),
    ]

    def __str__(self):
        return self.title

    api_fields = [
        APIField('title'),
    ]

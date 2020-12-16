from airsift.observations.serializers import APIRichTextField, LocationSerializer, UserSerializer
from django.db import models
from django.db.models import CharField, DateTimeField, ForeignKey
from wagtail.core.models import Page, Orderable, PageRevision
from wagtail.core.fields import RichTextField
from wagtail.admin.edit_handlers import FieldPanel, InlinePanel, ObjectList, TabbedInterface
from django.contrib.gis.db.models import PointField
from django.contrib.gis.forms import OSMWidget
from wagtail.images.edit_handlers import ImageChooserPanel
from wagtailautocomplete.edit_handlers import AutocompletePanel
from wagtail.snippets.models import register_snippet
from wagtail.search import index
from modelcluster.fields import ParentalKey
from django.utils import timezone
from wagtail.api import APIField
from wagtail.images.api.fields import ImageRenditionField
from modelcluster.fields import ParentalManyToManyField
from django.shortcuts import redirect

class Observation(Page):
    show_in_menus_default = True
    subpage_types = []

    body = RichTextField(blank=True, null=True)
    observation_type = ForeignKey('observations.ObservationType', on_delete=models.DO_NOTHING, related_name='+')
    datetime = DateTimeField(blank=True, null=False, default=timezone.now)
    location = PointField(blank=True, null=True)
    related_dustboxes = ParentalManyToManyField(
        'data.Dustbox',
        blank=True,
        null=True,
        verbose_name='Are there any Airsift Dustboxes monitoring this area?'
    )

    content_panels = Page.content_panels + [
        FieldPanel('body', classname="full"),
        AutocompletePanel('related_dustboxes'),
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
        items = list(set([
            revision.user
            for revision in PageRevision.objects.filter(page=self)
        ]))
        return UserSerializer(items, many=True).data

    edit_handler = TabbedInterface(
        [
            ObjectList(content_panels, heading='Content'),
        ]
    )

    api_fields = [
        APIRichTextField('body'),
        APIField('related_dustboxes'),
        APIField('observation_type'),
        APIField('datetime'),
        APIField('location', serializer=LocationSerializer),
        APIField('observation_images'),
        APIField('contributors')
    ]

    def __str__(self):
        return f'[{self.observation_type}] {self.title}'

    def autocomplete_label(self):
        return self.__str__()

    def relative_url(self, *args, **kwargs):
        return f'/observations/inspect/{self.pk}'

    def get_url(self, *args, **kwargs):
        return f'/observations/inspect/{self.pk}'

    def serve(self, request):
        # site_id, site_root, relative_page_url = self.get_url_parts(request)
        return redirect(f'/observations/inspect/{self.pk}')

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

    search_fields = [
        index.SearchField('title', partial_match=True),
    ]

    def __str__(self):
        return self.title

    api_fields = [
        APIField('title'),
    ]

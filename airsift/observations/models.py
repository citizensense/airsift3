from django.db import models
from django.db.models import CharField, DateTimeField, ForeignKey
from wagtail.core.models import Page, Orderable
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

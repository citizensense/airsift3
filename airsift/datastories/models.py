from airsift.observations.serializers import LocationSerializer, UserSerializer
from django.db import models
from django.db.models import CharField, DateTimeField, ForeignKey
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
from wagtail.images.api.fields import ImageRenditionField

# Create your models here.
class DataStory(Page):
    show_in_menus_default = True
    feature_image = ForeignKey('wagtailimages.image', on_delete=models.DO_NOTHING, related_name='+')
    body = RichTextField(blank=False, null=False)
    # TODO: location_name
    # TODO: Date From
    # TODO: Date To
    # TODO: Related Dustboxes
    # TODO: Related Data Stories

    content_panels = Page.content_panels + [
        ImageChooserPanel('feature_image'),
        FieldPanel('body')
    ]

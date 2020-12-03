from django.db import models
from django.db.models import ForeignKey
from wagtail.core.models import Page
from wagtail.core.fields import RichTextField
from wagtail.admin.edit_handlers import FieldPanel
from wagtail.images.edit_handlers import ImageChooserPanel

# Create your models here.
class DataStory(Page):
    class Meta:
        verbose_name_plural = 'Data Stories'

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

    promote_panels = []

    settings_panels = []

from django.db.models.fields.related import ForeignKey
from wagtail.admin.edit_handlers import FieldPanel
from wagtail.core.fields import RichTextField
from wagtail.core.models import Page
from django.db import models
from wagtail.images.edit_handlers import ImageChooserPanel

class HomePage(Page):
    pass

class InfoPage(Page):
    feature_image = ForeignKey('wagtailimages.image', on_delete=models.DO_NOTHING, related_name='+')
    body = RichTextField(blank=False, null=False)

    content_panels = Page.content_panels + [
        ImageChooserPanel('feature_image'),
        FieldPanel('body')
    ]

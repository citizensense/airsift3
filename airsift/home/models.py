from django.db.models.fields.related import ForeignKey
from wagtail.admin.edit_handlers import FieldPanel
from wagtail.core.fields import RichTextField
from wagtail.core.models import Page
from django.db import models
from wagtail.images.edit_handlers import ImageChooserPanel

class HomePage(Page):
    show_in_menus_default = True
    def get_active():
        return HomePage.objects.child_of(Page.get_first_root_node()).first()

class InfoPage(Page):
    show_in_menus_default = True
    feature_image = ForeignKey('wagtailimages.image', on_delete=models.DO_NOTHING, related_name='+', blank=True, null=True)
    body = RichTextField(blank=False, null=False)

    content_panels = Page.content_panels + [
        ImageChooserPanel('feature_image'),
        FieldPanel('body')
    ]

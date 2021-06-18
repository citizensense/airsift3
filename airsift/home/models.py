from airsift.utils.models import TweakedSeoMixin
from django.db.models.fields import CharField
from django.db.models.fields.related import ForeignKey
from wagtail.admin.edit_handlers import FieldPanel
from wagtail.core.fields import RichTextField
from wagtail.core.models import Page
from django.db import models
from wagtail.images.edit_handlers import ImageChooserPanel
from wagtailseo.models import SeoMixin, SeoType, TwitterCard

class HomePage(TweakedSeoMixin, Page):
    template = 'dustboxes/interactive_map_page.html'

    def get_active():
        return HomePage.objects.child_of(Page.get_first_root_node()).first()

    # Editor
    parent_page_types = ['wagtailcore.page'] # Only the Root page is this
    show_in_menus_default = True
    promote_panels = SeoMixin.seo_panels

class InfoPage(TweakedSeoMixin, Page):
    # SEO
    seo_content_type = SeoType.ARTICLE
    seo_twitter_card = TwitterCard.SUMMARY
    seo_description_sources = [
        "search_description",
        "body",
    ]
    seo_image_sources = [
        "og_image",
        "feature_image",
    ]

    # Copy
    feature_image = ForeignKey('wagtailimages.image', on_delete=models.DO_NOTHING, related_name='+', blank=True, null=True)
    body = RichTextField(blank=False, null=False)

    # Editor
    parent_page_types = ['home.HomePage']
    show_in_menus_default = True
    promote_panels = SeoMixin.seo_panels

    content_panels = Page.content_panels + [
        ImageChooserPanel('feature_image'),
        FieldPanel('body')
    ]

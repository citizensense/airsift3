from airsift.utils.models import TweakedSeoMixin
from airsift.data.models import Dustbox, DustboxPage
from airsift.observations.models import Observation
from django.db.models.fields import CharField
from django.db.models.fields.related import ForeignKey
from wagtail.admin.edit_handlers import FieldPanel
from wagtail.core.fields import RichTextField
from wagtail.core.models import Page
from django.db import models
from wagtail.images.edit_handlers import ImageChooserPanel
from wagtailseo.models import SeoMixin, SeoType, TwitterCard
from wagtail.contrib.routable_page.models import RoutablePageMixin, route
from django.core.handlers.wsgi import WSGIRequest

class InteractiveMapPage(RoutablePageMixin, TweakedSeoMixin, Page):
    # Copy
    feature_image = feature_image = ForeignKey('wagtailimages.image', on_delete=models.DO_NOTHING, related_name='+', blank=True, null=True)
    summary_text = CharField(max_length=300)

    # Editor
    parent_page_types = ['home.HomePage']
    show_in_menus_default = True
    promote_panels = SeoMixin.seo_panels
    content_panels = Page.content_panels + [
        ImageChooserPanel('feature_image'),
        FieldPanel('summary_text')
    ]

    # SEO
    seo_content_type = SeoType.WEBSITE
    seo_twitter_card = TwitterCard.LARGE
    seo_image_sources = [
        "og_image",
        "feature_image",
    ]
    seo_description_sources = [
        "search_description",
        "summary_text",
    ]

    # Subpage SEO
    @route(r'^inspect/([a-zA-Z0-9-]+)/?')
    def get_inspectable_seo_metadata(self, request: WSGIRequest, id, *args, **kwargs):
        child_page = None

        if 'observations' in request.get_full_path():
            try:
                child_page = Observation.objects.get(id=id)
            except:
                pass
        elif 'dustboxes' in request.get_full_path():
            try:
                child_page = DustboxPage.objects.get(slug=id)
            except:
                try:
                    dustbox = Dustbox.objects.get(id=id).get_page_representation()
                    try:
                        dustbox.generate_map_thumbnail()
                    except:
                        dustbox.og_image = self.feature_image
                    self.add_child(instance=dustbox)
                    child_page = DustboxPage.objects.get(slug=id)
                except:
                    pass

        return Page.serve(self, request, *args, child_page=child_page, **kwargs)

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        child_page = kwargs.get('child_page')
        if child_page:
            context['page'] = child_page
            context['self'] = child_page
        return context

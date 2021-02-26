from airsift.utils.models import TweakedSeoMixin
from typing import Optional
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
from wagtailseo.models import SeoMixin, SeoType, TwitterCard, AbstractImage
from django.utils.html import strip_tags

class Observation(TweakedSeoMixin, Page):
    # Copy
    body = RichTextField(blank=True, null=True)
    observation_type = ForeignKey('observations.ObservationType', on_delete=models.DO_NOTHING, related_name='+')
    datetime = DateTimeField(blank=True, null=False, default=timezone.now)
    location = PointField(blank=True, null=True)
    related_dustboxes = ParentalManyToManyField(
        'data.Dustbox',
        blank=True,
        verbose_name='Are there any Airsift Dustboxes monitoring this area?'
    )

    # API
    def contributors_list(self):
        return list(set([
            revision.user
            for revision in PageRevision.objects.filter(page=self)
        ]))

    def contributors(self):
        return UserSerializer(self.contributors_list(), many=True).data

    api_fields = [
        APIRichTextField('body'),
        APIField('related_dustboxes'),
        APIField('observation_type'),
        APIField('datetime'),
        APIField('location', serializer=LocationSerializer),
        APIField('observation_images'),
        APIField('contributors')
    ]

    # Editor
    parent_page_types = ['dustboxes.InteractiveMapPage', 'users.UserIndexPage']
    show_in_menus_default = True
    subpage_types = []

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

    edit_handler = TabbedInterface(
        [
            ObjectList(content_panels, heading='Content'),
        ]
    )

    search_fields = [
        index.SearchField('title', partial_match=True),
        index.SearchField('body', partial_match=True),
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

    # SEO
    seo_content_type = SeoType.ARTICLE
    seo_twitter_card = TwitterCard.LARGE
    seo_description_sources = [
        "search_description",
        "body",
    ]

    @property
    def seo_image(self) -> Optional[AbstractImage]:
        """
        Gets the primary Open Graph image of this page.
        """
        try:
            print(self.observation_images.all())
            first_media = self.observation_images.first()
            if first_media is not None:
                return first_media.image
            else:
                return self.og_image
        except:
            pass

    @property
    def seo_description(self) -> str:
        """
        Gets the correct search engine and Open Graph description of this page.
        Override in your Page model as necessary.
        """
        for attr in self.seo_description_sources:
            if hasattr(self, attr):
                text = getattr(self, attr)
                if text:
                    return strip_tags(text)
        return ""

    @property
    def seo_canonical_url(self) -> str:
        return f"{self.get_site().root_url}/observations/inspect/{self.id}"

    @property
    def seo_author(self) -> str:
        """
        Gets the name of the author of this page.
        Override in your Page model as necessary.
        """
        return ", ".join(list(map(str, self.contributors_list())))

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

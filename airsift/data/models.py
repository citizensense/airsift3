from io import BytesIO
import urllib
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from django.db.models.fields.related import ForeignKey
from wagtail.images.edit_handlers import ImageChooserPanel
from airsift.utils.models import TweakedSeoMixin
from django.db import models
from django.contrib.gis.db.models import PointField
from wagtail.api import APIField
from wagtail.core.models import Page, Site
from wagtailseo.models import SeoMixin, SeoType
from airsift.home.models import HomePage
from django.utils import dateformat, formats, timezone
import requests
from wagtail.images.models import Image
from django.core.files.images import ImageFile
from django.core.files.uploadedfile import UploadedFile

class Dustbox(models.Model):
    id = models.CharField(primary_key=True, max_length=36)
    created_at = models.DateTimeField()
    description = models.TextField()
    device_number = models.CharField(null=True, max_length=256)
    entries_number = models.IntegerField()
    last_entry_at = models.DateTimeField(null=True)
    location = PointField(null=True)
    public_key = models.CharField(max_length=256)
    slug = models.SlugField()
    title = models.CharField(max_length=256)
    updated_at = models.DateTimeField(null=True)

    @property
    def url(self, *args, **kwargs):
        return f'/dustboxes/inspect/{self.id}'

    api_fields = [
        APIField('id'),
        APIField('created_at'),
        APIField('description'),
        APIField('device_number'),
        APIField('entries_number'),
        APIField('last_entry_at'),
        APIField('location'),
        APIField('public_key'),
        APIField('slug'),
        APIField('title'),
        APIField('updated_at'),
    ]

    def get_page_representation(self):
        return DustboxPage(
            title=self.title,
            slug=self.id,
            search_description=self.description,
            first_published_at=self.created_at,
            last_published_at=self.last_entry_at,
            related_dustbox=self
        )

    def static_map_marker_image_url(self) -> str:
        if self.location is None:
            raise Exception("No map URL available for this dustbox")

        username = 'mapbox'
        style_id = 'streets-v11'
        lon = self.location.x
        lat = self.location.y
        marker_url = "https%3A%2F%2Fdocs.mapbox.com%2Fapi%2Fimg%2Fcustom-marker.png"
        overlay = f'url-{marker_url}({lon},{lat})'
        zoom = 12.5
        bearing = 0
        pitch = 0
        width = 250
        height = width

        params = {
            "access_token": "pk.eyJ1IjoiYWlyc2lmdCIsImEiOiJja2l1ZGo0aGMweGszMndtbTI4eW52YmZ1In0.eotYFVZuDGtZr_QxrRuySg"
        }

        # Construct URL
        parsed = urlparse(f"https://api.mapbox.com/styles/v1/{username}/{style_id}/static/{overlay}/{lon},{lat},{zoom},{bearing},{pitch}/{width}x{height}")
        query = dict(params)
        return urlunparse(
            (
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                urlencode(query, doseq=True),
                parsed.fragment,
            )
        )

class DustboxPage(TweakedSeoMixin, Page):
    template = 'dustboxes/interactive_map_page.html'
    seo_content_type=SeoType.ARTICLE
    related_dustbox = models.ForeignKey(Dustbox, on_delete=models.SET_NULL, blank=True, null=True)
    map_image = ForeignKey('wagtailimages.image', on_delete=models.DO_NOTHING, related_name='+', blank=True, null=True)

    seo_image_sources = [
        "og_image",
        "map_image",
    ]

    def relative_url(self, *args, **kwargs):
        return f'/dustboxes/inspect/{self.slug}'

    def get_url(self, *args, **kwargs):
        return f'/dustboxes/inspect/{self.slug}'

    # Editor
    parent_page_types = ['dustboxes.InteractiveMapPage']
    subpage_types = []
    promote_panels = SeoMixin.seo_panels
    content_panels = Page.content_panels + [
        ImageChooserPanel('map_image'),
    ]

    @property
    def seo_description(self) -> str:
        if self.search_description != self.title:
            return self.search_description
        date_from = dateformat.format(self.first_published_at, "d.m.Y")
        search_description=f"Browse air quality data, collected since {date_from}, for dustbox sensor {self.title}"
        return search_description

    @property
    def seo_canonical_url(self) -> str:
        return f'{self.get_site().root_url}/dustboxes/inspect/{self.slug}'

    def generate_map_thumbnail(self):
        if self.related_dustbox is None:
            return
        url = self.related_dustbox.static_map_marker_image_url()
        # Download data from url (requires `requests` module.  Can also be done with urllib)
        response = requests.get(url)
        # Set icon field (ImageField) to binary file
        # image = UploadedFile(BytesIO(response.content))
        image = Image(
            file=ImageFile(BytesIO(response.content), name=f'{urllib.parse.quote(url)}.png'),
            title=f'Generated map thumbnail for Dustbox {self.slug}'
        )
        image.save()
        self.map_image = image

    @property
    def seo_author(self) -> str:
        return None

class DustboxReading(models.Model):
    id = models.CharField(primary_key=True, max_length=36)
    created_at = models.DateTimeField()
    humidity = models.FloatField(null=True)
    pm1 = models.FloatField(null=True)
    pm2_5 = models.FloatField(null=True)
    pm10 = models.FloatField(null=True)
    dustbox = models.ForeignKey(Dustbox, on_delete=models.CASCADE)
    temperature = models.FloatField(null=True)

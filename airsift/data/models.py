from django.db import models
from django.contrib.gis.db.models import PointField
from wagtail.api import APIField
from wagtail.core.models import Page, Site
from wagtailseo.models import SeoMixin, SeoType
from airsift.home.models import HomePage

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

    def get_page_representation(self, site: Site):
        page = DustboxPage(
            title=self.title,
            slug=self.id,
            search_description=self.description,
            first_published_at=self.created_at,
            last_published_at=self.last_entry_at,
            canonical_url=f'{site.root_url}/dustboxes/inspect/{self.id}'
        )
        return page

class DustboxPage(SeoMixin, Page):
    template = 'dustboxes/interactive_map_page.html'
    seo_content_type=SeoType.ARTICLE

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

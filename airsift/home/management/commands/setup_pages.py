import datetime
import math

import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from wagtail.core.models import Page
from airsift.home.models import HomePage, InfoPage
from airsift.dustboxes.models import InteractiveMapPage
from airsift.datastories.models import DataStoryIndex

DATA_API_URL = settings.CITIZENSENSE_DATA_API

class Command(BaseCommand):
    help = 'Set up pages required for the platform'

    def handle(self, *args, **options):
        self.createsuperuser(
            username="Airsift",
            email=None,
            password="Airsift"
        )
        root_page_slug = 'airsift'
        root_page = self.create_and_publish_page(HomePage,
            title="Airsift",
            slug=root_page_slug
        )
        self.set_root_page_for_site(root_page)
        self.create_and_publish_page(InteractiveMapPage,
            parent_slug=root_page_slug,
            slug="dustboxes",
            title="Dustboxes",
            summary_text="Example text"
        )
        self.create_and_publish_page(InteractiveMapPage,
            parent_slug=root_page_slug,
            slug="observations",
            title="Airsift",
            summary_text="Example text"
        )
        self.create_and_publish_page(InteractiveMapPage,
            parent_slug=root_page_slug,
            slug="analysis",
            title="Airsift",
            summary_text="Example text"
        )
        self.create_and_publish_page(DataStoryIndex,
            parent_slug=root_page_slug,
            slug="datastories",
            title="Data Stories",
            summary_text="Example text"
        )
        self.create_and_publish_page(InfoPage,
            parent_slug=root_page_slug,
            slug="about",
            title="About",
            body="Example about page"
        )

    def createsuperuser(self, username: str, email: str, password: str):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(username=username)
        except:
            user = User.objects.create_superuser(username, email, password)
        return user

    def set_root_page_for_site(self, root_page):
        from wagtail.core.models import Site as WagtailSite
        wagtail_site = WagtailSite.objects.get()

        if wagtail_site.site_name != 'Airsift Development Site':
            # Create root
            root = Page.get_first_root_node()
            root.add_child(instance=root_page)

            # Configure site
            wagtail_site.hostname = "localhost"
            wagtail_site.port = 8000
            wagtail_site.site_name = "Airsift Development Site"
            wagtail_site.root_page = root_page
            wagtail_site.save()

            # Clear other pages
            Page.objects\
                .not_page(root_page)\
                .not_page(root)\
                .delete()

    def create_and_publish_page(self, type, **kwargs):
        try:
            page = Page.objects.get(slug=kwargs.get('slug', None))
        except:
            parent_slug = kwargs.pop('parent_slug', None)
            page = type(
                **kwargs
            )
            if parent_slug:
                parent = Page.objects.get(slug=parent_slug)
                parent.add_child(instance=page)
        return page

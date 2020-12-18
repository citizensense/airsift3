from django.db import models
from wagtailseo.models import SeoMixin, SeoType, TwitterCard

class TweakedSeoMixin(SeoMixin):
    class Meta:
        abstract = True

    canonical_url = models.URLField(
        blank=True,
        null=True,
        help_text="Leave blank to use the page's URL.",
        max_length=255,
        verbose_name='Canonical URL'
    )

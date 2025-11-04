from airsift.dustboxes import views
from django.urls.conf import re_path
from airsift import dustboxes
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path as url
from django.views import defaults as default_views
from django.views.generic import TemplateView
from django.shortcuts import redirect
# wagtail
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.core import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls
from wagtailautocomplete.urls.admin import urlpatterns as autocomplete_admin_urls
from .api import api_router
from .views import capture_login, capture_logout
from .media_serve import serve_media

urlpatterns = [
    # API urls
    path('api/v2/', api_router.urls),
    path('api/v2/', include('data.urls')),
    # Content management URLS
    re_path(r'^cms/login/$', capture_login),
    re_path(r'^cms/logout/$', capture_logout),
    re_path(r'^admin/autocomplete/', include(autocomplete_admin_urls)),
    path('cms/', include(wagtailadmin_urls)),
    path('', include('users.urls')),
    path("accounts/", include("allauth.urls")),
    # Content serve URLS
    path('documents/', include(wagtaildocs_urls)),
    path('', include(wagtail_urls)),
    # Django admin
    re_path(r'^admin/login/$', capture_login),
    re_path(r'^admin/logout/$', capture_logout),
    path(settings.ADMIN_URL, admin.site.urls),
    # User management URLs
    path("users/", include("airsift.users.urls", namespace="airsift-users")),
    # Content serve URLS
    path('documents/', include(wagtaildocs_urls)),
    path('', include(wagtail_urls)),
]

# Serve media files in production (when DEBUG=False, static() doesn't work)
if not settings.DEBUG:
    urlpatterns += [
        url(r'^media/(?P<path>.*)$', serve_media, name='media'),
    ]
else:
    # In development, use Django's static file serving
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        path(
            "400/",
            default_views.bad_request,
            kwargs={"exception": Exception("Bad Request!")},
        ),
        path(
            "403/",
            default_views.permission_denied,
            kwargs={"exception": Exception("Permission Denied")},
        ),
        path(
            "404/",
            default_views.page_not_found,
            kwargs={"exception": Exception("Page not Found")},
        ),
        path("500/", default_views.server_error),
    ]
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns

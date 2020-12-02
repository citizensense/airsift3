from django.urls import re_path
from django.views.generic import TemplateView

urlpatterns = [
    re_path(r'^datastories/?$', TemplateView.as_view(template_name='datastories/index.html')),
]

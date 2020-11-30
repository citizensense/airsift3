from django.urls import path, re_path
from django.views.generic.base import TemplateView
from . import views, data
from django.shortcuts import redirect

urlpatterns = [
    path('', lambda request: redirect('/dustboxes')),
    path('analysis', TemplateView.as_view(template_name='dustboxes/analysis.html')),
    re_path(r'^dustboxes', views.dustboxes),
    re_path(r'^citizensense/(.*)', data.citizensense_data)
]

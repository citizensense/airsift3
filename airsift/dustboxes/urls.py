from django.urls import path, re_path
from django.views.generic.base import TemplateView
from . import views, data

urlpatterns = [
    path('', TemplateView.as_view(template_name='dustboxes/analysis.html')),
    path('analysis', TemplateView.as_view(template_name='dustboxes/analysis.html')),
    path('dustboxes', views.dustboxes),
    re_path(r'^citizensense/(.*)', data.citizensense_data)
]

from django.urls import path
from django.views.generic.base import TemplateView
from . import views

urlpatterns = [
    path('', TemplateView.as_view(template_name='dustboxes/analysis.html')),
    path('analysis', TemplateView.as_view(template_name='dustboxes/analysis.html')),
    path('dustboxes', views.dustboxes),
]

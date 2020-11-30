from django.urls import re_path
from airsift.dustboxes import views

urlpatterns = [
    re_path(r'^observations', views.dustboxes),
]

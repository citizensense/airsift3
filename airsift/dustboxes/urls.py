from django.urls import re_path
from . import views, data

urlpatterns = [
    re_path(r'^dustboxes', views.dustboxes),
    re_path(r'^citizensense/(.*)', data.citizensense_data)
]

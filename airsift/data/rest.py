from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework_nested import routers
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import pagination
from rest_framework import generics
from rest_framework import filters
class ItemSetPagination(pagination.LimitOffsetPagination):
     default_limit = 1

from airsift.data import models, serializers
class DustboxesViewSet(ReadOnlyModelViewSet):
    queryset = models.Dustbox.objects.all()
    serializer_class = serializers.DustboxSerializer

class DustboxesReadingsViewSet(ReadOnlyModelViewSet):
    queryset = models.DustboxReading.objects.all()
    serializer_class = serializers.DustboxReadingSerializer
    pagination_class = ItemSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return self.queryset.filter(dustbox=self.kwargs['dustbox_pk'])

router = routers.DefaultRouter()
router.register(r'dustboxes', DustboxesViewSet, basename='dustboxes')

dustbox_router = routers.NestedSimpleRouter(router, r'dustboxes', lookup='dustbox')
dustbox_router.register(r'readings', DustboxesReadingsViewSet, basename='readings')

urls = [
    *router.urls,
    *dustbox_router.urls
]
